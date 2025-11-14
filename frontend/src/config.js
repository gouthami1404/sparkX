// Contract addresses - will be updated after deployment
// The deploy script writes the actual addresses to contractAddresses.json
// Default values are used if the file doesn't exist yet
// Import JSON directly - Vite handles this automatically
import contractAddressesData from './contractAddresses.json'

export const CONTRACT_ADDRESSES = contractAddressesData;

// IPFS Configuration - Using Pinata
// Get your API keys from: https://app.pinata.cloud/
export const IPFS_CONFIG = {
  // Pinata API endpoints
  pinataApiUrl: 'https://api.pinata.cloud',
  
  // JWT Token (Preferred method - contains API key and secret)
  // Vite uses import.meta.env instead of process.env
  pinataJWT: import.meta.env.VITE_PINATA_JWT || '',
  
  // API Key and Secret (Alternative method if JWT not available)
  pinataApiKey: import.meta.env.VITE_PINATA_API_KEY || '',
  pinataApiSecret: import.meta.env.VITE_PINATA_API_SECRET || '',
  
  // Pinata gateway for retrieving files
  gatewayUrl: 'https://gateway.pinata.cloud/ipfs/',
  
  // Fallback to public IPFS gateway if Pinata fails
  publicGatewayUrl: 'https://ipfs.io/ipfs/',
  
  // Use Pinata by default (will use JWT if available, otherwise API key/secret)
  usePinata: true,
};

// Network configuration
export const NETWORK_CONFIG = {
  chainId: 1337, // Hardhat local network
  chainName: 'Hardhat Local',
  rpcUrl: 'http://127.0.0.1:8545',
};

