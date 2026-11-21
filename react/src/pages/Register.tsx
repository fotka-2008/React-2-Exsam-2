import { useState, type SubmitEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Wallet, User, Mail, Lock, UserPlus, CircleAlert } from 'lucide-react'
import { register } from '../api'

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    try {
      await register(name, email, password)
      navigate('/')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="logo">
          <div className="logo-icon">
            <Wallet size={22} />
          </div>
          Debt Tracker
        </div>
        <h1>Ҳисобу китоби қарзҳо — бе дафтар</h1>
        <p>Аккаунт созед ва дар як дақиқа аввалин қарзатонро сабт кунед.</p>
      </div>

      <div className="auth-side">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <h2>Сабти ном</h2>
            <p className="auth-switch" style={{ textAlign: 'left', marginTop: 6 }}>
              Аккаунти нав созед
            </p>
          </div>

          {error && (
            <p className="error">
              <CircleAlert size={18} />
              {error}
            </p>
          )}

          <label className="field">
            Ном
            <div className="input-icon">
              <User size={18} />
              <input
                className="input"
                type="text"
                placeholder="Номи шумо"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </label>

          <label className="field">
            Email
            <div className="input-icon">
              <Mail size={18} />
              <input
                className="input"
                type="email"
                placeholder="name@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </label>

          <label className="field">
            Парол
            <div className="input-icon">
              <Lock size={18} />
              <input
                className="input"
                type="password"
                placeholder="Ақаллан 6 аломат"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
          </label>

          <button type="submit" className="btn btn-primary btn-block">
            <UserPlus size={18} />
            Сабти ном
          </button>

          <p className="auth-switch">
            Аккаунт доред? <Link to="/login">Даромадан</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Register