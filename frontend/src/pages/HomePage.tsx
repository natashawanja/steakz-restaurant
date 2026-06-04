import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
}

interface Branch {
  id: string
  name: string
  address: string
  city: string
}

interface Promotion {
  id: string
  code: string
  discount: number
}

export default function HomePage() {
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [selectedBranch, setSelectedBranch] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [b, p, m] = await Promise.all([
        api.get('/api/public/branches'),
        api.get('/api/public/promotions'),
        api.get('/api/public/menu')
      ])
      setBranches(b.data)
      setPromotions(p.data)
      setMenu(m.data)
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  async function loadMenuForBranch(branchId: string) {
    try {
      if (branchId === 'all') {
        const res = await api.get('/api/public/menu')
        setMenu(res.data)
      } else {
        const res = await api.get('/api/public/menu/' + branchId)
        setMenu(res.data)
      }
    } catch {
      console.error('Failed to load menu')
    }
  }

  function handleBranchChange(branchId: string) {
    setSelectedBranch(branchId)
    loadMenuForBranch(branchId)
  }

  const categories = [...new Set(menu.map(i => i.category))]

  return (
    <div className="min-h-screen bg-[#F9F9F7]">

      {/* Navbar */}
      <nav className="bg-charcoal text-white px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="font-display text-2xl font-bold text-brass">STEAKZ🍲</h1>
        <div className="flex items-center gap-6 text-sm">
          <a href="#menu" className="hover:text-brass transition">Menu</a>
          <a href="#branches" className="hover:text-brass transition">Branches</a>
          <a href="#offers" className="hover:text-brass transition">Offers</a>
          <a href="#contact" className="hover:text-brass transition">Contact</a>
          <button
            onClick={() => navigate('/login')}
            className="bg-brass text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
          >
            Staff Login
          </button>
        </div>
      </nav>

      {/* Hero with background image */}
      <div
        className="text-white text-center py-28 px-8 relative"
        style={{
          backgroundImage: 'url("/steak.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10">
          <p className="text-brass text-sm font-medium uppercase tracking-widest mb-4">
            Fine Dining · Est. 2010
          </p>
          <h2 className="font-display text-6xl font-bold text-white mb-6">
            Culinary Excellence
          </h2>
          <p className="text-gray-300 text-lg max-w-xl mx-auto mb-10">
            Premium steaks, exceptional service, unforgettable experiences
            across all our UK branches.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="#menu"
              className="bg-brass text-white px-8 py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition inline-block"
            >
              View Our Menu
            </a>
            <a
              href="#branches"
              className="border border-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition inline-block"
            >
              Find a Branch
            </a>
          </div>
        </div>
      </div>

      {/* Promotions */}
      {
        promotions.length > 0 && (
          <div id="offers" className="bg-brass text-white py-10 px-8">
            <div className="max-w-5xl mx-auto">
              <h3 className="font-display text-2xl font-bold mb-6 text-center">
                Current Offers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {promotions.map(p => (
                  <div key={p.id} className="bg-white/20 rounded-xl p-5 text-center">
                    <p className="font-bold text-3xl mb-1">{p.discount}% OFF</p>
                    <p className="text-sm opacity-90">
                      Use code:{' '}
                      <span className="font-mono font-bold bg-white/20 px-2 py-0.5 rounded">
                        {p.code}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      }

      {/* Menu */}
      <div id="menu" className="max-w-5xl mx-auto py-20 px-8">
        <div className="text-center mb-10">
          <p className="text-brass text-sm font-medium uppercase tracking-widest mb-2">
            Our Dishes
          </p>
          <h3 className="font-display text-4xl font-bold text-charcoal">
            The Menu
          </h3>
        </div>

        {/* Branch filter */}
        <div className="flex justify-center mb-10">
          <div className="flex gap-2 flex-wrap justify-center">
            <button
              onClick={() => handleBranchChange('all')}
              className={
                'px-4 py-2 rounded-full text-sm font-medium border transition ' +
                (selectedBranch === 'all'
                  ? 'bg-charcoal text-white border-charcoal'
                  : 'border-gray-200 text-gray-600 hover:border-charcoal')
              }
            >
              All Branches
            </button>
            {branches.map(b => (
              <button
                key={b.id}
                onClick={() => handleBranchChange(b.id)}
                className={
                  'px-4 py-2 rounded-full text-sm font-medium border transition ' +
                  (selectedBranch === b.id
                    ? 'bg-charcoal text-white border-charcoal'
                    : 'border-gray-200 text-gray-600 hover:border-charcoal')
                }
              >
                {b.city}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-16">Loading menu...</p>
        ) : menu.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🍽️</p>
            <p className="text-gray-400 text-lg">No menu items available yet.</p>
            <p className="text-gray-300 text-sm mt-2">
              {selectedBranch !== 'all'
                ? 'Try selecting a different branch.'
                : 'Check back soon!'}
            </p>
          </div>
        ) : (
          categories.map(category => (
            <div key={category} className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-brass">
                  {category}
                </h4>
                <div className="flex-1 h-px bg-gray-100"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menu
                  .filter(i => i.category === category)
                  .map(item => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl p-5 border border-gray-100 flex justify-between items-start hover:shadow-sm transition"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-charcoal">{item.name}</p>
                        {item.description && (
                          <p className="text-sm text-gray-400 mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <p className="font-bold text-brass ml-6 text-lg">
                        £{Number(item.price).toFixed(2)}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Branches */}
      <div id="branches" className="bg-charcoal text-white py-20 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-brass text-sm font-medium uppercase tracking-widest mb-2">
              Find Us
            </p>
            <h3 className="font-display text-4xl font-bold text-white">
              Our Locations
            </h3>
          </div>
          {branches.length === 0 ? (
            <p className="text-center text-gray-400">No branches found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {branches.map(b => (
                <div
                  key={b.id}
                  className="bg-white/10 rounded-xl p-6 border border-white/10 hover:bg-white/15 transition"
                >
                  <p className="font-bold text-lg text-brass mb-1">{b.city}</p>
                  <p className="text-sm text-gray-300">{b.name}</p>
                  <p className="text-sm text-gray-400 mt-2">{b.address}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contact */}
      <div id="contact" className="bg-[#F9F9F7] py-20 px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-brass text-sm font-medium uppercase tracking-widest mb-2">
            Get In Touch
          </p>
          <h3 className="font-display text-4xl font-bold text-charcoal mb-6">
            Reserve a Table
          </h3>
          <p className="text-gray-400 mb-8">
            Visit any of our branches or call ahead to make a reservation.
            Walk-ins are always welcome.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <p className="text-2xl mb-3">📞</p>
              <p className="font-semibold text-charcoal">Phone</p>
              <p className="text-sm text-gray-400 mt-1">+44 20 7946 0123</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <p className="text-2xl mb-3">✉️</p>
              <p className="font-semibold text-charcoal">Email</p>
              <p className="text-sm text-gray-400 mt-1">hello@steakz.co.uk</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <p className="text-2xl mb-3">🕐</p>
              <p className="font-semibold text-charcoal">Hours</p>
              <p className="text-sm text-gray-400 mt-1">Mon–Sun: 12pm – 11pm</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-charcoal border-t border-white/10 py-8 px-8">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="font-display text-xl font-bold text-brass">STEAKZ</h1>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#menu" className="hover:text-brass transition">Menu</a>
            <a href="#branches" className="hover:text-brass transition">Branches</a>
            <a href="#offers" className="hover:text-brass transition">Offers</a>
            <a href="#contact" className="hover:text-brass transition">Contact</a>
          </div>
          <p className="text-gray-500 text-sm">© 2026 Steakz. All rights reserved.</p>
        </div>
      </div>

    </div >
  )
}