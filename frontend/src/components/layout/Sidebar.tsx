import { Home, Package, Grid3x3, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/products', icon: Package, label: 'Products' },
    { path: '/matrix', icon: Grid3x3, label: 'Matrix' }
  ]
  
  return (
    <div className="flex flex-col h-screen w-64 bg-slate-900 text-white">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-xl font-bold">My App</h1>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map(({ path, icon: Icon, label }) => (
            <li key={path}>
              <NavLink
                to={path}
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`
                }
              >
                <Icon size={20} />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* User Avatar */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
            <User size={20} />
          </div>
          <div>
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-slate-400">john@example.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar