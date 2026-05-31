import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleLogin() {
    if (!email || !password) {
      setError('Please enter email and password.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await api.post('/api/auth/login', { email, password })
      login(res.data.token, res.data.user)

      const role = res.data.user.role
      if (role === 'ADMIN') navigate('/admin')
      else if (role === 'HM') navigate('/hm')
      else if (role === 'BM') navigate('/bm')
      else if (role === 'CHEF') navigate('/chef')
      else if (role === 'CASHIER') navigate('/cashier')
      else navigate('/waiter')
    } catch {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">

        <h1 className="font-display text-4xl font-bold text-charcoal mb-1">
          STEAKZ
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Staff portal — sign in to continue
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@steakz.com"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brass"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brass"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-brass text-white py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 font-medium mb-3">Test accounts</p>
          <div className="space-y-1">
            {[
              { role: 'Admin', email: 'admin@steakz.com', pw: 'Admin123!' },
              { role: 'HM', email: 'hm@steakz.com', pw: 'HM123!' },
              { role: 'BM', email: 'bm@steakz.com', pw: 'BM123!' },
              { role: 'Chef', email: 'chef@steakz.com', pw: 'Chef123!' },
              { role: 'Cashier', email: 'cashier@steakz.com', pw: 'Cash123!' },
              { role: 'Waiter', email: 'waiter@steakz.com', pw: 'Wait123!' },
            ].map(u => (
              <button
                key={u.role}
                onClick={() => { setEmail(u.email); setPassword(u.pw) }}
                className="w-full text-left text-xs px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-500 transition"
              >
                <span className="font-medium text-gray-700">{u.role}</span>
                {' — '}{u.email}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}