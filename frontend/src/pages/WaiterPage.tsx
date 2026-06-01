import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import TopBar from '../components/TopBar'

interface Table {
  id: string
  number: number
  seats: number
  isOccupied: boolean
}

interface MenuItem {
  id: string
  name: string
  price: number
  category: string
}

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
}

interface CartItem {
  menuItemId: string
  name: string
  quantity: number
  unitPrice: number
}

export default function WaiterPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tables, setTables] = useState<Table[]>([])
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState<'tables' | 'orders'>('tables')
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [message, setMessage] = useState('')
  const [showOrder, setShowOrder] = useState(false)

  async function loadAll() {
    try {
      const [t, m, o] = await Promise.all([
        api.get('/api/waiter/tables'),
        api.get('/api/waiter/menu'),
        api.get('/api/waiter/orders')
      ])
      setTables(t.data)
      setMenu(m.data)
      setOrders(o.data)
    } catch { console.error('Failed to load data') }
  }

  useEffect(() => {
    loadAll()
    const interval = setInterval(loadAll, 15000)
    return () => clearInterval(interval)
  }, [])

  function addToCart(item: MenuItem) {
    setCart(prev => {
      const existing = prev.find(c => c.menuItemId === item.id)
      if (existing) return prev.map(c => c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c)
      return [...prev, { menuItemId: item.id, name: item.name, quantity: 1, unitPrice: Number(item.price) }]
    })
  }

  function removeFromCart(menuItemId: string) {
    setCart(prev => prev.filter(c => c.menuItemId !== menuItemId))
  }

  function updateQty(menuItemId: string, qty: number) {
    if (qty < 1) { removeFromCart(menuItemId); return }
    setCart(prev => prev.map(c => c.menuItemId === menuItemId ? { ...c, quantity: qty } : c))
  }

  const cartTotal = cart.reduce((sum, c) => sum + c.unitPrice * c.quantity, 0)

  async function placeOrder() {
    if (!selectedTable || cart.length === 0) return
    try {
      await api.post('/api/waiter/orders', {
        tableId: selectedTable.id,
        items: cart.map(c => ({ menuItemId: c.menuItemId, quantity: c.quantity, unitPrice: c.unitPrice }))
      })
      setMessage('Order placed for Table ' + selectedTable.number + '!')
      setCart([])
      setSelectedTable(null)
      setShowOrder(false)
      loadAll()
    } catch { setMessage('Failed to place order.') }
  }

  async function markServed(orderId: string) {
    try {
      await api.patch('/api/waiter/orders/' + orderId + '/served')
      setMessage('Order marked as served!')
      loadAll()
    } catch { setMessage('Failed to update order.') }
  }

  const categories = [...new Set(menu.map(i => i.category))]

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    READY: 'bg-green-100 text-green-700',
    SERVED: 'bg-gray-100 text-gray-600',
    PAID: 'bg-gray-100 text-gray-400',
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <div className="fixed left-0 top-0 h-full w-56 bg-charcoal text-white flex flex-col p-6">
        <h1 className="font-display text-xl font-bold text-brass mb-1">STEAKZ</h1>
        <p className="text-xs text-gray-400 mb-1">Waiter</p>
        {user?.branchName && (
          <div className="flex items-center gap-2 mb-8">
            <p className="text-xs text-brass font-medium">{user.branchName}</p>
            {user?.branchIsMain && <span className="text-xs bg-brass/20 text-brass px-1.5 py-0.5 rounded font-medium">Main</span>}
          </div>
        )}
        <nav className="flex flex-col gap-2 flex-1">
          <button onClick={() => setActiveTab('tables')} className={'text-left px-4 py-3 rounded-lg text-sm font-medium transition ' + (activeTab === 'tables' ? 'bg-brass text-white' : 'text-gray-300 hover:bg-white/10')}>🪑 Tables</button>
          <button onClick={() => setActiveTab('orders')} className={'text-left px-4 py-3 rounded-lg text-sm font-medium transition ' + (activeTab === 'orders' ? 'bg-brass text-white' : 'text-gray-300 hover:bg-white/10')}>📋 Orders</button>
        </nav>
        <div className="border-t border-white/10 pt-4">
          <p className="text-xs text-gray-400 mb-1">Signed in as</p>
          <p className="text-sm font-medium">{user?.name}</p>
        </div>
      </div>

      <TopBar title="Waiter Floor" />

      <div className="ml-56 pt-20 p-8">
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm flex justify-between">
            {message}
            <button onClick={() => setMessage('')}>✕</button>
          </div>
        )}

        {activeTab === 'tables' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-charcoal">Floor Plan</h2>
                <p className="text-gray-400 text-sm">{tables.filter(t => t.isOccupied).length} occupied · {tables.filter(t => !t.isOccupied).length} free</p>
              </div>
              <button onClick={loadAll} className="bg-charcoal text-white px-4 py-2 rounded-lg text-sm hover:opacity-80">🔄 Refresh</button>
            </div>
            <div className="grid grid-cols-5 gap-4 mb-8">
              {tables.map(table => (
                <button
                  key={table.id}
                  onClick={() => { if (!table.isOccupied) { setSelectedTable(table); setShowOrder(true); setCart([]) } }}
                  className={'rounded-xl p-4 text-center border-2 transition ' + (table.isOccupied ? 'bg-red-50 border-red-200 cursor-not-allowed' : 'bg-green-50 border-green-200 hover:border-green-400 cursor-pointer')}
                >
                  <p className="font-bold text-lg">T{table.number}</p>
                  <p className="text-xs text-gray-500">{table.seats} seats</p>
                  <p className={'text-xs font-medium mt-1 ' + (table.isOccupied ? 'text-red-600' : 'text-green-600')}>{table.isOccupied ? 'Occupied' : 'Free'}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-green-200"></div><span className="text-gray-500">Free — click to take order</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-red-200"></div><span className="text-gray-500">Occupied</span></div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-charcoal">Orders</h2>
                <p className="text-gray-400 text-sm">{orders.length} total orders</p>
              </div>
              <button onClick={loadAll} className="bg-charcoal text-white px-4 py-2 rounded-lg text-sm hover:opacity-80">🔄 Refresh</button>
            </div>
            {orders.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                <p className="text-4xl mb-4">📋</p>
                <p className="text-gray-400">No orders yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-white rounded-xl p-5 border border-gray-100">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-lg">Table {order.table.number}</p>
                        <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={'text-xs font-medium px-2 py-1 rounded-full ' + statusColors[order.status]}>{order.status}</span>
                        {order.status === 'READY' && (
                          <button onClick={() => markServed(order.id)} className="bg-green-500 text-white text-xs px-3 py-1 rounded-lg font-medium hover:bg-green-600">Mark Served</button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      {order.items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm text-gray-600">
                          <span>{item.menuItem.name}</span>
                          <span>x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-50 flex justify-end">
                      <p className="font-semibold text-brass">£{Number(order.totalAmount).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showOrder && selectedTable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg">New Order — Table {selectedTable.number}</h3>
              <button onClick={() => { setShowOrder(false); setCart([]) }} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-0">
              <div className="p-6 border-r border-gray-100">
                <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">Menu</h4>
                {categories.map(category => (
                  <div key={category} className="mb-4">
                    <p className="text-xs font-semibold text-brass uppercase mb-2">{category}</p>
                    <div className="space-y-2">
                      {menu.filter(i => i.category === category).map(item => (
                        <button key={item.id} onClick={() => addToCart(item)} className="w-full text-left flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 transition">
                          <span className="text-sm font-medium">{item.name}</span>
                          <span className="text-sm text-brass font-semibold">£{Number(item.price).toFixed(2)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6">
                <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">Order</h4>
                {cart.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center mt-8">Tap items from the menu to add them</p>
                ) : (
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={item.menuItemId} className="flex justify-between items-center">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-gray-400">£{item.unitPrice.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQty(item.menuItemId, item.quantity - 1)} className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-sm flex items-center justify-center hover:bg-gray-200">−</button>
                          <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQty(item.menuItemId, item.quantity + 1)} className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-sm flex items-center justify-center hover:bg-gray-200">+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {cart.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex justify-between mb-4">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-brass text-lg">£{cartTotal.toFixed(2)}</span>
                    </div>
                    <button onClick={placeOrder} className="w-full bg-brass text-white py-3 rounded-lg font-semibold hover:opacity-90 transition">Place Order</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}