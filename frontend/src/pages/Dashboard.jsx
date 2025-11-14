import { useState } from 'react'
import { Routes, Route, NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, FileText, Upload, Key, Shield, LogOut, Share2, Download } from 'lucide-react'
import HomeTab from '../components/dashboard/HomeTab'
import MyDocuments from '../components/dashboard/MyDocuments'
import IssueDocument from '../components/dashboard/IssueDocument'
import DIDManager from '../components/dashboard/DIDManager'
import IssuerDashboard from '../components/dashboard/IssuerDashboard'
import ShareDocument from '../components/dashboard/ShareDocument'
import ReceiveDocument from '../components/dashboard/ReceiveDocument'
import { formatAddress } from '../utils/helpers'

const Dashboard = ({ account, setAccount }) => {

  const handleDisconnect = () => {
    setAccount(null)
  }

  const tabs = [
    { id: 'home', label: 'Home', icon: Home, path: '/dashboard' },
    { id: 'documents', label: 'My Documents', icon: FileText, path: '/dashboard/documents' },
    { id: 'issue', label: 'Issue Document', icon: Upload, path: '/dashboard/issue' },
    { id: 'share', label: 'Share Document', icon: Share2, path: '/dashboard/share' },
    { id: 'receive', label: 'Receive Document', icon: Download, path: '/dashboard/receive' },
    { id: 'did', label: 'DID Manager', icon: Key, path: '/dashboard/did' },
    { id: 'issuer', label: 'Issuer Dashboard', icon: Shield, path: '/dashboard/issuer' },
  ]

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="glass-card border-b border-neon-cyan/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-pixel text-xl neon-cyan">NexID</h1>
              <div className="hidden md:block h-6 w-px bg-gray-700" />
              <div className="text-sm">
                <div className="text-gray-400">Connected as</div>
                <div className="text-neon-cyan font-mono">{formatAddress(account)}</div>
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              className="neon-button-secondary px-4 py-2 flex items-center gap-2 text-sm"
            >
              <LogOut size={16} />
              Disconnect
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <NavLink
                    key={tab.id}
                    to={tab.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50'
                          : 'text-gray-400 hover:text-neon-cyan hover:bg-dark-card'
                      }`
                    }
                  >
                    <Icon size={20} />
                    <span className="font-medium">{tab.label}</span>
                  </NavLink>
                )
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomeTab account={account} />} />
              <Route path="/documents" element={<MyDocuments account={account} />} />
              <Route path="/issue" element={<IssueDocument account={account} />} />
              <Route path="/share" element={<ShareDocument account={account} />} />
              <Route path="/receive" element={<ReceiveDocument account={account} />} />
              <Route path="/did" element={<DIDManager account={account} />} />
              <Route path="/issuer" element={<IssuerDashboard account={account} />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

