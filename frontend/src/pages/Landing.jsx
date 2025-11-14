import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Shield, Lock, Globe, Wallet } from 'lucide-react'
import { connectWallet } from '../utils/web3'
import Particles from '../components/Particles.jsx'

const Landing = ({ setAccount }) => {
  const navigate = useNavigate()

  const handleConnect = async () => {
    try {
      const account = await connectWallet()
      if (account) {
        setAccount(account)
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Connection error:', error)
      alert('Failed to connect wallet. Please make sure MetaMask is installed and unlocked.')
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      {/* Particles Background - Glowing blue dots */}
      <div className="absolute inset-0 z-0">
        <Particles
          particleColors={['#3B82F6', '#60A5FA', '#93C5FD']}
          particleCount={300}
          particleSpread={15}
          speed={0.05}
          particleBaseSize={50}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto w-full">
          {/* Hero Section */}
          <div className="text-center min-h-[70vh] flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-pixel text-5xl md:text-7xl mb-6 text-white"
                style={{ 
                  textShadow: '0 0 8px rgba(59, 130, 246, 0.5), 0 0 16px rgba(59, 130, 246, 0.3)',
                  color: '#E0F2FE'
                }}
              >
                NexID
              </motion.h1>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="mb-6"
              >
                <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
                  Own Your Digital Identity
                </h2>
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-xl md:text-2xl text-white mb-12 max-w-2xl mx-auto leading-relaxed"
              >
                Securely store and share your important documents. You stay in control.
              </motion.p>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex justify-center items-center mb-16"
            >
              <motion.button
                onClick={handleConnect}
                className="px-8 py-4 rounded-lg font-semibold text-lg flex items-center gap-2 transition-all duration-300"
                style={{
                  background: 'transparent',
                  color: '#3B82F6',
                  border: '2px solid #3B82F6',
                  boxShadow: '0 0 12px rgba(59, 130, 246, 0.4), 0 0 20px rgba(59, 130, 246, 0.2)'
                }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 0 16px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.3)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Wallet size={20} />
                Connect to Wallet
              </motion.button>
            </motion.div>
          </div>

          {/* Feature Cards Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-16"
          >
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: <Shield size={48} />,
                  title: 'Secure',
                  description: 'Your documents are encrypted and stored on decentralized storage',
                  color: '#3B82F6',
                  glowColor: 'rgba(59, 130, 246, 0.25)',
                  outerGlowColor: 'rgba(59, 130, 246, 0.15)',
                  hoverOuterGlowColor: 'rgba(59, 130, 246, 0.2)'
                },
                {
                  icon: <Lock size={48} />,
                  title: 'Private',
                  description: 'You control who sees your documents and when',
                  color: '#6366F1',
                  glowColor: 'rgba(99, 102, 241, 0.25)',
                  outerGlowColor: 'rgba(99, 102, 241, 0.15)',
                  hoverOuterGlowColor: 'rgba(99, 102, 241, 0.2)'
                },
                {
                  icon: <Globe size={48} />,
                  title: 'Decentralized',
                  description: 'No central server. Your identity, your rules',
                  color: '#60A5FA',
                  glowColor: 'rgba(96, 165, 250, 0.25)',
                  outerGlowColor: 'rgba(96, 165, 250, 0.15)',
                  hoverOuterGlowColor: 'rgba(96, 165, 250, 0.2)'
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  className="relative"
                >
                  <motion.div
                    className="glass-card p-8 rounded-2xl border-2 bg-gradient-to-br from-transparent to-transparent h-full flex flex-col items-center text-center"
                    style={{
                      borderColor: feature.color,
                      boxShadow: `0 0 12px ${feature.glowColor}, 0 0 20px ${feature.outerGlowColor}`
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      y: -10,
                      boxShadow: `0 0 18px ${feature.glowColor}, 0 0 30px ${feature.hoverOuterGlowColor}`
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Icon with Glow */}
                    <motion.div
                      className="mb-6 relative inline-block"
                      style={{ color: feature.color }}
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.5
                      }}
                    >
                      <div className="absolute inset-0 blur-xl opacity-30 rounded-full" style={{ backgroundColor: feature.color }} />
                      <div className="relative">
                        {feature.icon}
                      </div>
                    </motion.div>

                    {/* Title */}
                    <h3 
                      className="text-pixel text-xl md:text-2xl mb-4 w-full"
                      style={{ 
                        color: feature.color,
                        textShadow: `0 0 6px ${feature.color}, 0 0 12px ${feature.color}`
                      }}
                    >
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-300 leading-relaxed text-base text-center">
                      {feature.description}
                    </p>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Landing

