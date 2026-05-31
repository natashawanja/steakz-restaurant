import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

interface User {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  branchId: string | null
  branch: { name: string } | null
  createdAt: string
}

interface Branch {
  id: string
  name: string
  city: string
  address: string
  isActive: boolean
}

export default function AdminPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [activeTab, setActiveTab] = useState<'users' | 'branches'>('users')
  const [showAddUser, setShowAddUser] = useState(false)
  const [showAddBranch, setShowAddBranch] = useState(false)
  const [message, setMessage] = useState('')

  // New user form
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState('WAITER')
  const [newBranchId, setNewBranchId] = useState('')

  // New branch form
  const [branchName, setBranchName] = useState('')
  const [branchAddress, setBranchAddress] = useState('')
  const [branchCity, setBranchCity] = useState('')

  function handleLogout() {
    logout()
    navigate('/login')
  }

  async function loadData() {
    const [u, b] = await Promise.all([
      api.get('/api/admin/users'),
      api.get('/api/admin/branches')
    ])
    setUsers(u.data)
    setBranches(b.data)
  }

  useEffect(() => { loadData() }, [])

  async function createUser() {
    try {
      await api.post('/api/admin/users', {
        name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole,
        branchId: newBranchId || null
      })
      setMessage('User created successfully!')
      setShowAddUser(false)
      setNewName(''); setNewEmail(''); setNewPassword(''); setNewBranchId('')
      loadData()
    } catch {
      setMessage('Error creating user.')
    }
  }

  async function createBranch() {
    try {
      await api.post('/api/admin/branches', {
        name: branchName,
        address: branchAddress,
        city: branchCity
      })
      setMessage('Branch created successfully!')
      setShowAddBranch(false)
      setBranchName(''); setBranchAddress(''); setBranchCity('')
      loadData()
    } catch {
      setMessage('Error creating branch.')
    }
  }

  async function changeRole(id: string, role: string) {
    await api.patch(`/api/admin/users/${id}/role`, { role })
    setMessage('Role updated!')
    loadData()
  }

  async function toggleUser(id: string, isActive: boolean) {
    if (isActive) {
      await api.patch(`/api/admin/users/${id}/terminate`)
    } else {
      await api.patch(`/api/admin/users/${id}/activate`)
    }
    setMessage(isActive ? 'User deactivated.' : 'User activated.')
    loadData()
  }

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-700',
    HM: 'bg-purple-100 text-purple-700',
    BM: 'bg-blue-100 text-blue-700',
    CHEF: 'bg-orange-100 text-orange-700',
    CASHIER: 'bg-green-100 text-green-700',
    WAITER: 'bg-gray-100 text-gray-700',
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5]">

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-56 bg-charcoal text-white flex flex-col p-6">
        <h1 className="font-display text-xl font-bold text-brass mb-1">STEAKZ</h1>
        <p className="text-xs text-gray-400 mb-8">Admin Panel</p>

        <nav className="flex flex-col gap-2 flex-1">
          <button
            onClick={() => setActiveTab('users')}
            className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'users' ? 'bg-brass text-white' : 'text-gray-300 hover:bg-white/10'}`}
          >
            👥 Users
          </button>
          <button
            onClick={() => setActiveTab('branches')}
            className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'branches' ? 'bg-brass text-white' : 'text-gray-300 hover:bg-white/10'}`}
          >
            🏪 Branches
          </button>
        </nav>

        <div className="border-t border-white/10 pt-4">
          <p className="text-xs text-gray-400 mb-1">Signed in as</p>
          <p className="text-sm font-medium">{user?.name}</p>
          <button
            onClick={handleLogout}
            className="mt-3 text-xs text-red-400 hover:text-red-300"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-56 p-8">

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {message}
            <button onClick={() => setMessage('')} className="ml-4 text-green-500">✕</button>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-charcoal">Users</h2>
                <p className="text-gray-400 text-sm">{users.length} total users</p>
              </div>
              <button
                onClick={() => setShowAddUser(!showAddUser)}
                className="bg-brass text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
              >
                + Add User
              </button>
            </div>

            {/* Add user form */}
            {showAddUser && (
              <div className="bg-white rounded-xl p-6 mb-6 border border-gray-100">
                <h3 className="font-semibold mb-4">Create New User</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    placeholder="Full name"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="Email"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="Password"
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm"
                  />
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm"
                  >
                    {['ADMIN','HM','BM','CHEF','CASHIER','WAITER'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <select
                    value={newBranchId}
                    onChange={e => setNewBranchId(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">No branch (Admin/HM)</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={createUser}
                    className="bg-brass text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Create User
                  </button>
                  <button
                    onClick={() => setShowAddUser(false)}
                    className="border px-4 py-2 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Users table */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="text-left px-6 py-3">Name</th>
                    <th className="text-left px-6 py-3">Email</th>
                    <th className="text-left px-6 py-3">Role</th>
                    <th className="text-left px-6 py-3">Branch</th>
                    <th className="text-left px-6 py-3">Status</th>
                    <th className="text-left px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{u.name}</td>
                      <td className="px-6 py-4 text-gray-500">{u.email}</td>
                      <td className="px-6 py-4">
                        <select
                          value={u.role}
                          onChange={e => changeRole(u.id, e.target.value)}
                          className={`text-xs font-medium px-2 py-1 rounded-full border-0 ${roleColors[u.role]}`}
                        >
                          {['ADMIN','HM','BM','CHEF','CASHIER','WAITER'].map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {u.branch?.name || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleUser(u.id, u.isActive)}
                          className={`text-xs font-medium px-3 py-1 rounded-lg ${u.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* BRANCHES TAB */}
        {activeTab === 'branches' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-charcoal">Branches</h2>
                <p className="text-gray-400 text-sm">{branches.length} branches</p>
              </div>
              <button
                onClick={() => setShowAddBranch(!showAddBranch)}
                className="bg-brass text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
              >
                + Add Branch
              </button>
            </div>

            {/* Add branch form */}
            {showAddBranch && (
              <div className="bg-white rounded-xl p-6 mb-6 border border-gray-100">
                <h3 className="font-semibold mb-4">Create New Branch</h3>
                <div className="grid grid-cols-3 gap-4">
                  <input
                    placeholder="Branch name"
                    value={branchName}
                    onChange={e => setBranchName(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="Address"
                    value={branchAddress}
                    onChange={e => setBranchAddress(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="City"
                    value={branchCity}
                    onChange={e => setBranchCity(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={createBranch}
                    className="bg-brass text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Create Branch
                  </button>
                  <button
                    onClick={() => setShowAddBranch(false)}
                    className="border px-4 py-2 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Branches grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {branches.map(b => (
                <div key={b.id} className="bg-white rounded-xl p-6 border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-charcoal">{b.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {b.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-brass font-medium">{b.city}</p>
                  <p className="text-sm text-gray-400 mt-1">{b.address}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}