import { motion } from 'framer-motion'
import { Wallet, Upload, Share2 } from 'lucide-react'
import { connectWallet } from '../utils/web3'
import Particles from '../components/Particles.jsx'

const Landing = ({ setAccount }) => {
  const handleConnect = async () => {
    try {
      const account = await connectWallet()
      setAccount(account)
      // Navigation to dashboard is handled by App.jsx
    } catch (error) {
      console.error('Connection error:', error)
      alert('Failed to connect wallet. Please make sure MetaMask is installed and unlocked.')
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      {/* Particles Background - Star-like animation */}
      <div className="absolute inset-0 z-0">
        <Particles
          particleColors={['#ffffff', '#ffffff', '#ffffff']}
          particleCount={300}
          particleSpread={15}
          speed={0.05}
          particleBaseSize={50}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>
      
      {/* Floating Neon Orbs Background */}
      <motion.div
        className="glow-orb w-96 h-96 bg-neon-cyan top-20 left-10"
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="glow-orb w-80 h-80 bg-neon-purple bottom-20 right-10"
        animate={{
          y: [0, 30, 0],
          x: [0, -20, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      <motion.div
        className="glow-orb w-72 h-72 bg-neon-cyan top-1/2 right-1/4"
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

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
                  textShadow: '0 0 5px rgba(255, 255, 255, 0.3), 0 0 10px rgba(255, 255, 255, 0.2)'
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
                <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-100">
                  Own Your Digital Identity
                </h2>
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
              >
                Securely store and share your important documents. You stay in control.
              </motion.p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex justify-center items-center mb-16"
            >
              <motion.button
                onClick={handleConnect}
                className="neon-button text-lg px-8 py-4 flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Wallet size={24} />
                Connect Wallet
              </motion.button>
            </motion.div>
          </div>

          {/* How It Works Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-32"
          >
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-pixel text-3xl md:text-4xl text-white text-center mb-4"
              style={{ 
                textShadow: '0 0 5px rgba(255, 255, 255, 0.3), 0 0 10px rgba(255, 255, 255, 0.2)'
              }}
            >
              How It Works
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-lg text-gray-400 text-center mb-12 max-w-2xl mx-auto"
            >
              Simple, secure, and completely under your control. Here's how you can own your digital identity.
            </motion.p>

            {/* Steps */}
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  number: '1',
                  icon: <Wallet size={40} />,
                  title: 'Connect Your Wallet',
                  description: 'Connect your MetaMask wallet. This becomes your unique digital identity - no passwords, no usernames, just your secure key. Your wallet address is your ID.',
                  colorClass: 'text-neon-cyan',
                  gradient: 'from-cyan-500/20 to-cyan-900/10'
                },
                {
                  number: '2',
                  icon: <Upload size={40} />,
                  title: 'Upload Documents',
                  description: 'Upload important documents like degrees, certificates, or IDs. They\'re stored securely on IPFS (a decentralized cloud) - only you control access.',
                  colorClass: 'text-neon-purple',
                  gradient: 'from-purple-500/20 to-purple-900/10'
                },
                {
                  number: '3',
                  icon: <Share2 size={40} />,
                  title: 'Share or Verify',
                  description: 'Share your documents when needed, or let others verify their authenticity. Generate proof documents with only the information you want to share.',
                  colorClass: 'text-neon-cyan',
                  gradient: 'from-cyan-500/20 to-cyan-900/10'
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  className="relative"
                >
                  <motion.div
                    className={`glass-card p-8 rounded-2xl border-2 bg-gradient-to-br ${step.gradient} ${index % 2 === 0 ? 'border-cyan-500/30' : 'border-purple-500/30'} h-full`}
                    whileHover={{ 
                      scale: 1.05,
                      y: -10,
                      boxShadow: "0 0 40px rgba(0, 255, 198, 0.3)"
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Step Number */}
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 + 0.3, type: "spring" }}
                      className="text-pixel text-2xl neon-cyan mb-4"
                    >
                      {step.number}
                    </motion.div>

                    {/* Icon with Glow */}
                    <motion.div
                      className={`${step.colorClass} mb-6 relative inline-block`}
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
                      <div className="absolute inset-0 blur-xl opacity-50 bg-current rounded-full" />
                      <div className="relative">
                        {step.icon}
                      </div>
                    </motion.div>

                    {/* Content */}
                    <h3 className="text-xl md:text-2xl font-bold text-gray-100 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {step.description}
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

