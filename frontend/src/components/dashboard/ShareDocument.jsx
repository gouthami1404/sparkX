import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Copy, CheckCircle, X, ExternalLink } from 'lucide-react'
import { ethers } from 'ethers'
import { getCredentialManagerContractReadOnly } from '../../utils/web3'
import { formatAddress } from '../../utils/helpers'

const ShareDocument = ({ account }) => {
  const [credentials, setCredentials] = useState([])
  const [selectedCredential, setSelectedCredential] = useState(null)
  const [recipientAddress, setRecipientAddress] = useState('')
  const [shareUrl, setShareUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadCredentials()
  }, [account])

  const loadCredentials = async () => {
    if (!account || !account.startsWith('0x')) {
      setCredentials([])
      return
    }

    setLoading(true)
    try {
      const contract = getCredentialManagerContractReadOnly()
      const normalizedAccount = ethers.getAddress(account)
      
      // Get credentials issued by this account (as issuer)
      const credentialIds = await contract.getCredentialsByIssuer(normalizedAccount)
      
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
          }
        } catch (err) {
          return null
        }
      })

      const credentialData = await Promise.all(credentialPromises)
      const validCredentials = credentialData.filter(cred => cred !== null && !cred.isRevoked)
      setCredentials(validCredentials)
    } catch (error) {
      console.error('Error loading credentials:', error)
      setCredentials([])
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateUrl = () => {
    if (!selectedCredential) {
      setMessage({ type: 'error', text: 'Please select a document to share' })
      return
    }

    if (!recipientAddress.trim()) {
      setMessage({ type: 'error', text: 'Please enter recipient address' })
      return
    }

    if (!ethers.isAddress(recipientAddress.trim())) {
      setMessage({ type: 'error', text: 'Invalid Ethereum address' })
      return
    }

    try {
      const normalizedRecipient = ethers.getAddress(recipientAddress.trim())
      
      // Create shareable URL with credential ID and recipient address
      const baseUrl = window.location.origin
      // credentialId is already a string from the contract
      const params = new URLSearchParams({
        credentialId: String(selectedCredential.credentialId),
        recipient: normalizedRecipient,
        issuer: String(selectedCredential.issuer)
      })
      
      const url = `${baseUrl}/dashboard/receive?${params.toString()}`
      setShareUrl(url)
      setMessage({ type: 'success', text: 'Shareable URL generated successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: `Error generating URL: ${error.message}` })
    }
  }

  const handleCopyUrl = async () => {
    if (!shareUrl) return
    
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to copy URL' })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-3xl font-bold text-gray-100 mb-2">Share Document</h2>
        <p className="text-gray-400">
          Generate a shareable URL to send a document to a specific recipient.
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
        {/* Step 1: Select Document */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            1. Select Document to Share
          </label>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading documents...</div>
          ) : credentials.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No documents available to share.</p>
              <p className="text-sm mt-2">Issue documents first to share them.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {credentials.map((credential, index) => (
                <motion.div
                  key={index}
                  onClick={() => {
                    setSelectedCredential(credential)
                    setShareUrl('')
                    setMessage(null)
                  }}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedCredential?.credentialId === credential.credentialId
                      ? 'border-neon-cyan bg-neon-cyan/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-gray-100 font-medium mb-1">
                        Credential ID: {formatAddress(credential.credentialId)}
                      </div>
                      <div className="text-sm text-gray-400">
                        <div>Issued to: <span className="text-neon-cyan font-mono">{formatAddress(credential.subject)}</span></div>
                        <div>Date: {credential.issuedAt.toLocaleDateString()}</div>
                      </div>
                    </div>
                    {selectedCredential?.credentialId === credential.credentialId && (
                      <CheckCircle className="text-neon-cyan" size={20} />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Enter Recipient Address */}
        {selectedCredential && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <label className="block text-sm font-medium text-gray-300 mb-2">
              2. Enter Recipient Public Key (Wallet Address)
            </label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => {
                setRecipientAddress(e.target.value)
                setShareUrl('')
                setMessage(null)
              }}
              placeholder="0x..."
              className="w-full px-4 py-3 bg-dark-card border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/20"
            />
            <p className="text-xs text-gray-500 mt-1">
              The Ethereum address of the person who will receive this document
            </p>
          </motion.div>
        )}

        {/* Step 3: Generate URL */}
        {selectedCredential && recipientAddress && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={handleGenerateUrl}
              className="neon-button w-full py-3 flex items-center justify-center gap-2"
            >
              <Share2 size={20} />
              Generate Shareable URL
            </button>
          </motion.div>
        )}

        {/* Generated URL */}
        {shareUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-dark-card rounded-lg border border-neon-cyan/30"
          >
            <label className="block text-sm font-medium text-gray-300 mb-2">
              3. Shareable URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-4 py-2 bg-dark-bg border border-gray-700 rounded-lg text-gray-100 text-sm font-mono"
              />
              <button
                onClick={handleCopyUrl}
                className="neon-button-secondary px-4 py-2 flex items-center gap-2"
              >
                {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="neon-button-secondary px-4 py-2 flex items-center gap-2"
              >
                <ExternalLink size={18} />
                Open
              </a>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Send this URL to the recipient. When they open it, they can receive the document.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default ShareDocument

