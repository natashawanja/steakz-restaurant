import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import api from '../api/axios'

interface BranchStat {
  branchId: string
  branchName: string
  city: string
  totalOrders: number
  todayOrders: number
  totalRevenue: string
}

interface DashboardData {
  branches: BranchStat[]
  grandTotalRevenue: string
}

export default function HMPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardData | null>(null)
  const [selectedBranch, setSelectedBranch] = useState<string>('all')
  const [branchOrders, setBranchOrders] = useState<any[]>([])
  const [topItems, setTopItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'branch'>('overview')

  function handleLogout() {
    logout()
    navigate('/login')
  }

  async function loadDashboard() {
    setLoading(true)
    try {
      const res = await api.get('/api/hm/dashboard')
      setData(res.data)
    } catch {
      console.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  async function loadBranchDetail(branchId: string) {
    try {
      const [orders, items] = await Promise.all([
        api.get(`/api/hm/branches/${branchId}/orders`),
        api.get(`/api/hm/branches/${branchId}/top-items`)
      ])
      setBranchOrders(orders.data)
      setTopItems(items.data)
    } catch {
      console.error('Failed to load branch detail')
    }
  }

  useEffect(() => { loadDashboard() }, [])

  useEffect(() => {
    if (selectedBranch !== 'all') {
      loadBranchDetail(selectedBranch)
      setActiveTab('branch')
    } else {
      setActiveTab('overview')
    }
  }, [selectedBranch])

  const chartData = data?.branches.map(b => ({
    name: b.city,
    revenue: Number(b.totalRevenue),
    orders: b.totalOrders
  })) || []

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    READY: 'bg-green-100 text-green-700',
    SERVED: 'bg-purple-100 text-purple-700',
    PAID: 'bg-gray-100 text-gray-600',
    CANCELLED: 'bg-red-100 text-red-700',
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5]">

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-56 bg-charcoal text-white flex flex-col p-6">
        <h1 className="font-display text-xl font-bold text-brass mb-1">STEAKZ</h1>
        <p className="text-xs text-gray-400 mb-8">HQ Manager</p>

        <nav className="flex flex-col gap-2 flex-1">
          <button
            onClick={() => { setSelectedBranch('all'); setActiveTab('overview') }}
            className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'overview' ? 'bg-brass text-white' : 'text-gray-300 hover:bg-white/10'}`}
          >
            📊 Overview
          </button>

          <div className="mt-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-2">
              Branches
            </p>
            {data?.branches.map(b => (
              <button
                key={b.branchId}
                onClick={() => setSelectedBranch(b.branchId)}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm transition ${selectedBranch === b.branchId ? 'bg-brass text-white' : 'text-gray-300 hover:bg-white/10'}`}
              >
                {b.city}
              </button>
            ))}
          </div>
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

        {loading ? (
          <div className="text-center text-gray-400 mt-20">Loading dashboard...</div>
        ) : (

          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && data && (
              <div>
                <h2 className="text-2xl font-bold text-charcoal mb-2">
                  All Branches Overview
                </h2>
                <p className="text-gray-400 text-sm mb-8">
                  Read-only view across all {data.branches.length} branches
                </p>

                {/* KPI cards */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                      Total Revenue
                    </p>
                    <p className="text-3xl font-bold text-charcoal">
                      £{Number(data.grandTotalRevenue).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                      Total Orders
                    </p>
                    <p className="text-3xl font-bold text-charcoal">
                      {data.branches.reduce((s, b) => s + b.totalOrders, 0)}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                      Active Branches
                    </p>
                    <p className="text-3xl font-bold text-charcoal">
                      {data.branches.length}
                    </p>
                  </div>
                </div>

                {/* Revenue chart */}
                <div className="bg-white rounded-xl p-6 border border-gray-100 mb-8">
                  <h3 className="font-semibold text-charcoal mb-6">
                    Revenue by Branch
                  </h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value) => [`£${value}`, 'Revenue']}
                      />
                      <Bar dataKey="revenue" fill="#C5A059" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Branch table */}
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                      <tr>
                        <th className="text-left px-6 py-3">Branch</th>
                        <th className="text-left px-6 py-3">City</th>
                        <th className="text-left px-6 py-3">Total Orders</th>
                        <th className="text-left px-6 py-3">Today's Orders</th>
                        <th className="text-left px-6 py-3">Revenue</th>
                        <th className="text-left px-6 py-3">Detail</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.branches.map(b => (
                        <tr key={b.branchId} className="border-t border-gray-50 hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium">{b.branchName}</td>
                          <td className="px-6 py-4 text-gray-500">{b.city}</td>
                          <td className="px-6 py-4">{b.totalOrders}</td>
                          <td className="px-6 py-4">{b.todayOrders}</td>
                          <td className="px-6 py-4 font-semibold text-brass">
                            £{Number(b.totalRevenue).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setSelectedBranch(b.branchId)}
                              className="text-xs bg-charcoal text-white px-3 py-1 rounded-lg hover:opacity-80"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* BRANCH DETAIL TAB */}
            {activeTab === 'branch' && (
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <button
                    onClick={() => { setSelectedBranch('all'); setActiveTab('overview') }}
                    className="text-sm text-gray-400 hover:text-charcoal"
                  >
                    ← Back to overview
                  </button>
                  <h2 className="text-2xl font-bold text-charcoal">
                    {data?.branches.find(b => b.branchId === selectedBranch)?.branchName}
                  </h2>
                </div>

                {/* Top items */}
                <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
                  <h3 className="font-semibold text-charcoal mb-4">Top Selling Items</h3>
                  {topItems.length === 0 ? (
                    <p className="text-gray-400 text-sm">No orders yet for this branch.</p>
                  ) : (
                    <div className="space-y-3">
                      {topItems.map((item, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className="text-sm font-medium">{item.name}</span>
                          <span className="text-sm text-gray-500">{item.totalSold} sold</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Orders list */}
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-charcoal">All Orders</h3>
                  </div>
                  {branchOrders.length === 0 ? (
                    <p className="text-gray-400 text-sm p-6">No orders yet.</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>
                          <th className="text-left px-6 py-3">Table</th>
                          <th className="text-left px-6 py-3">Items</th>
                          <th className="text-left px-6 py-3">Total</th>
                          <th className="text-left px-6 py-3">Status</th>
                          <th className="text-left px-6 py-3">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {branchOrders.slice(0, 20).map((o: any) => (
                          <tr key={o.id} className="border-t border-gray-50">
                            <td className="px-6 py-3">Table {o.table?.number}</td>
                            <td className="px-6 py-3">{o.items?.length} items</td>
                            <td className="px-6 py-3 font-medium text-brass">
                              £{Number(o.totalAmount).toFixed(2)}
                            </td>
                            <td className="px-6 py-3">
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[o.status]}`}>
                                {o.status}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-gray-400">
                              {new Date(o.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}