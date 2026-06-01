import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface TopBarProps {
    title: string
}

export default function TopBar({ title }: TopBarProps) {
    const navigate = useNavigate()
    const { user, logout } = useAuth()

    function handleLogout() {
        logout()
        navigate('/login')
    }

    return (
        <div className="fixed top-0 left-56 right-0 h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 z-40">
            <p className="text-sm font-semibold text-charcoal">{title}</p>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/home')}
                    className="text-sm text-gray-400 hover:text-brass transition flex items-center gap-1"
                >
                    🏠 Home
                </button>
                <div className="w-px h-4 bg-gray-200"></div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                    {user?.role}
                </span>
                {user?.branchName && (
                    <span className="text-xs text-gray-500">
                        {user.branchName}
                        {user.branchIsMain && (
                            <span className="ml-1 text-brass font-medium">· Main</span>
                        )}
                    </span>
                )}
                <div className="w-px h-4 bg-gray-200"></div>
                <button
                    onClick={handleLogout}
                    className="text-xs text-red-400 hover:text-red-600 transition"
                >
                    Sign out
                </button>
            </div>
        </div>
    )
}