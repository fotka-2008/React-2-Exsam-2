import { useEffect, useState } from 'react'

import { Link, useParams } from 'react-router-dom'

import { ArrowLeft, Folder as FolderIcon, Users, Phone, Mail, CircleAlert, CalendarDays } from 'lucide-react'

import { request } from '../api'
import type { Folder, Contact } from '../api'
import { formatDate } from '../utils'

function FolderDetails() {
  const { id } = useParams()

  const [folder, setFolder] = useState<Folder | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadAll() {
      try {
        const folderData = await request<Folder>('/folders/' + id)
        setFolder(folderData)

        const contactsData = await request<Contact[]>('/contacts?folder_id=' + id)
        setContacts(contactsData)
      } catch (err) {
        setError((err as Error).message)
      }
    }
    loadAll()
  }, [id])

  if (!folder) {
    return (
      <div>
        <Link to="/folders" className="back-link">
          <ArrowLeft size={18} />
          Ба папкаҳо
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

  return (
    <div>
      <Link to="/folders" className="back-link">
        <ArrowLeft size={18} />
        Ба папкаҳо
      </Link>

      <div className="card detail-header">
        <div className="detail-icon" style={{ background: folder.color + '1a', color: folder.color }}>
          <FolderIcon size={30} />
        </div>

        <div className="detail-title">
          <h1>{folder.name}</h1>
          <p>
            <CalendarDays size={15} />
            Сохта шуд: {formatDate(folder.created_at)}
          </p>
        </div>

        <div className="detail-count">
          <b>{contacts.length}</b>
          <span>контакт</span>
        </div>
      </div>

      <h2 className="section-title">Контактҳои ин папка</h2>

      {contacts.length === 0 && (
        <div className="empty">
          <Users size={48} strokeWidth={1.5} />
          <h3>Дар ин папка контакт нест</h3>
          <p>
            Дар саҳифаи <Link to="/contacts">Контактҳо</Link> ба контакт ҳамин папкаро интихоб кунед
          </p>
        </div>
      )}

      <div className="contact-grid">
        {contacts.map((contact) => (
          <div key={contact.id} className="contact-card">
            <div className="contact-top">
              <div className="contact-avatar" style={{ background: folder.color }}>
                {contact.name[0]}
              </div>
              <div className="contact-name">
                <Link to={'/contacts/' + contact.id} className="title-link">
                  <h3>{contact.name}</h3>
                </Link>
              </div>
            </div>

            <div className="contact-details">
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
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FolderDetails