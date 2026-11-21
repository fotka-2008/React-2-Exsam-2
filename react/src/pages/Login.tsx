import { useState, type SubmitEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Wallet, Mail, Lock, LogIn, CircleAlert } from 'lucide-react'

import { login } from '../api'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
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
        <h1>Қарзҳоятонро осон назорат кунед</h1>
        <p>Кӣ ба шумо қарздор аст ва шумо ба кӣ — ҳама дар як ҷо, бо мӯҳлат ва пардохтҳо.</p>
      </div>

      <div className="auth-side">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <h2>Хуш омадед</h2>
            <p className="auth-switch" style={{ textAlign: 'left', marginTop: 6 }}>
              Ба аккаунти худ дароед
            </p>
          </div>

          {error && (
            <p className="error">
              <CircleAlert size={18} />
              {error}
            </p>
          )}

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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </label>

          <button type="submit" className="btn btn-primary btn-block">
            <LogIn size={18} />
            Даромадан
          </button>

          <p className="auth-switch">
            Аккаунт надоред? <Link to="/register">Сабти ном</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login