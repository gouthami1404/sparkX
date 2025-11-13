// Contract addresses - will be updated after deployment
// The deploy script writes the actual addresses to contractAddresses.json
// Default values are used if the file doesn't exist yet
import contractAddressesData from './contractAddresses.json';

export const CONTRACT_ADDRESSES = contractAddressesData;

// IPFS Configuration - Using Pinata
// Get your API keys from: https://app.pinata.cloud/
export const IPFS_CONFIG = {
  // Pinata API endpoints
  pinataApiUrl: 'https://api.pinata.cloud',
  pinataJWT: process.env.REACT_APP_PINATA_JWT || '',
  
  // Pinata gateway for retrieving files
  gatewayUrl: 'https://gateway.pinata.cloud/ipfs/',
  
  // Fallback to public IPFS gateway if Pinata fails
  publicGatewayUrl: 'https://ipfs.io/ipfs/',
  
  // Use Pinata by default
  usePinata: true,
};

// Network configuration
export const NETWORK_CONFIG = {
  chainId: 1337, // Hardhat local network
  chainName: 'Hardhat Local',
  rpcUrl: 'http://127.0.0.1:8545',
};

