import { motion } from 'framer-motion'
import { GraduationCap, Briefcase, Heart, Lock, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getDIDRegistryContractReadOnly } from '../../utils/web3'

const HomeTab = ({ account }) => {
  const navigate = useNavigate()
  const [did, setDid] = useState('')
  const [loading, setLoading] = useState(true)

  const loadDID = async () => {
    if (!account) {
      setLoading(false)
      return
    }
    try {
      const contract = getDIDRegistryContractReadOnly()
      const hasRegistered = await contract.hasDID(account)
      if (hasRegistered) {
        const registeredDID = await contract.getDID(account)
        setDid(registeredDID)
      }
    } catch (error) {
      console.log('No DID registered yet')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDID()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account])

  const categories = [
    {
      id: 'educational',
      title: 'Educational Documents',
      icon: <GraduationCap size={32} />,
      colorClass: 'text-neon-cyan',
      description: 'Degrees, certificates, transcripts',
      path: '/dashboard/documents?category=educational'
    },
    {
      id: 'employment',
      title: 'Employee Related Documents',
      icon: <Briefcase size={32} />,
      colorClass: 'text-neon-purple',
      description: 'Employment letters, contracts, IDs',
      path: '/dashboard/documents?category=employment'
    },
    {
      id: 'medical',
      title: 'Medical Documents',
      icon: <Heart size={32} />,
      colorClass: 'text-neon-cyan',
      description: 'Health records, prescriptions, reports',
      path: '/dashboard/documents?category=medical'
    },
    {
      id: 'confidential',
      title: 'Confidential Documents',
      icon: <Lock size={32} />,
      colorClass: 'text-neon-purple',
      description: 'Private documents, sensitive data',
      path: '/dashboard/documents?category=confidential'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Welcome Section */}
      <div className="glass-card p-8 rounded-xl">
        <h2 className="text-3xl font-bold mb-4 text-gray-100">Welcome Back!</h2>
        <div className="space-y-2 text-gray-400">
          <p>Your Digital Key: <span className="text-neon-cyan font-mono">{account}</span></p>
          {!loading && did && (
            <p>Your DID: <span className="text-neon-purple font-mono">{did}</span></p>
          )}
          {!loading && !did && (
            <p className="text-sm">
              You haven't registered a DID yet. 
              <button
                onClick={() => navigate('/dashboard/did')}
                className="text-neon-cyan hover:underline ml-1"
              >
                Register one now →
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Document Categories */}
      <div>
        <h3 className="text-2xl font-bold mb-6 text-gray-100">Your Document Categories</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              onClick={() => navigate(category.path)}
              className="glass-card p-6 rounded-xl cursor-pointer group"
            >
              <div className={`${category.colorClass} mb-4`}>
                {category.icon}
              </div>
              <h4 className="text-xl font-bold mb-2 text-gray-100">{category.title}</h4>
              <p className="text-gray-400 mb-4">{category.description}</p>
              <div className="flex items-center gap-2 text-neon-cyan group-hover:gap-4 transition-all">
                <span className="text-sm font-medium">View Documents</span>
                <ArrowRight size={16} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-6 rounded-xl">
        <h3 className="text-xl font-bold mb-4 text-gray-100">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => navigate('/dashboard/issue')}
            className="neon-button px-6 py-3"
          >
            Issue New Document
          </button>
          <button
            onClick={() => navigate('/dashboard/did')}
            className="neon-button-secondary px-6 py-3"
          >
            Manage DID
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default HomeTab

