import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, Wallet, Upload, Share2, CheckCircle, Sparkles } from 'lucide-react'

const HowItWorks = () => {
  const steps = [
    {
      number: '1',
      icon: <Wallet size={48} />,
      title: 'Connect Your Wallet',
      description: 'Connect your MetaMask wallet. This becomes your unique digital identity - no passwords, no usernames, just your secure key. Your wallet address is your ID.',
      colorClass: 'text-neon-cyan',
      gradient: 'from-cyan-500/20 to-cyan-900/10'
    },
    {
      number: '2',
      icon: <Upload size={48} />,
      title: 'Upload Documents',
      description: 'Upload important documents like degrees, certificates, or IDs. They\'re stored securely on IPFS (a decentralized cloud) - only you control access. Your files are encrypted and distributed across the network.',
      colorClass: 'text-neon-purple',
      gradient: 'from-purple-500/20 to-purple-900/10'
    },
    {
      number: '3',
      icon: <Share2 size={48} />,
      title: 'Share or Verify',
      description: 'Share your documents when needed, or let others verify their authenticity. Generate proof documents with only the information you want to share. No need to reveal everything - just what\'s necessary.',
      colorClass: 'text-neon-cyan',
      gradient: 'from-cyan-500/20 to-cyan-900/10'
    }
  ]

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      {/* Animated Background Orbs */}
      <motion.div
        className="glow-orb w-96 h-96 bg-neon-purple top-10 right-10"
        style={{ opacity: 0.15 }}
        animate={{
          y: [0, -40, 0],
          x: [0, 30, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="glow-orb w-80 h-80 bg-neon-cyan bottom-10 left-10"
        style={{ opacity: 0.15 }}
        animate={{
          y: [0, 40, 0],
          x: [0, -30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      <motion.div
        className="glow-orb w-64 h-64 bg-neon-purple top-1/2 left-1/3"
        style={{ opacity: 0.15 }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.2, 0.15],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-neon-cyan hover:text-neon-purple transition-colors mb-8 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-pixel text-4xl md:text-6xl neon-cyan mb-6"
          >
            How NexID Works
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl md:text-2xl text-gray-400 max-w-3xl leading-relaxed"
          >
            Simple, secure, and completely under your control. Here's how you can own your digital identity in plain English.
          </motion.p>
        </motion.div>

        {/* Steps with Enhanced Animations */}
        <div className="space-y-12 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.3, duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              <motion.div
                className={`glass-card p-8 md:p-10 rounded-2xl border-2 bg-gradient-to-br ${step.gradient} ${index % 2 === 0 ? 'border-blue-500/20' : 'border-indigo-500/20'}`}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 0 16px rgba(59, 130, 246, 0.3), 0 0 24px rgba(59, 130, 246, 0.2)"
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col md:flex-row items-start gap-8">
                  {/* Icon with Glow Effect */}
                  <motion.div
                    className={`${step.colorClass} flex-shrink-0 relative`}
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
                    <div className="absolute inset-0 blur-xl opacity-30 bg-current rounded-full" />
                    <div className="relative">
                      {step.icon}
                    </div>
                  </motion.div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <motion.span
                        className="text-pixel text-3xl neon-cyan"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.3 + 0.2, type: "spring" }}
                      >
                        {step.number}
                      </motion.span>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-100">
                        {step.title}
                      </h2>
                    </div>
                    <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-20 text-center"
        >
          <div className="glass-card p-8 rounded-2xl max-w-2xl mx-auto border-2 border-blue-500/20">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="inline-block mb-6"
            >
              <Sparkles size={48} className="text-neon-cyan mx-auto" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-100 mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-gray-400 mb-6">
              Connect your wallet and start managing your digital identity today.
            </p>
            <Link
              to="/"
              className="neon-button text-lg px-8 py-4 inline-flex items-center gap-2"
            >
              Get Started Now
              <ArrowRight size={20} />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default HowItWorks

