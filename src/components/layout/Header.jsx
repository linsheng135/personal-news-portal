import { Link, useLocation } from 'react-router-dom'
import { Newspaper, Calendar, Info, Menu, X } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  const navItems = [
    { path: '/', label: '今日资讯', icon: <Newspaper size={18} /> },
    { path: '/history', label: '历史回顾', icon: <Calendar size={18} /> },
    { path: '/about', label: '关于项目', icon: <Info size={18} /> },
  ]
  
  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-ai-primary to-finance-primary flex items-center justify-center">
              <Newspaper size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">资讯聚合门户</h1>
              <p className="text-xs text-text-secondary">AI + 赚钱 · 每日精选</p>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  location.pathname === item.path
                    ? 'bg-ai-primary/10 text-ai-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
            
            {/* Theme Toggle (placeholder) */}
            <button className="p-2 text-text-secondary hover:text-text-primary hover:bg-gray-50 rounded-lg transition-colors duration-200">
              <span className="text-sm font-medium">🌙</span>
            </button>
          </nav>
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-text-secondary hover:text-text-primary hover:bg-gray-50 rounded-lg transition-colors duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-2 animate-fade-in">
            <div className="bg-gray-50 rounded-lg p-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2.5 rounded-md transition-colors duration-200 ${
                    location.pathname === item.path
                      ? 'bg-ai-primary text-white'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}