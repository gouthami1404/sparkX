import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, FileText, Shield, X, CheckCircle, Edit2, Save, Tag, Calendar, User } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { ethers } from 'ethers'
import { getCredentialManagerContractReadOnly } from '../../utils/web3'
import { formatAddress, formatDate } from '../../utils/helpers'
import { getIPFSFileUrl } from '../../utils/ipfs'

// Helper functions for metadata storage
const getMetadataKey = (credentialId) => `credential_metadata_${credentialId}`
const getMetadata = (credentialId) => {
  try {
    const stored = localStorage.getItem(getMetadataKey(credentialId))
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}
const saveMetadata = (credentialId, metadata) => {
  try {
    localStorage.setItem(getMetadataKey(credentialId), JSON.stringify(metadata))
    return true
  } catch {
    return false
  }
}

const MyDocuments = ({ account }) => {
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category') || 'all'
  const [credentials, setCredentials] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCredential, setSelectedCredential] = useState(null)
  const [editingCredential, setEditingCredential] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', category: '', description: '', notes: '' })

  useEffect(() => {
    loadCredentials()
  }, [account])

  // Listen for credential issued events to auto-refresh
  useEffect(() => {
    const handleCredentialIssued = () => {
      // Wait a bit for blockchain to update, then refresh
      setTimeout(() => {
        loadCredentials()
      }, 2000)
    }

    window.addEventListener('credentialIssued', handleCredentialIssued)
    return () => {
      window.removeEventListener('credentialIssued', handleCredentialIssued)
    }
  }, [account]) // Include account to ensure we have the right context

  const loadCredentials = async () => {
    if (!account || !account.startsWith('0x')) {
      setLoading(false)
      setCredentials([])
      return
    }

    setLoading(true)
    try {
      const contract = getCredentialManagerContractReadOnly()
      let credentialIds = []
      
      // Try normalized (checksummed) address first
      const normalizedAccount = ethers.getAddress(account)
      console.log('Loading credentials for subject (normalized):', normalizedAccount)
      console.log('Original account:', account)
      
      // First, check if there are any credentials at all
      try {
        const totalCreds = await contract.getTotalCredentials()
        console.log('Total credentials in contract:', totalCreds.toString())
        if (totalCreds.toString() === '0') {
          console.log('⚠️ No credentials exist in the contract at all')
          setCredentials([])
          setLoading(false)
          return
        }
      } catch (e) {
        console.log('Could not get total credentials count:', e.message)
        // This is okay, continue anyway
      }
      
      // Try multiple address formats to find credentials
      const addressVariants = [
        normalizedAccount,
        account.toLowerCase(),
        account,
        ethers.getAddress(account.toLowerCase()) // Re-checksum lowercase
      ].filter((addr, index, self) => self.indexOf(addr) === index) // Remove duplicates
      
      console.log('Trying address variants:', addressVariants)
      
      try {
        for (const addressVariant of addressVariants) {
          try {
            credentialIds = await contract.getCredentialsBySubject(addressVariant)
            console.log(`Contract call result for ${addressVariant}:`, credentialIds)
            
            if (credentialIds && credentialIds.length > 0) {
              console.log(`✅ Found ${credentialIds.length} credential(s) with address: ${addressVariant}`)
              break
            }
          } catch (callError) {
            // If it's a decoding error for empty result, try next variant
            if (callError.message && callError.message.includes('value="0x"')) {
              console.log(`Empty result for ${addressVariant}, trying next...`)
              continue
            } else {
              console.log(`Error with ${addressVariant}:`, callError.message)
              continue
            }
          }
        }
        
        if (!credentialIds || credentialIds.length === 0) {
          console.log('❌ No credentials found with any address format')
          console.log('   Tried:', addressVariants)
          console.log('   Make sure credentials were issued TO this exact address')
          setCredentials([])
          setLoading(false)
          return
        }
      } catch (error) {
        console.error('Error fetching credentials:', error)
        setCredentials([])
        setLoading(false)
        return
      }

      const credentialPromises = credentialIds.map(async (credentialId) => {
        try {
          const credential = await contract.getCredential(credentialId)
          const credentialIdStr = credentialId.toString()
          
          // Load metadata from localStorage
          const metadata = getMetadata(credentialIdStr) || {}
          
          return {
            credentialId: credentialId,
            credentialIdStr: credentialIdStr,
            issuer: credential.issuer,
            subject: credential.subject,
            ipfsHash: credential.ipfsHash,
            isRevoked: credential.isRevoked,
            issuedAt: new Date(Number(credential.issuedAt) * 1000),
            revokedAt: credential.revokedAt > 0 
              ? new Date(Number(credential.revokedAt) * 1000) 
              : null,
            // Add metadata fields
            name: metadata.name || 'Untitled Document',
            category: metadata.category || 'other',
            description: metadata.description || '',
            notes: metadata.notes || '',
          }
        } catch (err) {
          return null
        }
      })

      const credentialData = await Promise.all(credentialPromises)
      const validCredentials = credentialData.filter(cred => cred !== null)
      console.log('Loaded credentials:', validCredentials.length, validCredentials)
      setCredentials(validCredentials)
    } catch (error) {
      console.error('Error loading credentials:', error)
      setCredentials([])
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (credential) => {
    setEditingCredential(credential.credentialIdStr)
    setEditForm({
      name: credential.name || '',
      category: credential.category || 'other',
      description: credential.description || '',
      notes: credential.notes || '',
    })
  }

  const handleSaveMetadata = (credentialIdStr) => {
    if (saveMetadata(credentialIdStr, editForm)) {
      // Update the credential in state
      setCredentials(prev => prev.map(cred => 
        cred.credentialIdStr === credentialIdStr
          ? { ...cred, ...editForm }
          : cred
      ))
      setEditingCredential(null)
      setEditForm({ name: '', category: '', description: '', notes: '' })
    }
  }

  const handleCancelEdit = () => {
    setEditingCredential(null)
    setEditForm({ name: '', category: '', description: '', notes: '' })
  }

  const filteredCredentials = category === 'all' 
    ? credentials 
    : credentials.filter(c => (c.category || 'other') === category)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse-neon text-neon-cyan">Loading documents...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-100">My Documents</h2>
          <p className="text-sm text-gray-500 mt-1">
            Documents issued to: <span className="text-neon-cyan font-mono">{formatAddress(account)}</span>
            {account && account !== ethers.getAddress(account) && (
              <span className="text-xs text-yellow-400 ml-2">(normalized: {formatAddress(ethers.getAddress(account))})</span>
            )}
          </p>
        </div>
        <div className="text-sm text-gray-400">
          {filteredCredentials.length} document{filteredCredentials.length !== 1 ? 's' : ''}
        </div>
      </div>

      <button
        onClick={loadCredentials}
        disabled={loading}
        className="neon-button-secondary px-4 py-2 text-sm mb-4 disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Refresh'}
      </button>

      {filteredCredentials.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 rounded-xl text-center"
        >
          <FileText size={64} className="mx-auto mb-4 text-gray-600" />
          <p className="text-xl text-gray-400 mb-2">No documents found</p>
          <p className="text-gray-500">
            Documents will appear here once an issuer issues them to your address.
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {filteredCredentials.map((credential, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass-card p-6 rounded-xl ${
                credential.isRevoked ? 'opacity-60 border-red-500/50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    {credential.isRevoked ? (
                      <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium flex items-center gap-2">
                        <X size={14} />
                        Revoked
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-neon-cyan/20 text-neon-cyan rounded-full text-sm font-medium flex items-center gap-2">
                        <CheckCircle size={14} />
                        Active
                      </span>
                    )}
                    {credential.category && credential.category !== 'other' && (
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium flex items-center gap-2">
                        <Tag size={14} />
                        {credential.category}
                      </span>
                    )}
                  </div>
                  
                  {editingCredential === credential.credentialIdStr ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Document Name</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-3 py-2 bg-dark-card border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-neon-cyan"
                          placeholder="Enter document name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Category</label>
                        <select
                          value={editForm.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          className="w-full px-3 py-2 bg-dark-card border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-neon-cyan"
                        >
                          <option value="educational">Educational</option>
                          <option value="employment">Employment</option>
                          <option value="medical">Medical</option>
                          <option value="confidential">Confidential</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Description</label>
                        <input
                          type="text"
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="w-full px-3 py-2 bg-dark-card border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-neon-cyan"
                          placeholder="Brief description"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Notes</label>
                        <textarea
                          value={editForm.notes}
                          onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                          className="w-full px-3 py-2 bg-dark-card border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-neon-cyan"
                          placeholder="Your personal notes..."
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveMetadata(credential.credentialIdStr)}
                          className="neon-button px-4 py-2 text-sm flex items-center gap-2"
                        >
                          <Save size={16} />
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 text-sm bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-100 mb-1">
                          {credential.name || 'Untitled Document'}
                        </h3>
                        {credential.description && (
                          <p className="text-sm text-gray-400">{credential.description}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-gray-500" />
                          <span className="text-gray-500">Issued by:</span>{' '}
                          <span className="text-neon-cyan font-mono">{formatAddress(credential.issuer)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-500" />
                          <span className="text-gray-500">Issued on:</span>{' '}
                          <span className="text-gray-300">{formatDate(credential.issuedAt)}</span>
                        </div>
                        {credential.notes && (
                          <div className="mt-2 p-3 bg-dark-card rounded-lg">
                            <span className="text-xs text-gray-500">Notes:</span>
                            <p className="text-sm text-gray-300 mt-1">{credential.notes}</p>
                          </div>
                        )}
                        <div className="pt-2 border-t border-gray-700">
                          <span className="text-gray-500 text-xs">IPFS Hash:</span>{' '}
                          <span className="text-gray-400 font-mono text-xs break-all">{credential.ipfsHash}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4 flex-shrink-0">
                  {editingCredential !== credential.credentialIdStr && (
                    <>
                      <button
                        onClick={() => handleEdit(credential)}
                        className="neon-button-secondary px-3 py-2 text-sm flex items-center gap-2"
                        title="Edit metadata"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => window.open(getIPFSFileUrl(credential.ipfsHash), '_blank')}
                        className="neon-button-secondary px-3 py-2 text-sm flex items-center gap-2"
                        title="View document"
                      >
                        <Eye size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* View Modal */}
      {selectedCredential && (
        <CredentialModal
          credential={selectedCredential}
          onClose={() => setSelectedCredential(null)}
        />
      )}
    </div>
  )
}

const CredentialModal = ({ credential, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.9 }}
      onClick={(e) => e.stopPropagation()}
      className="glass-card p-8 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-100">Document Details</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-neon-cyan"
        >
          <X size={24} />
        </button>
      </div>
      {/* Modal content */}
    </motion.div>
  </motion.div>
)

export default MyDocuments

