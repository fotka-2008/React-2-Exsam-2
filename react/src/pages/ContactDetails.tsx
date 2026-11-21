import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Phone,
  Mail,
  StickyNote,
  CalendarDays,
  CircleAlert,
  HandCoins,
} from 'lucide-react'

import { request } from '../api'
import type { Contact, Folder, Debt } from '../api'
import { STATUS_LABELS, formatMoney, formatDate, today } from '../utils'

function ContactDetails() {
  const { id } = useParams()

  const [contact, setContact] = useState<Contact | null>(null)
  const [folder, setFolder] = useState<Folder | null>(null)
  const [debts, setDebts] = useState<Debt[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadAll() {
      try {
        const contactData = await request<Contact>('/contacts/' + id)
        setContact(contactData)

        if (contactData.folder_id) {
          const folderData = await request<Folder>('/folders/' + contactData.folder_id)
          setFolder(folderData)
        }

        const debtsData = await request<Debt[]>('/debts?contact_id=' + id)
        setDebts(debtsData)
      } catch (err) {
        setError((err as Error).message)
      }
    }
    loadAll()
  }, [id])

  if (!contact) {
    return (
      <div>
        <Link to="/contacts" className="back-link">
          <ArrowLeft size={18} />
          Ба контактҳо
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

  let toMe = 0
  let fromMe = 0
  for (let i = 0; i < debts.length; i++) {
    if (debts[i].status !== 'paid') {
      if (debts[i].direction === 'they_owe_me') {
        toMe = toMe + Number(debts[i].amount)
      } else {
        fromMe = fromMe + Number(debts[i].amount)
      }
    }
  }

  return (
    <div>
      <Link to="/contacts" className="back-link">
        <ArrowLeft size={18} />
        Ба контактҳо
      </Link>

      <div className="card detail-header">
        <div className="contact-avatar avatar-lg" style={folder ? { background: folder.color } : undefined}>
          {contact.name[0]}
        </div>

        <div className="detail-title">
          <h1>{contact.name}</h1>

          {folder && (
            <Link
              to={'/folders/' + folder.id}
              className="badge"
              style={{ background: folder.color + '1a', color: folder.color }}
            >
              {folder.name}
            </Link>
          )}

          <div className="contact-details detail-lines">
            {contact.phone && (
              <span>
                <Phone size={15} />
                {contact.phone}
              </span>
            )}
            {contact.email && (
              <span>
                <Mail size={15} />
                {contact.email}
              </span>
            )}
            {contact.note && (
              <span className="contact-note">
                <StickyNote size={15} />
                {contact.note}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="stat-row two">
        <div className="stat">
          <span>Қарзҳои кушода: ба ман</span>
          <b className="text-green">{formatMoney(toMe)}</b>
        </div>
        <div className="stat">
          <span>Қарзҳои кушода: аз ман</span>
          <b className="text-red">{formatMoney(fromMe)}</b>
        </div>
      </div>

      <h2 className="section-title">Қарзҳо ({debts.length})</h2>

      {debts.length === 0 && (
        <div className="empty">
          <HandCoins size={48} strokeWidth={1.5} />
          <h3>Бо ин контакт қарз нест</h3>
          <p>
            Қарзро дар саҳифаи <Link to="/debts">Қарзҳо</Link> созед
          </p>
        </div>
      )}

      {debts.length > 0 && (
        <div className="debt-list">
          {debts.map((debt) => {
            const isIncoming = debt.direction === 'they_owe_me'
            const isOverdue = debt.due_date !== null && debt.due_date.slice(0, 10) < today() && debt.status !== 'paid'

            return (
              <Link key={debt.id} to={'/debts/' + debt.id} className="debt-row">
                <div className={isIncoming ? 'debt-icon incoming' : 'debt-icon outgoing'}>
                  {isIncoming ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                </div>

                <div className="debt-info">
                  <h3>{debt.description || (isIncoming ? 'Ба ман қарздор' : 'Ман қарздорам')}</h3>
                  <span>Сохта шуд: {formatDate(debt.created_at)}</span>
                </div>

                <span className={isOverdue ? 'debt-date overdue' : 'debt-date'}>
                  <CalendarDays size={15} />
                  {formatDate(debt.due_date)}
                </span>

                <span className={'status status-' + debt.status}>{STATUS_LABELS[debt.status]}</span>

                <b className={isIncoming ? 'amount incoming' : 'amount outgoing'}>
                  {isIncoming ? '+' : '−'}
                  {formatMoney(debt.amount)}
                </b>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ContactDetails