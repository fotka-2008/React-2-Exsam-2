import { Navigate } from 'react-router-dom'

import type { ReactNode } from 'react'

import { getAccessToken } from '../api'

function ProtectedRoute({ children }: { children: ReactNode }) {
  if (!getAccessToken()) {
    return <Navigate to="/login" />
  }

  return children
}

export default ProtectedRoute