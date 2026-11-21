import { useEffect, useState, type SubmitEvent } from 'react'
import { Link } from 'react-router-dom'

import { Plus, Pencil, Trash2, X, CircleAlert, HandCoins, CalendarDays, ArrowDownLeft, ArrowUpRight } from 'lucide-react'

import { request } from '../api'
import type { Contact, Debt, DebtDirection, DebtStatus } from '../api'
import { STATUS_LABELS, formatMoney, formatDate, today } from '../utils'

function Debts() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])

  const [directionFilter, setDirectionFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [contactFilter, setContactFilter] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [contactId, setContactId] = useState('')
  const [direction, setDirection] = useState<DebtDirection>('they_owe_me')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState<DebtStatus>('pending')

  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    async function loadContacts() {
      try {
        const data = await request<Contact[]>('/contacts')
        setContacts(data)
      } catch (err) {
        setError((err as Error).message)
      }
    }
    loadContacts()
  }, [])

  useEffect(() => {
    async function loadDebts() {
      try {
        const params = new URLSearchParams()
        if (statusFilter) params.append('status', statusFilter)
        if (contactFilter) params.append('contact_id', contactFilter)
        if (directionFilter) params.append('direction', directionFilter)

        const query = params.toString()
        const path = query ? '/debts?' + query : '/debts'

        const data = await request<Debt[]>(path)
        setDebts(data)
      } catch (err) {
        setError((err as Error).message)
      }
    }
    loadDebts()
  }, [reload, statusFilter, contactFilter, directionFilter])

  function findContact(id: string) {
    for (let i = 0; i < contacts.length; i++) {
      if (contacts[i].id === id) {
        return contacts[i]
      }
    }
    return null
  }

  function openCreate() {
    setEditingId(null)
    setContactId(contactFilter)
    setDirection('they_owe_me')
    setAmount('')
    setDescription('')
    setDueDate('')
    setStatus('pending')
    setError('')
    setShowForm(true)
  }

  function openEdit(debt: Debt) {
    setEditingId(debt.id)
    setContactId(debt.contact_id)
    setDirection(debt.direction)
    setAmount(String(debt.amount))
    setDescription(debt.description || '')
    setDueDate(debt.due_date ? debt.due_date.slice(0, 10) : '')
    setStatus(debt.status)
    setError('')
    setShowForm(true)
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    const body: Record<string, string | number> = {
      contact_id: contactId,
      direction: direction,
      amount: Number(amount),
      currency: 'TJS',
    }
    if (description) body.description = description
    if (dueDate) body.due_date = dueDate

    try {
      if (editingId) {
        body.status = status
        await request<Debt>('/debts/' + editingId, 'PATCH', body)
      } else {
        await request<Debt>('/debts', 'POST', body)
      }
      setShowForm(false)
      setReload(reload + 1)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Ин қарзро нест кунам? Ҳамаи пардохтҳояш ҳам нест мешаванд.')) return
    setError('')
    try {
      await request('/debts/' + id, 'DELETE')
      setReload(reload + 1)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div>
      <div className="page-header page-header-row">
        <div>
          <h1>Қарзҳо</h1>
          <p>Ҳамаи қарзҳо — ба шумо ва аз шумо</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} />
          Қарзи нав
        </button>
      </div>

      {error && !showForm && (
        <p className="error" style={{ marginBottom: 16 }}>
          <CircleAlert size={18} />
          {error}
        </p>
      )}

      <div className="chips">
        <button className={directionFilter === '' ? 'chip active' : 'chip'} onClick={() => setDirectionFilter('')}>
          Ҳама
        </button>
        <button
          className={directionFilter === 'they_owe_me' ? 'chip active' : 'chip'}
          onClick={() => setDirectionFilter('they_owe_me')}
        >
          <ArrowDownLeft size={16} />
          Ба ман қарздоранд
        </button>
        <button
          className={directionFilter === 'i_owe_them' ? 'chip active' : 'chip'}
          onClick={() => setDirectionFilter('i_owe_them')}
        >
          <ArrowUpRight size={16} />
          Ман қарздорам
        </button>
      </div>

      <div className="filters">
        <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Ҳамаи ҳолатҳо</option>
          <option value="pending">{STATUS_LABELS.pending}</option>
          <option value="partial">{STATUS_LABELS.partial}</option>
          <option value="paid">{STATUS_LABELS.paid}</option>
        </select>

        <select className="input" value={contactFilter} onChange={(e) => setContactFilter(e.target.value)}>
          <option value="">Ҳамаи контактҳо</option>
          {contacts.map((contact) => (
            <option key={contact.id} value={contact.id}>
              {contact.name}
            </option>
          ))}
        </select>
      </div>

      {debts.length === 0 && (
        <div className="empty">
          <HandCoins size={48} strokeWidth={1.5} />
          <h3>Қарз нест</h3>
          <p>Тугмаи «Қарзи нав»-ро пахш кунед</p>
        </div>
      )}

      {debts.length > 0 && (
        <div className="debt-list">
          {debts.map((debt) => {
            const contact = findContact(debt.contact_id)
            const isIncoming = debt.direction === 'they_owe_me'
            const isOverdue = debt.due_date !== null && debt.due_date.slice(0, 10) < today() && debt.status !== 'paid'

            return (
              <div key={debt.id} className="debt-row">
                <div className={isIncoming ? 'debt-icon incoming' : 'debt-icon outgoing'}>
                  {isIncoming ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                </div>

                <Link to={'/debts/' + debt.id} className="debt-info">
                  <h3>{contact ? contact.name : 'Контакт'}</h3>
                  <span>{debt.description || (isIncoming ? 'Ба ман қарздор' : 'Ман қарздорам')}</span>
                </Link>

                <span className={isOverdue ? 'debt-date overdue' : 'debt-date'}>
                  <CalendarDays size={15} />
                  {formatDate(debt.due_date)}
                </span>

                <span className={'status status-' + debt.status}>{STATUS_LABELS[debt.status]}</span>

                <b className={isIncoming ? 'amount incoming' : 'amount outgoing'}>
                  {isIncoming ? '+' : '−'}
                  {formatMoney(debt.amount)}
                </b>

                <div className="folder-actions">
                  <button className="icon-btn" onClick={() => openEdit(debt)} title="Таҳрир">
                    <Pencil size={16} />
                  </button>
                  <button className="icon-btn danger" onClick={() => handleDelete(debt.id)} title="Нест кардан">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <form className="modal" onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Таҳрири қарз' : 'Қарзи нав'}</h2>
              <button type="button" className="icon-btn" onClick={() => setShowForm(false)}>
                <X size={20} />
              </button>
            </div>

            {error && (
              <p className="error">
                <CircleAlert size={18} />
                {error}
              </p>
            )}

            {contacts.length === 0 && (
              <p className="error">
                <CircleAlert size={18} />
                Аввал дар саҳифаи «Контактҳо» контакт созед.
              </p>
            )}

            <div className="segmented">
              <button
                type="button"
                className={direction === 'they_owe_me' ? 'active incoming' : ''}
                onClick={() => setDirection('they_owe_me')}
              >
                <ArrowDownLeft size={18} />
                Ба ман қарздор
              </button>
              <button
                type="button"
                className={direction === 'i_owe_them' ? 'active outgoing' : ''}
                onClick={() => setDirection('i_owe_them')}
              >
                <ArrowUpRight size={18} />
                Ман қарздорам
              </button>
            </div>

            <label className="field">
              Контакт *
              <select className="input" value={contactId} onChange={(e) => setContactId(e.target.value)} required>
                <option value="">Контактро интихоб кунед</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="form-row">
              <label className="field">
                Маблағ (сомонӣ) *
                <input
                  className="input"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </label>

              <label className="field">
                Мӯҳлат
                <input className="input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </label>
            </div>

            <label className="field">
              Тавсиф
              <input
                className="input"
                placeholder="Масалан: барои телефон"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>

            {editingId && (
              <label className="field">
                Ҳолат
                <select className="input" value={status} onChange={(e) => setStatus(e.target.value as DebtStatus)}>
                  <option value="pending">{STATUS_LABELS.pending}</option>
                  <option value="partial">{STATUS_LABELS.partial}</option>
                  <option value="paid">{STATUS_LABELS.paid}</option>
                </select>
              </label>
            )}

            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
                Бекор
              </button>
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Сабт кардан' : 'Илова кардан'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default Debts