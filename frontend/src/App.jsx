import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Landing from './pages/Landing'
import HowItWorks from './pages/HowItWorks'
import Dashboard from './pages/Dashboard'
import ParticlesDemo from './pages/ParticlesDemo'
import { getCurrentAccount, checkMetaMask } from './utils/web3'

function App() {
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    if (!checkMetaMask()) {
      setLoading(false)
      return
    }

    try {
      const currentAccount = await getCurrentAccount()
      if (currentAccount) {
        setAccount(currentAccount)
      }
    } catch (err) {
      console.error('Error checking connection:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="animate-pulse-neon text-neon-cyan text-pixel text-xl">
          Loading NexID...
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={account ? <Navigate to="/dashboard" replace /> : <Landing setAccount={setAccount} />} 
      />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/particles-demo" element={<ParticlesDemo />} />
      <Route 
        path="/dashboard/*" 
        element={account ? <Dashboard account={account} setAccount={setAccount} /> : <Navigate to="/" replace />} 
      />
    </Routes>
  )
}

export default App

