import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, CheckCircle, X, AlertCircle, FileText } from 'lucide-react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import { getCredentialManagerContract, getCredentialManagerContractReadOnly } from '../../utils/web3'
import { formatAddress, formatDate } from '../../utils/helpers'
import { getIPFSFileUrl } from '../../utils/ipfs'

const ReceiveDocument = ({ account }) => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [credentialId, setCredentialId] = useState(null)
  const [recipientAddress, setRecipientAddress] = useState(null)
  const [issuerAddress, setIssuerAddress] = useState(null)
  const [credential, setCredential] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const credentialIdParam = searchParams.get('credentialId')
    const recipientParam = searchParams.get('recipient')
    const issuerParam = searchParams.get('issuer')

    if (!credentialIdParam || !recipientParam || !issuerParam) {
      setMessage({ 
        type: 'error', 
        text: 'Invalid share URL. Missing required parameters.' 
      })
      setLoading(false)
      return
    }

    setCredentialId(credentialIdParam)
    setRecipientAddress(recipientParam)
    setIssuerAddress(issuerParam)
    loadCredential(credentialIdParam, recipientParam)
  }, [searchParams])

  const loadCredential = async (credId, recipient) => {
    setLoading(true)
    try {
      // Validate recipient address matches current account
      if (!account) {
        setMessage({ 
          type: 'error', 
          text: 'Please connect your wallet first' 
        })
        setLoading(false)
        return
      }

      const normalizedAccount = ethers.getAddress(account)
      const normalizedRecipient = ethers.getAddress(recipient)

      if (normalizedAccount.toLowerCase() !== normalizedRecipient.toLowerCase()) {
        setMessage({ 
          type: 'error', 
          text: `This document is intended for a different address (${formatAddress(recipient)}). Your address: ${formatAddress(account)}` 
        })
        setLoading(false)
        return
      }

      // Load credential from blockchain
      const contract = getCredentialManagerContractReadOnly()
      // Ensure credentialId is in bytes32 format (ethers handles string to bytes32 conversion)
      const credentialData = await contract.getCredential(credId)

      if (!credentialData || credentialData.issuer === ethers.ZeroAddress) {
        setMessage({ 
          type: 'error', 
          text: 'Document not found. It may have been revoked or does not exist.' 
        })
        setLoading(false)
        return
      }

      // Verify the credential is for this recipient
      const credentialSubject = ethers.getAddress(credentialData.subject)
      if (credentialSubject.toLowerCase() !== normalizedRecipient.toLowerCase()) {
        setMessage({ 
          type: 'error', 
          text: 'This document is not intended for your address.' 
        })
        setLoading(false)
        return
      }

      // Verify issuer matches
      const credentialIssuer = ethers.getAddress(credentialData.issuer)
      const normalizedIssuer = ethers.getAddress(issuerAddress)
      if (credentialIssuer.toLowerCase() !== normalizedIssuer.toLowerCase()) {
        setMessage({ 
          type: 'warning', 
          text: 'Warning: Issuer address does not match the share URL.' 
        })
      }

      setCredential({
        credentialId: credId,
        issuer: credentialData.issuer,
        subject: credentialData.subject,
        ipfsHash: credentialData.ipfsHash,
        isRevoked: credentialData.isRevoked,
        issuedAt: new Date(Number(credentialData.issuedAt) * 1000),
        revokedAt: credentialData.revokedAt > 0 
          ? new Date(Number(credentialData.revokedAt) * 1000) 
          : null,
      })

      if (credentialData.isRevoked) {
        setMessage({ 
          type: 'error', 
          text: 'This document has been revoked by the issuer.' 
        })
      }

    } catch (error) {
      console.error('Error loading credential:', error)
      setMessage({ 
        type: 'error', 
        text: `Failed to load document: ${error.message}` 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReceive = async () => {
    if (!credential || !account) return

    setProcessing(true)
    setMessage(null)

    try {
      // Check if credential already exists for this user
      const contract = getCredentialManagerContractReadOnly()
      const userCredentials = await contract.getCredentialsBySubject(
        ethers.getAddress(account)
      )

      const alreadyExists = userCredentials.some(
        id => id.toLowerCase() === credential.credentialId.toLowerCase()
      )

      if (alreadyExists) {
        setMessage({ 
          type: 'info', 
          text: 'You already have this document. Redirecting to My Documents...' 
        })
        setTimeout(() => {
          navigate('/dashboard/documents')
        }, 2000)
        return
      }

      // The credential is already issued on-chain, so we just need to verify
      // and show it to the user. The document is already in their name.
      setSuccess(true)
      setMessage({ 
        type: 'success', 
        text: 'Document received successfully! You can now view it in My Documents.' 
      })

      setTimeout(() => {
        navigate('/dashboard/documents')
      }, 3000)

    } catch (error) {
      console.error('Error receiving document:', error)
      setMessage({ 
        type: 'error', 
        text: `Failed to receive document: ${error.message}` 
      })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse-neon text-neon-cyan">Loading document...</div>
      </div>
    )
  }

  if (!credential) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card p-12 rounded-xl text-center"
      >
        <AlertCircle size={64} className="mx-auto mb-4 text-red-400" />
        <h2 className="text-2xl font-bold text-gray-100 mb-4">Document Not Found</h2>
        <p className="text-gray-400 mb-6">
          {message?.text || 'The document could not be loaded. Please check the URL and try again.'}
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="neon-button-secondary px-6 py-3"
        >
          Go to Dashboard
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-3xl font-bold text-gray-100 mb-2">Receive Document</h2>
        <p className="text-gray-400">
          Review the document details and accept it to add it to your collection.
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
                : message.type === 'warning'
                ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400'
                : message.type === 'success'
                ? 'bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan'
                : 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {success ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-8 rounded-xl border-2 border-neon-cyan/50 text-center"
        >
          <CheckCircle size={64} className="mx-auto mb-4 text-neon-cyan" />
          <h3 className="text-2xl font-bold text-gray-100 mb-2">Document Received!</h3>
          <p className="text-gray-400 mb-4">
            The document has been added to your collection. Redirecting to My Documents...
          </p>
        </motion.div>
      ) : (
        <div className="glass-card p-8 rounded-xl space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText size={32} className="text-neon-cyan" />
            <h3 className="text-2xl font-bold text-gray-100">Document Details</h3>
          </div>

          {credential.isRevoked && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3">
              <X size={20} className="text-red-400" />
              <span className="text-red-400 font-medium">This document has been revoked</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <span className="text-gray-500 text-sm">Issued by:</span>
              <div className="text-gray-100 font-mono mt-1">{formatAddress(credential.issuer)}</div>
            </div>

            <div>
              <span className="text-gray-500 text-sm">Issued to:</span>
              <div className="text-gray-100 font-mono mt-1">{formatAddress(credential.subject)}</div>
            </div>

            <div>
              <span className="text-gray-500 text-sm">Issued on:</span>
              <div className="text-gray-100 mt-1">{formatDate(credential.issuedAt)}</div>
            </div>

            <div>
              <span className="text-gray-500 text-sm">IPFS Hash:</span>
              <div className="text-gray-400 font-mono text-xs mt-1 break-all">{credential.ipfsHash}</div>
            </div>

            <div>
              <span className="text-gray-500 text-sm">Credential ID:</span>
              <div className="text-gray-400 font-mono text-xs mt-1 break-all">{credential.credentialId}</div>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-700">
            <button
              onClick={() => window.open(getIPFSFileUrl(credential.ipfsHash), '_blank')}
              className="neon-button-secondary flex-1 py-3 flex items-center justify-center gap-2"
            >
              <Download size={20} />
              Preview Document
            </button>
            <button
              onClick={handleReceive}
              disabled={processing || credential.isRevoked}
              className="neon-button flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>Processing...</>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Accept & Receive
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default ReceiveDocument

