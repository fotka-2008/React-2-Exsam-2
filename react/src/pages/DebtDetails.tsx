import { useEffect, useState, type SubmitEvent } from 'react'

import { Link, useParams } from 'react-router-dom'

import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  CircleAlert,
  CircleCheck,
  Plus,
  Receipt,
} from 'lucide-react'

import { request } from '../api'
import type { Contact, Debt, Payment } from '../api'
import { STATUS_LABELS, formatMoney, formatDate, today } from '../utils'

function DebtDetails() {
  const { id } = useParams()

  const [debt, setDebt] = useState<Debt | null>(null)
  const [contact, setContact] = useState<Contact | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])

  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [paidAt, setPaidAt] = useState(today())

  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    async function loadAll() {
      try {
        const debtData = await request<Debt>('/debts/' + id)
        setDebt(debtData)

        const contactData = await request<Contact>('/contacts/' + debtData.contact_id)
        setContact(contactData)

        const paymentsData = await request<Payment[]>('/debts/' + id + '/payments')
        setPayments(paymentsData)
      } catch (err) {
        setError((err as Error).message)
      }
    }
    loadAll()
  }, [id, reload])

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    const body: Record<string, string | number> = {
      amount: Number(amount),
      paid_at: new Date(paidAt).toISOString(),
    }
    if (note) body.note = note

    try {
      await request<Payment>('/debts/' + id + '/payments', 'POST', body)
      setAmount('')
      setNote('')
      setPaidAt(today())
      setReload(reload + 1)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  if (!debt) {
    return (
      <div>
        <Link to="/debts" className="back-link">
          <ArrowLeft size={18} />
          Ба қарзҳо
        </Link>
        {error ? (
          <p className="error">
            <CircleAlert size={18} />
            {error}
          </p>
        ) : (
          <p className="loading">Боргирӣ...</p>
        )}
      </div>
    )
  }

  let paid = 0
  for (let i = 0; i < payments.length; i++) {
    paid = paid + Number(payments[i].amount)
  }

  const total = Number(debt.amount)
  const remaining = Math.max(total - paid, 0)
  const percent = Math.min(Math.round((paid / total) * 100), 100)

  const isIncoming = debt.direction === 'they_owe_me'
  const isOverdue = debt.due_date !== null && debt.due_date.slice(0, 10) < today() && debt.status !== 'paid'

  return (
    <div>
      <Link to="/debts" className="back-link">
        <ArrowLeft size={18} />
        Ба қарзҳо
      </Link>

      <div className="card debt-hero">
        <div className="debt-hero-top">
          <div className={isIncoming ? 'debt-icon incoming' : 'debt-icon outgoing'}>
            {isIncoming ? <ArrowDownLeft size={22} /> : <ArrowUpRight size={22} />}
          </div>

          <div className="debt-hero-title">
            <h1>{contact ? contact.name : '...'}</h1>
            <p>
              {isIncoming ? 'Ба шумо қарздор аст' : 'Шумо қарздоред'}
              {debt.description && ' · ' + debt.description}
            </p>
          </div>

          <span className={'status status-' + debt.status}>{STATUS_LABELS[debt.status]}</span>
        </div>

        <div className="stat-row">
          <div className="stat">
            <span>Маблағи қарз</span>
            <b>{formatMoney(total)}</b>
          </div>
          <div className="stat">
            <span>Пардохт шуд</span>
            <b className="text-green">{formatMoney(paid)}</b>
          </div>
          <div className="stat">
            <span>Боқимонда</span>
            <b className={remaining > 0 ? 'text-red' : 'text-green'}>{formatMoney(remaining)}</b>
          </div>
        </div>

        <div className="progress">
          <div className="progress-bar" style={{ width: percent + '%' }}></div>
        </div>

        <div className="debt-hero-bottom">
          <span>{percent}% пардохт шуд</span>
          <span className={isOverdue ? 'debt-date overdue' : 'debt-date'}>
            <CalendarDays size={15} />
            Мӯҳлат: {formatDate(debt.due_date)}
          </span>
        </div>
      </div>

      {error && (
        <p className="error" style={{ marginTop: 16 }}>
          <CircleAlert size={18} />
          {error}
        </p>
      )}

      <div className="details-grid">
        <div className="card">
          <h2 className="card-title">Пардохтҳо ({payments.length})</h2>

          {payments.length === 0 && <p className="muted-text">Ҳоло пардохт нест.</p>}

          <div className="payment-list">
            {payments.map((payment) => (
              <div key={payment.id} className="payment-item">
                <div className="payment-icon">
                  <Receipt size={18} />
                </div>
                <div className="payment-info">
                  <b>{formatMoney(payment.amount)}</b>
                  <span>{payment.note || 'Пардохт'}</span>
                </div>
                <span className="payment-date">{formatDate(payment.paid_at)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Пардохти нав</h2>

          {debt.status === 'paid' ? (
            <div className="paid-message">
              <CircleCheck size={40} strokeWidth={1.5} />
              <b>Қарз пурра пардохт шуд</b>
            </div>
          ) : (
            <form className="payment-form" onSubmit={handleSubmit}>
              <label className="field">
                Маблағ (сомонӣ) *
                <input
                  className="input"
                  type="number"
                  min="0.01"
                  max={remaining}
                  step="0.01"
                  placeholder={String(remaining)}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </label>

              <label className="field">
                Сана
                <input className="input" type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} required />
              </label>

              <label className="field">
                Эзоҳ
                <input
                  className="input"
                  placeholder="Масалан: нақд"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </label>

              <button type="submit" className="btn btn-primary btn-block">
                <Plus size={18} />
                Илова кардан
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default DebtDetails