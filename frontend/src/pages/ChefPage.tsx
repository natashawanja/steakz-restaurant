import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

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

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  isAvailable: boolean
}

export default function ChefPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders')
  const [message, setMessage] = useState('')

  // New menu item form
  const [showAddItem, setShowAddItem] = useState(false)
  const [itemName, setItemName] = useState('')
  const [itemDesc, setItemDesc] = useState('')
  const [itemPrice, setItemPrice] = useState('')
  const [itemCategory, setItemCategory] = useState('Mains')

  // Edit menu item
  const [editItem, setEditItem] = useState<MenuItem | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editCategory, setEditCategory] = useState('')

  function handleLogout() {
    logout()
    navigate('/login')
  }

  async function loadOrders() {
    try {
      const res = await api.get('/api/chef/orders')
      setOrders(res.data)
    } catch {
      console.error('Failed to load orders')
    }
  }

  async function loadMenu() {
    try {
      const res = await api.get('/api/chef/menu')
      setMenu(res.data)
    } catch {
      console.error('Failed to load menu')
    }
  }

  useEffect(() => {
    loadOrders()
    loadMenu()
    const interval = setInterval(loadOrders, 15000)
    return () => clearInterval(interval)
  }, [])

  async function markReady(orderId: string) {
    try {
      await api.patch(`/api/chef/orders/${orderId}/ready`)
      setMessage('Order marked as ready!')
      loadOrders()
    } catch {
      setMessage('Failed to update order.')
    }
  }

  async function addMenuItem() {
    if (!itemName || !itemPrice || !itemCategory) {
      setMessage('Name, price and category are required.')
      return
    }
    try {
      await api.post('/api/chef/menu', {
        name: itemName,
        description: itemDesc,
        price: parseFloat(itemPrice),
        category: itemCategory
      })
      setMessage('Menu item added!')
      setShowAddItem(false)
      setItemName('')
      setItemDesc('')
      setItemPrice('')
      loadMenu()
    } catch {
      setMessage('Failed to add item.')
    }
  }

  async function toggleAvailability(id: string, isAvailable: boolean) {
    try {
      await api.patch(`/api/chef/menu/${id}/availability`, {
        isAvailable: !isAvailable
      })
      setMessage('Availability updated!')
      loadMenu()
    } catch {
      setMessage('Failed to update availability.')
    }
  }

  async function saveEdit() {
    if (!editItem) return
    try {
      await api.put(`/api/chef/menu/${editItem.id}`, {
        name: editName,
        description: editDesc,
        price: parseFloat(editPrice),
        category: editCategory
      })
      setMessage('Menu item updated!')
      setEditItem(null)
      loadMenu()
    } catch {
      setMessage('Failed to update item.')
    }
  }

  const pendingOrders = orders.filter(o => o.status === 'PENDING')
  const inProgressOrders = orders.filter(o => o.status === 'IN_PROGRESS')

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    IN_PROGRESS: 'bg-blue-100 text-blue-700 border-blue-200',
  }

  function timeAgo(date: string) {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
    if (mins < 1) return 'just now'
    if (mins === 1) return '1 min ago'
    return `${mins} mins ago`
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5]">

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-56 bg-charcoal text-white flex flex-col p-6">
        <h1 className="font-display text-xl font-bold text-brass mb-1">STEAKZ</h1>
        <p className="text-xs text-gray-400 mb-8">Kitchen</p>

        <nav className="flex flex-col gap-2 flex-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'orders' ? 'bg-brass text-white' : 'text-gray-300 hover:bg-white/10'}`}
          >
            🍳 Kitchen Orders
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'menu' ? 'bg-brass text-white' : 'text-gray-300 hover:bg-white/10'}`}
          >
            📋 Menu Management
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
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm flex justify-between">
            {message}
            <button onClick={() => setMessage('')}>✕</button>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-charcoal">Kitchen Orders</h2>
                <p className="text-gray-400 text-sm">
                  {orders.length} active orders · auto-refreshes every 15s
                </p>
              </div>
              <button
                onClick={loadOrders}
                className="bg-charcoal text-white px-4 py-2 rounded-lg text-sm hover:opacity-80"
              >
                🔄 Refresh
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                <p className="text-4xl mb-4">🍽️</p>
                <p className="text-gray-400">No active orders right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">

                {/* Pending column */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-yellow-600 mb-4">
                    Pending ({pendingOrders.length})
                  </h3>
                  <div className="space-y-4">
                    {pendingOrders.map(order => (
                      <div
                        key={order.id}
                        className={`bg-white rounded-xl p-5 border-2 ${statusColors['PENDING']}`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-bold text-lg">
                              Table {order.table.number}
                            </p>
                            <p className="text-xs text-gray-400">
                              {timeAgo(order.createdAt)}
                            </p>
                          </div>
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                            PENDING
                          </span>
                        </div>

                        <div className="space-y-1 mb-4">
                          {order.items.map(item => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span>{item.menuItem.name}</span>
                              <span className="text-gray-500">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => markReady(order.id)}
                          className="w-full bg-green-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition"
                        >
                          ✓ Mark as Ready
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* In Progress column */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-600 mb-4">
                    In Progress ({inProgressOrders.length})
                  </h3>
                  <div className="space-y-4">
                    {inProgressOrders.map(order => (
                      <div
                        key={order.id}
                        className={`bg-white rounded-xl p-5 border-2 ${statusColors['IN_PROGRESS']}`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-bold text-lg">
                              Table {order.table.number}
                            </p>
                            <p className="text-xs text-gray-400">
                              {timeAgo(order.createdAt)}
                            </p>
                          </div>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                            IN PROGRESS
                          </span>
                        </div>

                        <div className="space-y-1 mb-4">
                          {order.items.map(item => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span>{item.menuItem.name}</span>
                              <span className="text-gray-500">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => markReady(order.id)}
                          className="w-full bg-green-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition"
                        >
                          ✓ Mark as Ready
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MENU TAB */}
        {activeTab === 'menu' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-charcoal">Menu Management</h2>
                <p className="text-gray-400 text-sm">{menu.length} items</p>
              </div>
              <button
                onClick={() => setShowAddItem(!showAddItem)}
                className="bg-brass text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
              >
                + Add Item
              </button>
            </div>

            {/* Add item form */}
            {showAddItem && (
              <div className="bg-white rounded-xl p-6 mb-6 border border-gray-100">
                <h3 className="font-semibold mb-4">New Menu Item</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    placeholder="Item name"
                    value={itemName}
                    onChange={e => setItemName(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm"
                  />
                  <select
                    value={itemCategory}
                    onChange={e => setItemCategory(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm"
                  >
                    {['Starters', 'Mains', 'Desserts', 'Drinks', 'Sides'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <input
                    placeholder="Description"
                    value={itemDesc}
                    onChange={e => setItemDesc(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm col-span-2"
                  />
                  <input
                    placeholder="Price (e.g. 12.99)"
                    value={itemPrice}
                    onChange={e => setItemPrice(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm"
                    type="number"
                    step="0.01"
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={addMenuItem}
                    className="bg-brass text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Add to Menu
                  </button>
                  <button
                    onClick={() => setShowAddItem(false)}
                    className="border px-4 py-2 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Menu items */}
            {menu.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                <p className="text-4xl mb-4">📋</p>
                <p className="text-gray-400">No menu items yet. Add your first item!</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                      <th className="text-left px-6 py-3">Name</th>
                      <th className="text-left px-6 py-3">Category</th>
                      <th className="text-left px-6 py-3">Price</th>
                      <th className="text-left px-6 py-3">Status</th>
                      <th className="text-left px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menu.map(item => (
                      <tr key={item.id} className="border-t border-gray-50 hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-gray-400">{item.description}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{item.category}</td>
                        <td className="px-6 py-4 font-semibold text-brass">
                          £{Number(item.price).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {item.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                          <button
                            onClick={() => toggleAvailability(item.id, item.isAvailable)}
                            className={`text-xs px-3 py-1 rounded-lg font-medium ${item.isAvailable ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                          >
                            {item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                          </button>
                          <button
                            onClick={() => {
                              setEditItem(item)
                              setEditName(item.name)
                              setEditDesc(item.description)
                              setEditPrice(String(item.price))
                              setEditCategory(item.category)
                            }}
                            className="text-xs px-3 py-1 rounded-lg font-medium bg-blue-50 text-blue-600 hover:bg-blue-100"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-semibold text-lg mb-4">Edit Menu Item</h3>
            <div className="space-y-3">
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                placeholder="Item name"
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
              <select
                value={editCategory}
                onChange={e => setEditCategory(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                {['Starters', 'Mains', 'Desserts', 'Drinks', 'Sides'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                placeholder="Description"
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
              <input
                value={editPrice}
                onChange={e => setEditPrice(e.target.value)}
                placeholder="Price"
                type="number"
                step="0.01"
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={saveEdit}
                className="bg-brass text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditItem(null)}
                className="border px-4 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}