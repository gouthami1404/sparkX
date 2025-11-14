import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Eye, FileText, Shield, X, CheckCircle } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { ethers } from 'ethers'
import { getCredentialManagerContractReadOnly } from '../../utils/web3'
import { formatAddress, formatDate } from '../../utils/helpers'
import { getIPFSFileUrl } from '../../utils/ipfs'

const MyDocuments = ({ account }) => {
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category') || 'all'
  const [credentials, setCredentials] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCredential, setSelectedCredential] = useState(null)

  useEffect(() => {
    loadCredentials()
  }, [account])

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
          return {
            credentialId: credentialId,
            issuer: credential.issuer,
            subject: credential.subject,
            ipfsHash: credential.ipfsHash,
            isRevoked: credential.isRevoked,
            issuedAt: new Date(Number(credential.issuedAt) * 1000),
            revokedAt: credential.revokedAt > 0 
              ? new Date(Number(credential.revokedAt) * 1000) 
              : null,
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

  const filteredCredentials = category === 'all' 
    ? credentials 
    : credentials.filter(c => c.category === category)

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
                  <div className="flex items-center gap-3 mb-3">
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
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Issued by:</span>{' '}
                      <span className="text-neon-cyan font-mono">{formatAddress(credential.issuer)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Issued on:</span>{' '}
                      <span className="text-gray-300">{formatDate(credential.issuedAt)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">IPFS Hash:</span>{' '}
                      <span className="text-gray-400 font-mono text-xs">{credential.ipfsHash}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => window.open(getIPFSFileUrl(credential.ipfsHash), '_blank')}
                    className="neon-button-secondary px-4 py-2 text-sm flex items-center gap-2"
                  >
                    <Eye size={16} />
                    View
                  </button>
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

