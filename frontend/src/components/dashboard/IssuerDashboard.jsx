import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, X, Eye, CheckCircle, AlertCircle } from 'lucide-react'
import { ethers } from 'ethers'
import { getCredentialManagerContract, getCredentialManagerContractReadOnly } from '../../utils/web3'
import { formatAddress, formatDate } from '../../utils/helpers'
import { getIPFSFileUrl } from '../../utils/ipfs'

const IssuerDashboard = ({ account }) => {
  const [issuedCredentials, setIssuedCredentials] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingCredentials, setLoadingCredentials] = useState(true)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (account && account.startsWith('0x')) {
      loadIssuedCredentials()
    }
  }, [account])

  const loadIssuedCredentials = async () => {
    if (!account || !account.startsWith('0x')) {
      setLoadingCredentials(false)
      setIssuedCredentials([])
      return
    }

    setLoadingCredentials(true)
    try {
      const contract = getCredentialManagerContractReadOnly()
      const contractAddress = contract.target || contract.address
      console.log('Contract address:', contractAddress)
      
      if (!contractAddress || contractAddress === '0x') {
        console.warn('❌ Contract address not set!')
        console.warn('   Make sure contracts are deployed and contractAddresses.json is updated')
        setIssuedCredentials([])
        setLoadingCredentials(false)
        return
      }
      
      // Verify contract is deployed at this address
      try {
        const provider = contract.provider
        const code = await provider.getCode(contractAddress)
        if (code === '0x' || code === '0x0') {
          console.error('❌ No contract code found at address:', contractAddress)
          console.error('   The contract might not be deployed, or the address is wrong')
          setIssuedCredentials([])
          setLoadingCredentials(false)
          return
        } else {
          console.log('✅ Contract code found at address (length:', code.length, 'bytes)')
        }
      } catch (e) {
        console.warn('Could not verify contract code:', e.message)
      }

      let credentialIds = []
      
      // Try normalized (checksummed) address first
      const normalizedAccount = ethers.getAddress(account)
      console.log('Loading credentials issued by (normalized):', normalizedAccount)
      console.log('Original account:', account)
      
      // First, check if there are any credentials at all
      // Note: getTotalCredentials might not be available in all contract versions
      try {
        const totalCreds = await contract.getTotalCredentials()
        console.log('Total credentials in contract:', totalCreds.toString())
        if (totalCreds.toString() === '0') {
          console.log('⚠️ No credentials exist in the contract at all')
          setIssuedCredentials([])
          setLoadingCredentials(false)
          return
        }
      } catch (e) {
        console.log('Could not get total credentials count (function might not exist):', e.message)
        // This is okay, continue anyway - the function might not be in the deployed contract
      }
      
      // IMPORTANT: Try querying with the actual transaction sender address
      // The contract stores msg.sender, which might be in a different format
      // Let's try the account as-is from MetaMask first
      
      // Try multiple address formats to find credentials
      const addressVariants = [
        account, // Try original account first (as MetaMask provides it)
        normalizedAccount,
        account.toLowerCase(),
        ethers.getAddress(account.toLowerCase()) // Re-checksum lowercase
      ].filter((addr, index, self) => self.indexOf(addr) === index) // Remove duplicates
      
      console.log('Trying address variants:', addressVariants)
      console.log('Note: Contract stores msg.sender from transaction, which might differ from normalized address')
      
      try {
        for (const addressVariant of addressVariants) {
          try {
            // Try to call the function - handle both success and empty array
            const result = await contract.getCredentialsByIssuer(addressVariant)
            console.log(`Contract call result for ${addressVariant}:`, result)
            
            // Check if result is an array with items
            if (result && Array.isArray(result) && result.length > 0) {
              credentialIds = result
              console.log(`✅ Found ${credentialIds.length} credential(s) with address: ${addressVariant}`)
              break
            } else if (result && Array.isArray(result) && result.length === 0) {
              console.log(`Empty array for ${addressVariant}, trying next...`)
              continue
            } else {
              credentialIds = result || []
            }
          } catch (callError) {
            // If it's a decoding error for empty result, try next variant
            if (callError.message && callError.message.includes('value="0x"')) {
              console.log(`Empty result (decode error) for ${addressVariant}, trying next...`)
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
          console.log('   💡 The credential WAS issued (transaction succeeded)')
          console.log('   💡 But the contract might be storing the issuer in a different address format')
          console.log('   💡 Try: Check Hardhat node terminal for transaction details')
          console.log('   💡 Or: Re-deploy contracts to ensure ABI matches')
          setIssuedCredentials([])
          setLoadingCredentials(false)
          return
        }
      } catch (error) {
        console.error('Error fetching credentials:', error)
        setIssuedCredentials([])
        setLoadingCredentials(false)
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
      console.log('Loaded issued credentials:', validCredentials.length, validCredentials)
      setIssuedCredentials(validCredentials)
    } catch (error) {
      console.error('Error loading issued credentials:', error)
      setIssuedCredentials([])
    } finally {
      setLoadingCredentials(false)
    }
  }

  const handleRevoke = async (credentialId) => {
    if (!window.confirm('Are you sure you want to revoke this credential?')) {
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const contract = await getCredentialManagerContract()
      const tx = await contract.revokeCredential(credentialId)
      await tx.wait()

      setMessage({ 
        type: 'success', 
        text: `Credential revoked successfully! Transaction: ${tx.hash.substring(0, 20)}...` 
      })

      setTimeout(() => {
        loadIssuedCredentials()
      }, 2000)
    } catch (error) {
      console.error('Error revoking credential:', error)
      setMessage({ 
        type: 'error', 
        text: `Failed to revoke credential: ${error.message}` 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-3xl font-bold text-gray-100 mb-2 flex items-center gap-3">
          <Shield size={32} className="text-neon-cyan" />
          Issuer Dashboard
        </h2>
        <p className="text-gray-400 mb-2">
          Manage credentials you have issued. You can revoke them if needed.
        </p>
        <p className="text-sm text-gray-500">
          Issued by: <span className="text-neon-cyan font-mono">{formatAddress(account)}</span>
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

      {loadingCredentials ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse-neon text-neon-cyan">Loading credentials...</div>
        </div>
      ) : issuedCredentials.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 rounded-xl text-center"
        >
          <Shield size={64} className="mx-auto mb-4 text-gray-600" />
          <p className="text-xl text-gray-400 mb-2">No credentials issued yet</p>
          <p className="text-gray-500">
            Issue a credential using the "Issue Document" tab.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-gray-400">
            {issuedCredentials.length} credential{issuedCredentials.length !== 1 ? 's' : ''} issued
          </div>
          {issuedCredentials.map((credential, index) => (
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
                  <div className="flex items-center gap-3 mb-4">
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
                      <span className="text-gray-500">Recipient:</span>{' '}
                      <span className="text-neon-cyan font-mono">{formatAddress(credential.subject)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Issued on:</span>{' '}
                      <span className="text-gray-300">{formatDate(credential.issuedAt)}</span>
                    </div>
                    {credential.revokedAt && (
                      <div>
                        <span className="text-gray-500">Revoked on:</span>{' '}
                        <span className="text-red-400">{formatDate(credential.revokedAt)}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">IPFS Hash:</span>{' '}
                      <span className="text-gray-400 font-mono text-xs break-all">{credential.ipfsHash}</span>
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
                  {!credential.isRevoked && (
                    <button
                      onClick={() => handleRevoke(credential.credentialId)}
                      disabled={loading}
                      className="px-4 py-2 text-sm bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <X size={16} />
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={loadIssuedCredentials}
          disabled={loadingCredentials}
          className="neon-button-secondary px-6 py-3 disabled:opacity-50"
        >
          {loadingCredentials ? 'Loading...' : 'Refresh'}
        </button>
        <div className="text-sm text-gray-500 flex items-center">
          <span>Connected as: </span>
          <span className="text-neon-cyan font-mono ml-2">{formatAddress(account)}</span>
        </div>
      </div>
    </motion.div>
  )
}

export default IssuerDashboard

