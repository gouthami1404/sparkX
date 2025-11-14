import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, CheckCircle, X } from 'lucide-react'
import { ethers } from 'ethers'
import { getCredentialManagerContract, getCredentialManagerContractReadOnly } from '../../utils/web3'
import { uploadToIPFS } from '../../utils/ipfs'

const IssueDocument = ({ account }) => {
  const [subjectAddress, setSubjectAddress] = useState('')
  const [credentialName, setCredentialName] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      if (!credentialName) {
        setCredentialName(file.name.replace(/\.[^/.]+$/, ''))
      }
    }
  }

  const handleIssue = async (e) => {
    e.preventDefault()

    if (!subjectAddress.trim()) {
      setMessage({ type: 'error', text: 'Recipient address is required' })
      return
    }

    if (!ethers.isAddress(subjectAddress)) {
      setMessage({ type: 'error', text: 'Invalid Ethereum address' })
      return
    }

    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select a file to upload' })
      return
    }

    setLoading(true)
    setMessage(null)
    setSuccess(false)

    try {
      // Normalize addresses to checksummed format (ensures case consistency)
      const normalizedSubject = ethers.getAddress(subjectAddress.trim())
      const normalizedIssuer = ethers.getAddress(account)
      
      console.log('Issuing credential:')
      console.log('  Issuer (from):', normalizedIssuer)
      console.log('  Subject (to):', normalizedSubject)

      // Step 1: Upload to IPFS
      setMessage({ type: 'info', text: 'Uploading file to secure storage...' })
      const ipfsHash = await uploadToIPFS(selectedFile)
      console.log('File uploaded to IPFS:', ipfsHash)

      // Step 2: Generate credential ID
      const credentialIdData = `${normalizedIssuer}${normalizedSubject}${Date.now()}${credentialName}`
      const credentialId = ethers.id(credentialIdData)
      console.log('Credential ID:', credentialId)

      // Step 3: Issue credential on-chain
      setMessage({ type: 'info', text: 'Issuing credential on blockchain...' })
      const contract = await getCredentialManagerContract()
      const tx = await contract.issueCredential(
        normalizedSubject,
        ipfsHash,
        credentialId
      )
      const receipt = await tx.wait()
      
      console.log('Transaction confirmed:', tx.hash)
      console.log('Transaction receipt status:', receipt.status)
      
      if (receipt.status !== 1) {
        throw new Error('Transaction failed! Status: ' + receipt.status)
      }
      
      // Check for CredentialIssued event in the receipt
      const contractInterface = contract.interface
      const logs = receipt.logs
      console.log('Transaction logs:', logs.length)
      
      for (const log of logs) {
        try {
          const parsedLog = contractInterface.parseLog(log)
          if (parsedLog && parsedLog.name === 'CredentialIssued') {
            console.log('✅ CredentialIssued event found:', parsedLog.args)
            console.log('   Event credentialId:', parsedLog.args.credentialId)
            console.log('   Event issuer:', parsedLog.args.issuer)
            console.log('   Event subject:', parsedLog.args.subject)
          }
        } catch (e) {
          // Not our event, skip
        }
      }
      
      console.log('Credential issued to:', normalizedSubject)
      console.log('Credential ID:', credentialId)
      
      // Wait a bit longer and verify with retries
      let verified = false
      let storedIssuerAddress = null
      
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second between retries
        try {
          const verifyContract = getCredentialManagerContractReadOnly()
          const storedCredential = await verifyContract.getCredential(credentialId)
          console.log(`✅ Credential verified on-chain (attempt ${i + 1}):`, storedCredential)
          console.log('   Stored subject:', storedCredential.subject)
          console.log('   Stored issuer:', storedCredential.issuer)
          storedIssuerAddress = storedCredential.issuer
          console.log('   IPFS Hash:', storedCredential.ipfsHash)
          
          // Try to get issuer's credentials using the STORED issuer address
          try {
            const issuerCreds = await verifyContract.getCredentialsByIssuer(storedCredential.issuer)
            console.log('✅ Credentials for issuer (using stored address):', issuerCreds.length, issuerCreds)
          } catch (e) {
            console.log('Could not get issuer credentials list:', e.message)
          }
          
          // Also verify it's in the subject's list
          try {
            const subjectCreds = await verifyContract.getCredentialsBySubject(normalizedSubject)
            console.log('✅ Credentials for subject:', subjectCreds.length, subjectCreds)
          } catch (e) {
            console.log('Could not get subject credentials list (might be empty array):', e.message)
          }
          
          verified = true
          break
        } catch (verifyError) {
          if (i === 4) {
            console.warn('⚠️ Could not verify credential after 5 attempts:', verifyError.message)
            console.log('   Transaction succeeded, but cannot read credential back')
            console.log('   This might indicate a contract/ABI mismatch')
          }
        }
      }
      
      if (verified && storedIssuerAddress) {
        console.log('')
        console.log('🔍 IMPORTANT: The credential was stored with issuer address:', storedIssuerAddress)
        console.log('   Your current account:', account)
        console.log('   Normalized issuer:', normalizedIssuer)
        console.log('   If these don\'t match exactly, you won\'t see the credential in Issuer Dashboard')
        console.log('   Use the STORED issuer address to query credentials')
      }
      
      if (!verified) {
        console.log('💡 Tip: The credential was issued successfully (transaction confirmed)')
        console.log('💡 But we cannot read it back - this might be a contract issue')
        console.log('💡 Try: Re-deploy contracts and issue a new credential')
      }
      
      setMessage({ 
        type: 'success', 
        text: `Credential issued successfully! Check "Issuer Dashboard" to see it. Transaction: ${tx.hash.substring(0, 20)}...` 
      })
      setSuccess(true)
      
      // Auto-refresh issuer dashboard after 3 seconds
      setTimeout(() => {
        console.log('💡 Auto-refreshing in 3 seconds... Go to Issuer Dashboard tab to see your credential.')
      }, 3000)

      // Reset form
      setSubjectAddress('')
      setCredentialName('')
      setSelectedFile(null)
      const fileInput = document.getElementById('file-input')
      if (fileInput) fileInput.value = ''
    } catch (error) {
      console.error('Error issuing credential:', error)
      setMessage({ 
        type: 'error', 
        text: `Failed to issue credential: ${error.message}` 
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
        <h2 className="text-3xl font-bold text-gray-100 mb-2">Issue Document</h2>
        <p className="text-gray-400">
          Upload a document and issue it as a verifiable credential to a recipient.
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
                : message.type === 'success'
                ? 'bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan'
                : 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {success && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-6 rounded-xl border-2 border-neon-cyan/50"
        >
          <div className="flex items-center gap-3 text-neon-cyan mb-4">
            <CheckCircle size={32} />
            <h3 className="text-xl font-bold">Credential Issued Successfully!</h3>
          </div>
          <p className="text-gray-400">
            The document has been uploaded to secure storage and issued as a verifiable credential on the blockchain.
          </p>
        </motion.div>
      )}

      <form onSubmit={handleIssue} className="glass-card p-8 rounded-xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            value={subjectAddress}
            onChange={(e) => setSubjectAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-3 bg-dark-card border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/20"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            The Ethereum address of the person receiving this document
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Document Name
          </label>
          <input
            type="text"
            value={credentialName}
            onChange={(e) => setCredentialName(e.target.value)}
            placeholder="e.g., Degree Certificate, Employment Letter"
            className="w-full px-4 py-3 bg-dark-card border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Document File
          </label>
          <div
            onClick={() => document.getElementById('file-input').click()}
            className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-neon-cyan transition-colors"
          >
            <input
              id="file-input"
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              required
            />
            <Upload size={48} className="mx-auto mb-4 text-gray-600" />
            {selectedFile ? (
              <div>
                <p className="text-neon-cyan font-medium">{selectedFile.name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-gray-400 mb-1">Click to select file</p>
                <p className="text-sm text-gray-500">or drag and drop</p>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            File will be uploaded to secure decentralized storage (IPFS)
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="neon-button w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Issuing...' : 'Issue Credential'}
        </button>
      </form>
    </motion.div>
  )
}

export default IssueDocument

