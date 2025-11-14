import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Key, CheckCircle, Edit2, X } from 'lucide-react'
import { getDIDRegistryContract, getDIDRegistryContractReadOnly } from '../../utils/web3'

const DIDManager = ({ account }) => {
  const [did, setDid] = useState('')
  const [hasDID, setHasDID] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [newDID, setNewDID] = useState('')

  useEffect(() => {
    loadDID()
  }, [account])

  const loadDID = async () => {
    if (!account || !account.startsWith('0x')) return

    setLoading(true)
    try {
      const contract = getDIDRegistryContractReadOnly()
      const contractAddress = contract.target || contract.address
      if (!contractAddress || contractAddress === '0x') {
        setHasDID(false)
        return
      }

      let hasRegistered = false
      try {
        hasRegistered = await contract.hasDID(account)
      } catch (error) {
        if (error.message && error.message.includes('value="0x"')) {
          setHasDID(false)
          return
        }
        throw error
      }

      setHasDID(hasRegistered)
      if (hasRegistered) {
        const registeredDID = await contract.getDID(account)
        setDid(registeredDID)
        setNewDID(registeredDID)
      }
    } catch (error) {
      console.error('Error loading DID:', error)
      setHasDID(false)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!newDID.trim()) {
      setMessage({ type: 'error', text: 'DID cannot be empty' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const contract = await getDIDRegistryContract()
      const tx = await contract.registerDID(newDID.trim())
      await tx.wait()

      setDid(newDID.trim())
      setHasDID(true)
      setIsEditing(false)
      setMessage({ type: 'success', text: 'DID registered successfully!' })
    } catch (error) {
      console.error('Error registering DID:', error)
      setMessage({ type: 'error', text: `Failed to register DID: ${error.message}` })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!newDID.trim()) {
      setMessage({ type: 'error', text: 'DID cannot be empty' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const contract = await getDIDRegistryContract()
      const tx = await contract.updateDID(newDID.trim())
      await tx.wait()

      setDid(newDID.trim())
      setIsEditing(false)
      setMessage({ type: 'success', text: 'DID updated successfully!' })
    } catch (error) {
      console.error('Error updating DID:', error)
      setMessage({ type: 'error', text: `Failed to update DID: ${error.message}` })
    } finally {
      setLoading(false)
    }
  }

  if (!account || !account.startsWith('0x')) {
    return (
      <div className="glass-card p-8 rounded-xl text-center">
        <p className="text-gray-400">Please connect your wallet to manage your DID.</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-3xl font-bold text-gray-100 mb-2">DID Manager</h2>
        <p className="text-gray-400">
          Your Decentralized ID (DID) lets apps identify you securely, without central servers.
        </p>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-lg ${
              message.type === 'error' 
                ? 'bg-red-500/20 border border-red-500/50 text-red-400'
                : 'bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan'
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass-card p-8 rounded-xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Your Digital Key (Wallet Address)
          </label>
          <input
            type="text"
            value={account}
            readOnly
            className="w-full px-4 py-3 bg-dark-card border border-gray-700 rounded-lg text-gray-400 font-mono text-sm cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            This is your base identity in NexID
          </p>
        </div>

        {hasDID ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Registered DID
              </label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={isEditing ? newDID : did}
                  onChange={(e) => setNewDID(e.target.value)}
                  readOnly={!isEditing}
                  className={`flex-1 px-4 py-3 rounded-lg ${
                    isEditing 
                      ? 'bg-dark-card border border-neon-cyan text-gray-100'
                      : 'bg-dark-card border border-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                />
                {!isEditing && (
                  <div className="px-3 py-1 bg-neon-cyan/20 text-neon-cyan rounded-full text-sm flex items-center gap-2">
                    <CheckCircle size={14} />
                    Active
                  </div>
                )}
              </div>
            </div>

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                disabled={loading}
                className="neon-button-secondary w-full py-3 flex items-center justify-center gap-2"
              >
                <Edit2 size={20} />
                Edit DID
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="neon-button flex-1 py-3"
                >
                  {loading ? 'Updating...' : 'Update DID'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setNewDID(did)
                  }}
                  disabled={loading}
                  className="neon-button-secondary px-6 py-3 flex items-center gap-2"
                >
                  <X size={20} />
                  Cancel
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Register Your DID
              </label>
              <input
                type="text"
                placeholder="e.g., did:ethr:0x1234567890abcdef..."
                value={newDID}
                onChange={(e) => setNewDID(e.target.value)}
                className="w-full px-4 py-3 bg-dark-card border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/20"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your Decentralized Identifier (DID)
              </p>
            </div>

            <button
              onClick={handleRegister}
              disabled={loading || !newDID.trim()}
              className="neon-button w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Key size={20} />
              {loading ? 'Registering...' : 'Register DID'}
            </button>
          </>
        )}
      </div>
    </motion.div>
  )
}

export default DIDManager

