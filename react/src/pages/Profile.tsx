import { useEffect, useState, type SubmitEvent } from 'react'
import { useOutletContext } from 'react-router-dom'

import { Mail, CalendarDays, CircleAlert, CircleCheck, Save, RefreshCw, Server } from 'lucide-react'

import { request, checkHealth } from '../api'
import type { User, Health } from '../api'
import type { LayoutContext } from '../components/Layout'
import { formatDate } from '../utils'

function Profile() {
  const { setUser } = useOutletContext<LayoutContext>()

  const [profile, setProfile] = useState<User | null>(null)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const [health, setHealth] = useState<Health | null>(null)
  const [healthError, setHealthError] = useState('')
  const [healthCheck, setHealthCheck] = useState(0)

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await request<User>('/users/me')
        setProfile(data)
        setName(data.name)
      } catch (err) {
        setError((err as Error).message)
      }
    }
    loadProfile()
  }, [])

  useEffect(() => {
    async function loadHealth() {
      try {
        const data = await checkHealth()
        setHealth(data)
        setHealthError('')
      } catch (err) {
        setHealth(null)
        setHealthError((err as Error).message)
      }
    }
    loadHealth()
  }, [healthCheck])

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSaved(false)
    try {
      const updated = await request<User>('/users/me', 'PATCH', { name })
      setProfile(updated)
      setUser(updated)
      setSaved(true)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  if (!profile) {
    return error ? (
      <p className="error">
        <CircleAlert size={18} />
        {error}
      </p>
    ) : (
      <p className="loading">Боргирӣ...</p>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1>Профил</h1>
        <p>Маълумоти аккаунти шумо</p>
      </div>

      <div className="details-grid">
        <div className="card profile-card">
          <div className="profile-top">
            <div className="avatar avatar-lg">{profile.name[0]}</div>
            <div>
              <h2>{profile.name}</h2>
              <p className="profile-line">
                <Mail size={15} />
                {profile.email}
              </p>
              <p className="profile-line">
                <CalendarDays size={15} />
                Аъзо аз {formatDate(profile.created_at)}
              </p>
            </div>
          </div>

          <form className="payment-form" onSubmit={handleSubmit}>
            {error && (
              <p className="error">
                <CircleAlert size={18} />
                {error}
              </p>
            )}

            {saved && (
              <p className="success">
                <CircleCheck size={18} />
                Ном сабт шуд
              </p>
            )}

            <label className="field">
              Ном
              <input
                className="input"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setSaved(false)
                }}
                required
              />
            </label>

            <label className="field">
              Email
              <input className="input" value={profile.email} disabled />
            </label>

            <button type="submit" className="btn btn-primary">
              <Save size={18} />
              Сабт кардан
            </button>
          </form>
        </div>

        <div className="card">
          <h2 className="card-title">Ҳолати сервер</h2>

          <div className="health">
            <div className={health ? 'health-icon ok' : 'health-icon down'}>
              <Server size={22} />
            </div>

            <div className="health-info">
              <b>
                <span className={health ? 'health-dot ok' : 'health-dot down'}></span>
                {health ? 'Кор мекунад' : 'Ҷавоб намедиҳад'}
              </b>
              <small>
                {health ? 'Вақти сервер: ' + new Date(health.time).toLocaleString('ru-RU') : healthError}
              </small>
            </div>
          </div>

          <button className="btn btn-ghost btn-block" onClick={() => setHealthCheck(healthCheck + 1)}>
            <RefreshCw size={18} />
            Санҷидан
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile