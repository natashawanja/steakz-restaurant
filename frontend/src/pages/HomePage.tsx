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
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/api/public/menu').then(r => setMenu(r.data)).catch(() => {})
    api.get('/api/public/branches').then(r => setBranches(r.data)).catch(() => {})
    api.get('/api/public/promotions').then(r => setPromotions(r.data)).catch(() => {})
  }, [])

  const categories = [...new Set(menu.map(i => i.category))]

  return (
    <div className="min-h-screen bg-[#F9F9F7]">

      {/* Navbar */}
      <nav className="bg-charcoal text-white px-8 py-4 flex justify-between items-center">
        <h1 className="font-display text-2xl font-bold text-brass">STEAKZ</h1>
        <div className="flex gap-6 text-sm">
          <a href="#menu" className="hover:text-brass transition">Menu</a>
          <a href="#branches" className="hover:text-brass transition">Branches</a>
          <a href="#promotions" className="hover:text-brass transition">Offers</a>
          <button
            onClick={() => navigate('/login')}
            className="bg-brass text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
          >
            Staff Login
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-charcoal text-white text-center py-24 px-8">
        <h2 className="font-display text-6xl font-bold text-brass mb-4">
          Culinary Excellence
        </h2>
        <p className="text-gray-300 text-lg max-w-xl mx-auto mb-8">
          Premium steaks, exceptional service, unforgettable experiences
          across all our UK branches.
        </p>
        
        <a
          href="#menu"
          className="bg-brass text-white px-8 py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition inline-block"
        >
          View Our Menu
        </a>
      </div>

      {/* Promotions */}
      {promotions.length > 0 && (
        <div id="promotions" className="bg-brass text-white py-8 px-8">
          <div className="max-w-5xl mx-auto">
            <h3 className="font-display text-2xl font-bold mb-4">
              Current Offers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {promotions.map(p => (
                <div key={p.id} className="bg-white/20 rounded-xl p-4">
                  <p className="font-bold text-lg">{p.discount}% OFF</p>
                  <p className="text-sm opacity-90">Use code: <span className="font-mono font-bold">{p.code}</span></p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Menu */}
      <div id="menu" className="max-w-5xl mx-auto py-16 px-8">
        <h3 className="font-display text-4xl font-bold text-charcoal mb-10 text-center">
          Our Menu
        </h3>

        {menu.length === 0 ? (
          <p className="text-center text-gray-400">
            Menu items will appear here once added by the chef.
          </p>
        ) : (
          categories.map(category => (
            <div key={category} className="mb-10">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-brass mb-4">
                {category}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menu
                  .filter(i => i.category === category)
                  .map(item => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl p-5 border border-gray-100 flex justify-between items-start"
                    >
                      <div>
                        <p className="font-semibold text-charcoal">{item.name}</p>
                        <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                      </div>
                      <p className="font-bold text-brass ml-4">
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
      <div id="branches" className="bg-charcoal text-white py-16 px-8">
        <div className="max-w-5xl mx-auto">
          <h3 className="font-display text-4xl font-bold text-brass mb-10 text-center">
            Our Locations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {branches.map(b => (
              <div key={b.id} className="bg-white/10 rounded-xl p-6">
                <p className="font-bold text-lg text-brass">{b.city}</p>
                <p className="text-sm text-gray-300 mt-1">{b.name}</p>
                <p className="text-sm text-gray-400 mt-1">{b.address}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-charcoal border-t border-white/10 text-center py-6">
        <p className="text-gray-500 text-sm">
          © 2026 Steakz. All rights reserved.
        </p>
      </div>

    </div>
  )
}