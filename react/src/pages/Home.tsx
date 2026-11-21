import { useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'

import {
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Users,
  CalendarClock,
  ChartPie,
  CircleAlert,
  CircleCheck,
} from 'lucide-react'

import { request } from '../api'
import type { DashboardSummary } from '../api'
import type { LayoutContext } from '../components/Layout'
import { STATUS_LABELS, formatMoney, formatDate, today } from '../utils'

function daysLeft(date: string) {
  const due = new Date(date.slice(0, 10)).getTime()
  const now = new Date(today()).getTime()
  return Math.round((due - now) / 86400000)
}

function todayLong() {
  return new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

function percent(part: number, total: number) {
  if (total === 0) return 0
  return Math.round((part / total) * 100)
}

function Home() {
  const { user } = useOutletContext<LayoutContext>()

  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadSummary() {
      try {
        const data = await request<DashboardSummary>('/dashboard/summary')
        setSummary(data)
      } catch (err) {
        setError((err as Error).message)
      }
    }
    loadSummary()
  }, [])

  if (!summary) {
    return error ? (
      <p className="error">
        <CircleAlert size={18} />
        {error}
      </p>
    ) : (
      <p className="loading">Боргирӣ...</p>
    )
  }

  const owedToMe = Number(summary.outstanding.they_owe_me)
  const iOwe = Number(summary.outstanding.i_owe_them)
  const balance = Number(summary.outstanding.net_balance)
  const totalToMe = Number(summary.totals.they_owe_me)
  const totalFromMe = Number(summary.totals.i_owe_them)

  const collectedPercent = percent(totalToMe - owedToMe, totalToMe)
  const paidPercent = percent(totalFromMe - iOwe, totalFromMe)

  const greenPart = percent(owedToMe, owedToMe + iOwe)

  const total = summary.counts.total
  const pendingP = percent(summary.counts.pending, total)
  const partialP = percent(summary.counts.partial, total)

  const donut =
    total === 0
      ? 'conic-gradient(#e2e8f0 0 100%)'
      : 'conic-gradient(#fbbf24 0 ' +
        pendingP +
        '%, #60a5fa ' +
        pendingP +
        '% ' +
        (pendingP + partialP) +
        '%, #10b981 ' +
        (pendingP + partialP) +
        '% 100%)'

  return (
    <div className="dash">
      <section className="dash-hero">
        <div className="dash-hero-top">
          <div>
            <span className="dash-date">{todayLong()}</span>
            <h1>Салом, {user?.name}!</h1>
          </div>

          <div className="dash-hero-actions">
            <Link to="/debts" className="dash-btn dash-btn-white">
              <Plus size={18} />
              Қарзи нав
            </Link>
            <Link to="/debts" className="dash-btn dash-btn-glass">
              Ҳамаи қарзҳо
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        <div className="dash-balance">
          <span>Баланси соф</span>
          <b>
            {balance > 0 ? '+' : ''}
            {formatMoney(balance)}
          </b>
          <small>{balance >= 0 ? 'Ба шумо бештар қарздоранд' : 'Шумо бештар қарздоред'}</small>
        </div>

        <div className="dash-split">
          <div className="dash-split-bar">
            <div className="dash-split-green" style={{ width: greenPart + '%' }}></div>
          </div>
          <div className="dash-split-labels">
            <span>
              <i className="dash-dot green"></i>
              Ба ман: {formatMoney(owedToMe)}
            </span>
            <span>
              <i className="dash-dot red"></i>
              Аз ман: {formatMoney(iOwe)}
            </span>
          </div>
        </div>
      </section>

      <section className="dash-cards">
        <div className="dash-card">
          <div className="dash-card-head">
            <div className="dash-icon green">
              <TrendingUp size={22} />
            </div>
            <span className="dash-chip green">{collectedPercent}% баргашт</span>
          </div>
          <span className="dash-label">Ба ман қарздоранд</span>
          <b className="dash-value green">{formatMoney(owedToMe)}</b>
          <div className="dash-progress">
            <div className="green" style={{ width: collectedPercent + '%' }}></div>
          </div>
          <small>Ҳамагӣ дода будам: {formatMoney(totalToMe)}</small>
        </div>

        <div className="dash-card">
          <div className="dash-card-head">
            <div className="dash-icon red">
              <TrendingDown size={22} />
            </div>
            <span className="dash-chip red">{paidPercent}% пардохт шуд</span>
          </div>
          <span className="dash-label">Ман қарздорам</span>
          <b className="dash-value red">{formatMoney(iOwe)}</b>
          <div className="dash-progress">
            <div className="red" style={{ width: paidPercent + '%' }}></div>
          </div>
          <small>Ҳамагӣ гирифта будам: {formatMoney(totalFromMe)}</small>
        </div>

        <div className="dash-card">
          <div className="dash-card-head">
            <div className="dash-icon purple">
              <Users size={22} />
            </div>
            <Link to="/contacts" className="dash-chip purple">
              Дидан
            </Link>
          </div>
          <span className="dash-label">Контактҳо</span>
          <b className="dash-value">{summary.contacts_count}</b>
          <div className="dash-mini">
            <span>
              Қарзҳо: <b>{total}</b>
            </span>
            <span>
              Кушода: <b>{summary.counts.pending + summary.counts.partial}</b>
            </span>
          </div>
        </div>
      </section>

      <section className="dash-grid">
        <div className="dash-panel">
          <div className="dash-panel-title">
            <CalendarClock size={20} />
            <h2>Мӯҳлати наздик</h2>
          </div>

          {summary.upcoming_due.length === 0 && (
            <div className="dash-empty">
              <CircleCheck size={42} strokeWidth={1.5} />
              <b>Қарзи мӯҳлатдор нест</b>
            </div>
          )}

          <div className="dash-list">
            {summary.upcoming_due.map((debt) => {
              const isIncoming = debt.direction === 'they_owe_me'
              const days = daysLeft(debt.due_date)

              let badgeText = days + ' рӯз монд'
              let badgeClass = 'dash-days'
              if (days === 0) {
                badgeText = 'Имрӯз'
                badgeClass = 'dash-days soon'
              } else if (days < 0) {
                badgeText = -days + ' рӯз гузашт'
                badgeClass = 'dash-days late'
              } else if (days <= 3) {
                badgeClass = 'dash-days soon'
              }

              return (
                <Link key={debt.id} to={'/debts/' + debt.id} className="dash-row">
                  <div className={isIncoming ? 'dash-avatar green' : 'dash-avatar red'}>{debt.contact_name[0]}</div>

                  <div className="dash-row-info">
                    <b>{debt.contact_name}</b>
                    <span>
                      {formatDate(debt.due_date)} · {STATUS_LABELS[debt.status]}
                    </span>
                  </div>

                  <span className={badgeClass}>{badgeText}</span>

                  <b className={isIncoming ? 'dash-amount green' : 'dash-amount red'}>
                    {isIncoming ? '+' : '−'}
                    {formatMoney(debt.amount)}
                  </b>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="dash-panel">
          <div className="dash-panel-title">
            <ChartPie size={20} />
            <h2>Қарзҳо аз рӯи ҳолат</h2>
          </div>

          <div className="dash-donut" style={{ background: donut }}>
            <div className="dash-donut-center">
              <b>{total}</b>
              <span>қарз</span>
            </div>
          </div>

          <div className="dash-legend">
            <div>
              <i className="dash-dot yellow"></i>
              <span>{STATUS_LABELS.pending}</span>
              <b>{summary.counts.pending}</b>
            </div>
            <div>
              <i className="dash-dot blue"></i>
              <span>{STATUS_LABELS.partial}</span>
              <b>{summary.counts.partial}</b>
            </div>
            <div>
              <i className="dash-dot green"></i>
              <span>{STATUS_LABELS.paid}</span>
              <b>{summary.counts.paid}</b>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home