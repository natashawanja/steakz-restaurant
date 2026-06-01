import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

interface DashboardData {
    todayOrders: number
    todayRevenue: string
    occupiedTables: number
    totalTables: number
}

interface Order {
    id: string
    status: string
    totalAmount: number
    createdAt: string
    table: { number: number }
    items: { id: string; quantity: number; menuItem: { name: string } }[]
}

interface Staff {
    id: string
    name: string
    email: string
    role: string
}

interface Promotion {
    id: string
    code: string
    discount: number
    startDate: string
    endDate: string
}

export default function BMPage() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [dashboard, setDashboard] = useState<DashboardData | null>(null)
    const [orders, setOrders] = useState<Order[]>([])
    const [staff, setStaff] = useState<Staff[]>([])
    const [promotions, setPromotions] = useState<Promotion[]>([])
    const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'staff' | 'promotions'>('dashboard')

    function handleLogout() {
        logout()
        navigate('/login')
    }

    async function loadAll() {
        try {
            const [d, o, s, p] = await Promise.all([
                api.get('/api/bm/dashboard'),
                api.get('/api/bm/orders'),
                api.get('/api/bm/staff'),
                api.get('/api/bm/promotions')
            ])
            setDashboard(d.data)
            setOrders(o.data)
            setStaff(s.data)
            setPromotions(p.data)
        } catch {
            console.error('Failed to load data')
        }
    }

    useEffect(() => {
        loadAll()
        const interval = setInterval(loadAll, 30000)
        return () => clearInterval(interval)
    }, [])

    const statusColors: Record<string, string> = {
        PENDING: 'bg-yellow-100 text-yellow-700',
        IN_PROGRESS: 'bg-blue-100 text-blue-700',
        READY: 'bg-green-100 text-green-700',
        SERVED: 'bg-purple-100 text-purple-700',
        PAID: 'bg-gray-100 text-gray-500',
        CANCELLED: 'bg-red-100 text-red-700',
    }

    const roleColors: Record<string, string> = {
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
                <p className="text-xs text-gray-400 mb-1">Branch Manager</p>
                <p className="text-xs text-brass mb-8 font-medium">London Flagship</p>

                <nav className="flex flex-col gap-2 flex-1">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'dashboard' ? 'bg-brass text-white' : 'text-gray-300 hover:bg-white/10'}`}
                    >
                        📊 Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'orders' ? 'bg-brass text-white' : 'text-gray-300 hover:bg-white/10'}`}
                    >
                        📋 Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('staff')}
                        className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'staff' ? 'bg-brass text-white' : 'text-gray-300 hover:bg-white/10'}`}
                    >
                        👥 Staff
                    </button>
                    <button
                        onClick={() => setActiveTab('promotions')}
                        className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'promotions' ? 'bg-brass text-white' : 'text-gray-300 hover:bg-white/10'}`}
                    >
                        🎟️ Promotions
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

                {/* DASHBOARD TAB */}
                {activeTab === 'dashboard' && dashboard && (
                    <div>
                        <h2 className="text-2xl font-bold text-charcoal mb-2">
                            Branch Overview
                        </h2>
                        <p className="text-gray-400 text-sm mb-8">
                            London Flagship — today's performance
                        </p>

                        {/* KPI cards */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-white rounded-xl p-6 border border-gray-100">
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                                    Today's Revenue
                                </p>
                                <p className="text-3xl font-bold text-brass">
                                    £{Number(dashboard.todayRevenue).toFixed(2)}
                                </p>
                            </div>
                            <div className="bg-white rounded-xl p-6 border border-gray-100">
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                                    Today's Orders
                                </p>
                                <p className="text-3xl font-bold text-charcoal">
                                    {dashboard.todayOrders}
                                </p>
                            </div>
                            <div className="bg-white rounded-xl p-6 border border-gray-100">
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                                    Occupied Tables
                                </p>
                                <p className="text-3xl font-bold text-charcoal">
                                    {dashboard.occupiedTables}
                                    <span className="text-lg text-gray-300 font-normal">
                                        /{dashboard.totalTables}
                                    </span>
                                </p>
                            </div>
                            <div className="bg-white rounded-xl p-6 border border-gray-100">
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                                    Staff On Duty
                                </p>
                                <p className="text-3xl font-bold text-charcoal">
                                    {staff.length}
                                </p>
                            </div>
                        </div>

                        {/* Recent orders */}
                        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="font-semibold">Recent Orders</h3>
                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className="text-xs text-brass hover:underline"
                                >
                                    View all
                                </button>
                            </div>
                            {orders.length === 0 ? (
                                <p className="text-gray-400 text-sm p-6">No orders yet today.</p>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                        <tr>
                                            <th className="text-left px-6 py-3">Table</th>
                                            <th className="text-left px-6 py-3">Items</th>
                                            <th className="text-left px-6 py-3">Total</th>
                                            <th className="text-left px-6 py-3">Status</th>
                                            <th className="text-left px-6 py-3">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.slice(0, 5).map(order => (
                                            <tr key={order.id} className="border-t border-gray-50 hover:bg-gray-50">
                                                <td className="px-6 py-3 font-medium">
                                                    Table {order.table.number}
                                                </td>
                                                <td className="px-6 py-3 text-gray-500">
                                                    {order.items.length} items
                                                </td>
                                                <td className="px-6 py-3 font-semibold text-brass">
                                                    £{Number(order.totalAmount).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[order.status]}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-gray-400">
                                                    {new Date(order.createdAt).toLocaleTimeString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* ORDERS TAB */}
                {activeTab === 'orders' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-charcoal">All Orders</h2>
                                <p className="text-gray-400 text-sm">{orders.length} total orders</p>
                            </div>
                            <button
                                onClick={loadAll}
                                className="bg-charcoal text-white px-4 py-2 rounded-lg text-sm hover:opacity-80"
                            >
                                🔄 Refresh
                            </button>
                        </div>

                        {orders.length === 0 ? (
                            <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                                <p className="text-4xl mb-4">📋</p>
                                <p className="text-gray-400">No orders yet.</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                        <tr>
                                            <th className="text-left px-6 py-3">Table</th>
                                            <th className="text-left px-6 py-3">Items</th>
                                            <th className="text-left px-6 py-3">Total</th>
                                            <th className="text-left px-6 py-3">Status</th>
                                            <th className="text-left px-6 py-3">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => (
                                            <tr key={order.id} className="border-t border-gray-50 hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium">
                                                    Table {order.table.number}
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">
                                                    <div className="space-y-0.5">
                                                        {order.items.map(item => (
                                                            <p key={item.id} className="text-xs">
                                                                {item.menuItem.name} x{item.quantity}
                                                            </p>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-brass">
                                                    £{Number(order.totalAmount).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[order.status]}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-400">
                                                    {new Date(order.createdAt).toLocaleTimeString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* STAFF TAB */}
                {activeTab === 'staff' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-charcoal">Staff</h2>
                                <p className="text-gray-400 text-sm">
                                    {staff.length} active staff members
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {staff.map(member => (
                                <div
                                    key={member.id}
                                    className="bg-white rounded-xl p-5 border border-gray-100 flex items-center gap-4"
                                >
                                    <div className="w-10 h-10 rounded-full bg-brass/10 flex items-center justify-center text-brass font-bold text-lg">
                                        {member.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-charcoal">{member.name}</p>
                                        <p className="text-xs text-gray-400">{member.email}</p>
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${roleColors[member.role] || 'bg-gray-100 text-gray-600'}`}>
                                        {member.role}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* PROMOTIONS TAB */}
                {activeTab === 'promotions' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-charcoal">Promotions</h2>
                                <p className="text-gray-400 text-sm">
                                    {promotions.length} active promotions
                                </p>
                            </div>
                        </div>

                        {promotions.length === 0 ? (
                            <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                                <p className="text-4xl mb-4">🎟️</p>
                                <p className="text-gray-400">No active promotions.</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Promotions are created by Admin.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {promotions.map(promo => (
                                    <div
                                        key={promo.id}
                                        className="bg-white rounded-xl p-5 border border-gray-100"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <p className="font-mono font-bold text-lg text-charcoal">
                                                {promo.code}
                                            </p>
                                            <span className="bg-brass/10 text-brass text-sm font-bold px-3 py-1 rounded-full">
                                                {promo.discount}% OFF
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            Valid: {new Date(promo.startDate).toLocaleDateString()} —{' '}
                                            {new Date(promo.endDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}