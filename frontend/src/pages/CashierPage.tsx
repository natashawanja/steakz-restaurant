import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import TopBar from '../components/TopBar'

interface OrderItem {
    id: string
    quantity: number
    unitPrice: number
    menuItem: { name: string }
}

interface Order {
    id: string
    status: string
    totalAmount: number
    createdAt: string
    table: { number: number }
    items: OrderItem[]
    promotion: { code: string; discount: number } | null
}

interface Receipt {
    orderId: string
    branch: string
    table: number
    items: { name: string; quantity: number; unitPrice: number; total: number }[]
    subtotal: string
    discount: string
    tax: string
    totalPaid: string
    promoCode: string | null
}

interface Transaction {
    id: string
    table: { number: number }
    paidAt: string
    receipt: { totalPaid: string; paymentMethod: string } | null
}

export default function CashierPage() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [orders, setOrders] = useState<Order[]>([])
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [totalRevenue, setTotalRevenue] = useState('0.00')
    const [activeTab, setActiveTab] = useState<'orders' | 'transactions'>('orders')
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [receipt, setReceipt] = useState<Receipt | null>(null)
    const [promoCode, setPromoCode] = useState('')
    const [paymentMethod, setPaymentMethod] = useState('Card')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    async function loadOrders() {
        try {
            const res = await api.get('/api/cashier/orders')
            setOrders(res.data)
        } catch { console.error('Failed to load orders') }
    }

    async function loadTransactions() {
        try {
            const res = await api.get('/api/cashier/transactions')
            setTransactions(res.data.transactions)
            setTotalRevenue(res.data.totalRevenue)
        } catch { console.error('Failed to load transactions') }
    }

    useEffect(() => {
        loadOrders()
        loadTransactions()
        const interval = setInterval(() => { loadOrders(); loadTransactions() }, 15000)
        return () => clearInterval(interval)
    }, [])

    async function generateReceipt(order: Order) {
        try {
            setSelectedOrder(order)
            const res = await api.get('/api/cashier/orders/' + order.id + '/receipt')
            setReceipt(res.data)
        } catch { setMessage('Failed to generate receipt.') }
    }

    async function applyPromo() {
        if (!selectedOrder || !promoCode) return
        try {
            await api.post('/api/cashier/orders/' + selectedOrder.id + '/promo', { code: promoCode })
            setMessage('Promo applied!')
            const res = await api.get('/api/cashier/orders/' + selectedOrder.id + '/receipt')
            setReceipt(res.data)
        } catch { setMessage('Invalid promo code.') }
    }

    async function processPayment() {
        if (!selectedOrder) return
        setLoading(true)
        try {
            await api.post('/api/cashier/orders/' + selectedOrder.id + '/pay', { paymentMethod })
            setMessage('Payment processed! Table ' + selectedOrder.table.number + ' is now free.')
            setSelectedOrder(null)
            setReceipt(null)
            setPromoCode('')
            loadOrders()
            loadTransactions()
        } catch { setMessage('Failed to process payment.') }
        finally { setLoading(false) }
    }

    return (
        <div className="min-h-screen bg-[#F0F2F5]">
            <div className="fixed left-0 top-0 h-full w-56 bg-charcoal text-white flex flex-col p-6">
                <h1 className="font-display text-xl font-bold text-brass mb-1">STEAKZ</h1>
                <p className="text-xs text-gray-400 mb-1">Cashier Terminal</p>
                {user?.branchName && (
                    <div className="flex items-center gap-2 mb-8">
                        <p className="text-xs text-brass font-medium">{user.branchName}</p>
                        {user?.branchIsMain && <span className="text-xs bg-brass/20 text-brass px-1.5 py-0.5 rounded font-medium">Main</span>}
                    </div>
                )}
                <nav className="flex flex-col gap-2 flex-1">
                    <button onClick={() => setActiveTab('orders')} className={'text-left px-4 py-3 rounded-lg text-sm font-medium transition ' + (activeTab === 'orders' ? 'bg-brass text-white' : 'text-gray-300 hover:bg-white/10')}>🧾 Orders</button>
                    <button onClick={() => { setActiveTab('transactions'); loadTransactions() }} className={'text-left px-4 py-3 rounded-lg text-sm font-medium transition ' + (activeTab === 'transactions' ? 'bg-brass text-white' : 'text-gray-300 hover:bg-white/10')}>💰 Transactions</button>
                </nav>
                <div className="border-t border-white/10 pt-4">
                    <p className="text-xs text-gray-400 mb-1">Signed in as</p>
                    <p className="text-sm font-medium">{user?.name}</p>
                </div>
            </div>

            <TopBar title="Cashier Terminal" />

            <div className="ml-56 pt-20 p-8">
                {message && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm flex justify-between">
                        {message}
                        <button onClick={() => setMessage('')}>✕</button>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-charcoal">Orders</h2>
                                <p className="text-gray-400 text-sm">{orders.length} orders awaiting payment</p>
                            </div>
                            <button onClick={loadOrders} className="bg-charcoal text-white px-4 py-2 rounded-lg text-sm hover:opacity-80">🔄 Refresh</button>
                        </div>
                        {orders.length === 0 ? (
                            <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                                <p className="text-4xl mb-4">🧾</p>
                                <p className="text-gray-400">No orders awaiting payment.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {orders.map(order => (
                                    <div key={order.id} className="bg-white rounded-xl p-5 border border-gray-100">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="font-bold text-lg">Table {order.table.number}</p>
                                                <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString()}</p>
                                            </div>
                                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">{order.status}</span>
                                        </div>
                                        <div className="space-y-1 mb-4">
                                            {order.items.map(item => (
                                                <div key={item.id} className="flex justify-between text-sm text-gray-600">
                                                    <span>{item.menuItem.name}</span>
                                                    <span>x{item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                                            <p className="font-bold text-brass">£{Number(order.totalAmount).toFixed(2)}</p>
                                            <button onClick={() => generateReceipt(order)} className="bg-brass text-white text-sm px-4 py-2 rounded-lg font-medium hover:opacity-90">Generate Receipt</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'transactions' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-charcoal">Today's Transactions</h2>
                                <p className="text-gray-400 text-sm">{transactions.length} transactions</p>
                            </div>
                            <div className="bg-white rounded-xl px-6 py-3 border border-gray-100">
                                <p className="text-xs text-gray-400">Today's Revenue</p>
                                <p className="text-2xl font-bold text-brass">£{Number(totalRevenue).toLocaleString()}</p>
                            </div>
                        </div>
                        {transactions.length === 0 ? (
                            <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                                <p className="text-4xl mb-4">💰</p>
                                <p className="text-gray-400">No transactions today yet.</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                        <tr>
                                            <th className="text-left px-6 py-3">Table</th>
                                            <th className="text-left px-6 py-3">Date & Time</th>
                                            <th className="text-left px-6 py-3">Payment</th>
                                            <th className="text-left px-6 py-3">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map(t => (
                                            <tr key={t.id} className="border-t border-gray-50 hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium">Table {t.table.number}</td>
                                                <td className="px-6 py-4 text-gray-500">
                                                    {t.paidAt ? new Date(t.paidAt).toLocaleDateString() + ' ' + new Date(t.paidAt).toLocaleTimeString() : '—'}
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">{t.receipt?.paymentMethod || '—'}</td>
                                                <td className="px-6 py-4 font-semibold text-brass">£{Number(t.receipt?.totalPaid || 0).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {selectedOrder && receipt && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
                        <div className="p-6 text-center border-b border-gray-100">
                            <h2 className="font-display text-2xl font-bold text-charcoal">STEAKZ</h2>
                            <p className="text-gray-400 text-sm">{receipt.branch}</p>
                            <p className="text-gray-400 text-sm">Table {receipt.table} · {new Date().toLocaleDateString()}</p>
                        </div>
                        <div className="p-6 border-b border-gray-100">
                            <div className="space-y-2">
                                {receipt.items.map((item, i) => (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span>{item.name} x{item.quantity}</span>
                                        <span>£{item.total.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-6 border-b border-gray-100 space-y-2">
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Subtotal</span><span>£{receipt.subtotal}</span>
                            </div>
                            {Number(receipt.discount) > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Discount ({receipt.promoCode})</span><span>-£{receipt.discount}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>VAT (20%)</span><span>£{receipt.tax}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-100">
                                <span>Total</span><span className="text-brass">£{receipt.totalPaid}</span>
                            </div>
                        </div>
                        <div className="p-6 border-b border-gray-100">
                            <p className="text-sm font-medium mb-2">Promo Code</p>
                            <div className="flex gap-2">
                                <input value={promoCode} onChange={e => setPromoCode(e.target.value)} placeholder="Enter code" className="flex-1 border rounded-lg px-3 py-2 text-sm" />
                                <button onClick={applyPromo} className="bg-charcoal text-white px-4 py-2 rounded-lg text-sm font-medium">Apply</button>
                            </div>
                        </div>
                        <div className="p-6 border-b border-gray-100">
                            <p className="text-sm font-medium mb-2">Payment Method</p>
                            <div className="flex gap-2">
                                {['Cash', 'Card', 'Contactless'].map(method => (
                                    <button key={method} onClick={() => setPaymentMethod(method)} className={'flex-1 py-2 rounded-lg text-sm font-medium border transition ' + (paymentMethod === method ? 'bg-charcoal text-white border-charcoal' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
                                        {method}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="p-6 flex gap-3">
                            <button onClick={() => window.print()} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-lg text-sm font-medium hover:bg-gray-50">🖨️ Print</button>
                            <button onClick={processPayment} disabled={loading} className="flex-1 bg-brass text-white py-3 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50">
                                {loading ? 'Processing...' : '✓ Process Payment'}
                            </button>
                            <button onClick={() => { setSelectedOrder(null); setReceipt(null) }} className="border border-gray-200 text-gray-400 px-4 py-3 rounded-lg text-sm hover:bg-gray-50">✕</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}