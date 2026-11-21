import { useEffect, useState } from 'react'

import { NavLink, Outlet, useNavigate } from 'react-router-dom'

import { Wallet, LayoutDashboard, Folder, Users, HandCoins, LogOut } from 'lucide-react'

import { request, logout } from '../api'
import type { User } from '../api'

export type LayoutContext = {
  user: User | null
  setUser: (user: User) => void
}

function Layout() {
  const [user, setUser] = useState<User | null>(null)

  const navigate = useNavigate()

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await request<User>('/users/me')
        setUser(data)
      } catch (err) {
        console.log((err as Error).message)
      }
    }
    loadUser()
  }, [])

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">
            <Wallet size={22} />
          </div>
          <span>Debt Tracker</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end className="nav-link">
            <LayoutDashboard size={20} />
            <span>Асосӣ</span>
          </NavLink>
          <NavLink to="/folders" className="nav-link">
            <Folder size={20} />
            <span>Папкаҳо</span>
          </NavLink>
          <NavLink to="/contacts" className="nav-link">
            <Users size={20} />
            <span>Контактҳо</span>
          </NavLink>
          <NavLink to="/debts" className="nav-link">
            <HandCoins size={20} />
            <span>Қарзҳо</span>
          </NavLink>
        </nav>

        <div className="sidebar-user">
          <NavLink to="/profile" className="sidebar-profile" title="Профил">
            <div className="avatar">{user?.name[0]}</div>

            <div className="user-info">
              <b>{user?.name}</b>
              <small>{user?.email}</small>
            </div>
          </NavLink>

          <button className="icon-btn danger" onClick={handleLogout} title="Баромадан">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <main className="main">
        <Outlet context={{ user, setUser }} />
      </main>
    </div>
  )
}

export default Layout