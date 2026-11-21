import { useEffect, useState, type SubmitEvent } from 'react'
import { Link } from 'react-router-dom'

import { Folder as FolderIcon, FolderOpen, Plus, Check, X, Pencil, Trash2, CircleAlert } from 'lucide-react'

import { request } from '../api'
import type { Folder } from '../api'

const DEFAULT_COLOR = '#6366f1'

function Folders() {
  const [folders, setFolders] = useState<Folder[]>([])
  const [name, setName] = useState('')
  const [color, setColor] = useState(DEFAULT_COLOR)
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
  }, [reload])

  function resetForm() {
    setEditingId(null)
    setName('')
    setColor(DEFAULT_COLOR)
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    try {
      if (editingId) {
        await request<Folder>('/folders/' + editingId, 'PATCH', { name, color })
      } else {
        await request<Folder>('/folders', 'POST', { name, color })
      }
      resetForm()
      setReload(reload + 1)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  function startEdit(folder: Folder) {
    setEditingId(folder.id)
    setName(folder.name)
    setColor(folder.color || DEFAULT_COLOR)
  }

  async function handleDelete(id: string) {
    if (!confirm('Ин папкаро нест кунам?')) return
    setError('')
    try {
      await request('/folders/' + id, 'DELETE')
      setReload(reload + 1)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Папкаҳо</h1>
        <p>Контактҳоро ба гурӯҳҳо тақсим кунед: оила, дӯстон, кор</p>
      </div>

      {error && (
        <p className="error" style={{ marginBottom: 16 }}>
          <CircleAlert size={18} />
          {error}
        </p>
      )}

      <form className="card folder-form" onSubmit={handleSubmit}>
        <input
          className="input"
          type="text"
          placeholder="Номи папка, масалан: Оила"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label className="color-picker" style={{ background: color }} title="Ранг интихоб кунед">
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </label>

        <button type="submit" className="btn btn-primary">
          {editingId ? <Check size={18} /> : <Plus size={18} />}
          {editingId ? 'Сабт кардан' : 'Илова кардан'}
        </button>

        {editingId && (
          <button type="button" className="btn btn-ghost" onClick={resetForm}>
            <X size={18} />
            Бекор
          </button>
        )}
      </form>

      {folders.length === 0 && (
        <div className="empty">
          <FolderOpen size={48} strokeWidth={1.5} />
          <h3>Ҳоло папка нест</h3>
          <p>Аввалин папкаи худро дар боло созед</p>
        </div>
      )}

      <div className="folder-grid">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className={editingId === folder.id ? 'folder-card editing' : 'folder-card'}
          >
            <div className="folder-icon" style={{ background: folder.color + '1a', color: folder.color }}>
              <FolderIcon size={22} />
            </div>

            <div className="folder-info">
              <Link to={'/folders/' + folder.id} className="title-link">
                <h3>{folder.name}</h3>
              </Link>
              <span>Сохта шуд: {new Date(folder.created_at).toLocaleDateString('ru-RU')}</span>
            </div>

            <div className="folder-actions">
              <button className="icon-btn" onClick={() => startEdit(folder)} title="Таҳрир">
                <Pencil size={16} />
              </button>
              <button className="icon-btn danger" onClick={() => handleDelete(folder.id)} title="Нест кардан">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Folders