import { useEffect, useState, type SubmitEvent } from 'react'
import { Link } from 'react-router-dom'

import { Plus, Phone, Mail, Pencil, Trash2, Users, X, CircleAlert, StickyNote } from 'lucide-react'

import { request } from '../api'
import type { Contact, Folder } from '../api'

function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [folders, setFolders] = useState<Folder[]>([])

  const [folderFilter, setFolderFilter] = useState('')

  const [showForm, setShowForm] = useState(false)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')
  const [folderId, setFolderId] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)

  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    async function loadFolders() {
      try {
        const data = await request<Folder[]>('/folders')
        setFolders(data)
      } catch (err) {
        setError((err as Error).message)
      }
    }
    loadFolders()
  }, [])

  useEffect(() => {
    async function loadContacts() {
      try {
        let path = '/contacts'
        if (folderFilter) {
          path = path + '?folder_id=' + folderFilter
        }
        const data = await request<Contact[]>(path)
        setContacts(data)
      } catch (err) {
        setError((err as Error).message)
      }
    }
    loadContacts()
  }, [reload, folderFilter])

  function findFolder(id: string | null) {
    for (let i = 0; i < folders.length; i++) {
      if (folders[i].id === id) {
        return folders[i]
      }
    }
    return null
  }

  function openCreate() {
    setEditingId(null)
    setName('')
    setPhone('')
    setEmail('')
    setNote('')
    setFolderId(folderFilter)
    setError('')
    setShowForm(true)
  }

  function openEdit(contact: Contact) {
    setEditingId(contact.id)
    setName(contact.name)
    setPhone(contact.phone || '')
    setEmail(contact.email || '')
    setNote(contact.note || '')
    setFolderId(contact.folder_id || '')
    setError('')
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    const body: Record<string, string> = { name }
    if (phone) body.phone = phone
    if (email) body.email = email
    if (note) body.note = note
    if (folderId) body.folder_id = folderId

    try {
      if (editingId) {
        await request<Contact>('/contacts/' + editingId, 'PATCH', body)
      } else {
        await request<Contact>('/contacts', 'POST', body)
      }
      setShowForm(false)
      setReload(reload + 1)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Ин контактро нест кунам?')) return
    setError('')
    try {
      await request('/contacts/' + id, 'DELETE')
      setReload(reload + 1)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div>
      <div className="page-header page-header-row">
        <div>
          <h1>Контактҳо</h1>
          <p>Одамоне, ки ба шумо қарздоранд ё шумо ба онҳо</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} />
          Контакти нав
        </button>
      </div>

      {error && !showForm && (
        <p className="error" style={{ marginBottom: 16 }}>
          <CircleAlert size={18} />
          {error}
        </p>
      )}

      <div className="chips">
        <button
          className={folderFilter === '' ? 'chip active' : 'chip'}
          onClick={() => setFolderFilter('')}
        >
          Ҳама
        </button>

        {folders.map((folder) => (
          <button
            key={folder.id}
            className={folderFilter === folder.id ? 'chip active' : 'chip'}
            onClick={() => setFolderFilter(folder.id)}
          >
            <span className="dot" style={{ background: folder.color }}></span>
            {folder.name}
          </button>
        ))}
      </div>

      {contacts.length === 0 && (
        <div className="empty">
          <Users size={48} strokeWidth={1.5} />
          <h3>Контакт нест</h3>
          <p>Тугмаи «Контакти нав»-ро пахш кунед</p>
        </div>
      )}

      <div className="contact-grid">
        {contacts.map((contact) => {
          const folder = findFolder(contact.folder_id)

          return (
            <div key={contact.id} className="contact-card">
              <div className="contact-top">
                <div
                  className="contact-avatar"
                  style={folder ? { background: folder.color } : undefined}
                >
                  {contact.name[0]}
                </div>

                <div className="contact-name">
                  <Link to={'/contacts/' + contact.id} className="title-link">
                    <h3>{contact.name}</h3>
                  </Link>
                  {folder && (
                    <span className="badge" style={{ background: folder.color + '1a', color: folder.color }}>
                      {folder.name}
                    </span>
                  )}
                </div>

                <div className="folder-actions">
                  <button className="icon-btn" onClick={() => openEdit(contact)} title="Таҳрир">
                    <Pencil size={16} />
                  </button>
                  <button className="icon-btn danger" onClick={() => handleDelete(contact.id)} title="Нест кардан">
                    <Trash2 size={16} />
                  </button>
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
                {contact.note && (
                  <span className="contact-note">
                    <StickyNote size={15} />
                    {contact.note}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <form className="modal" onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Таҳрири контакт' : 'Контакти нав'}</h2>
              <button type="button" className="icon-btn" onClick={closeForm}>
                <X size={20} />
              </button>
            </div>

            {error && (
              <p className="error">
                <CircleAlert size={18} />
                {error}
              </p>
            )}

            <label className="field">
              Ном *
              <input
                className="input"
                placeholder="Масалан: Алишер"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>

            <div className="form-row">
              <label className="field">
                Телефон
                <input
                  className="input"
                  placeholder="+992 90 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>

              <label className="field">
                Email
                <input
                  className="input"
                  type="email"
                  placeholder="name@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            </div>

            <label className="field">
              Папка
              <select className="input" value={folderId} onChange={(e) => setFolderId(e.target.value)}>
                <option value="">Бе папка</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              Эзоҳ
              <textarea
                className="input"
                rows={3}
                placeholder="Масалан: ҳамсинф, аз мактаб"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </label>

            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={closeForm}>
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

export default Contacts