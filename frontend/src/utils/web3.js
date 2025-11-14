import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from '../config';

// ABI for DIDRegistry contract
const DID_REGISTRY_ABI = [
  "function registerDID(string memory did) public",
  "function updateDID(string memory newDid) public",
  "function getDID(address user) public view returns (string memory)",
  "function hasDID(address user) public view returns (bool)",
  "event DIDRegistered(address indexed owner, string did)",
  "event DIDUpdated(address indexed owner, string newDid)"
];

// ABI for CredentialManager contract
const CREDENTIAL_MANAGER_ABI = [
  "function issueCredential(address subject, string memory ipfsHash, bytes32 credentialId) public",
  "function revokeCredential(bytes32 credentialId) public",
  "function getCredential(bytes32 credentialId) public view returns (address issuer, address subject, string memory ipfsHash, bool isRevoked, uint256 issuedAt, uint256 revokedAt)",
  "function getCredentialsBySubject(address subject) public view returns (bytes32[] memory)",
  "function getCredentialsByIssuer(address issuer) public view returns (bytes32[] memory)",
  "function getTotalCredentials() public view returns (uint256)",
  "function verifyCredential(bytes32 credentialId) public view returns (bool)",
  "event CredentialIssued(bytes32 indexed credentialId, address indexed issuer, address indexed subject, string ipfsHash, uint256 timestamp)",
  "event CredentialRevoked(bytes32 indexed credentialId, address indexed issuer, uint256 timestamp)"
];

/**
 * Check if MetaMask is installed
 */
export const checkMetaMask = () => {
  if (typeof window.ethereum !== 'undefined') {
    return true;
  }
  return false;
};

/**
 * Request account access from MetaMask
 */
export const connectWallet = async () => {
  if (!checkMetaMask()) {
    throw new Error('MetaMask is not installed. Please install MetaMask to use this app.');
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    // Check if we're on the correct network
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const targetChainId = `0x${NETWORK_CONFIG.chainId.toString(16)}`;

    if (chainId !== targetChainId) {
      // Try to switch network
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: targetChainId }],
        });
      } catch (switchError) {
        // If network doesn't exist, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: targetChainId,
                chainName: NETWORK_CONFIG.chainName,
                rpcUrls: [NETWORK_CONFIG.rpcUrl],
                nativeCurrency: {
                  name: 'Ether',
                  symbol: 'ETH',
                  decimals: 18,
                },
                blockExplorerUrls: null, // No block explorer for local network
              },
            ],
          });
        } else {
          throw switchError;
        }
      }
    }

    return accounts[0];
  } catch (error) {
    throw new Error(`Failed to connect wallet: ${error.message}`);
  }
};

/**
 * Get the current connected account
 */
export const getCurrentAccount = async () => {
  if (!checkMetaMask()) {
    return null;
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    });
    return accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error('Error getting current account:', error);
    return null;
  }
};

/**
 * Get provider instance with error handling
 */
export const getProvider = () => {
  if (!checkMetaMask()) {
    throw new Error('MetaMask is not installed');
  }
  
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    return provider;
  } catch (error) {
    console.error('Error creating provider:', error);
    throw new Error(`Failed to create provider: ${error.message}`);
  }
};

/**
 * Check if RPC endpoint is accessible
 */
export const checkRpcConnection = async () => {
  try {
    const provider = getProvider();
    const blockNumber = await provider.getBlockNumber();
    return { connected: true, blockNumber };
  } catch (error) {
    console.error('RPC connection check failed:', error);
    return { connected: false, error: error.message };
  }
};

/**
 * Retry a function with exponential backoff
 */
export const retryWithBackoff = async (fn, maxRetries = 3, initialDelay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Check if it's an RPC error that we should retry
      const errorMessage = error.message || error.toString();
      if (errorMessage.includes('RPC endpoint') || 
          errorMessage.includes('too many errors') ||
          errorMessage.includes('network') ||
          error.code === -32002) {
        const delay = initialDelay * Math.pow(2, i);
        console.log(`Retrying after ${delay}ms (attempt ${i + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
};

/**
 * Get signer instance with retry logic
 */
export const getSigner = async () => {
  return await retryWithBackoff(async () => {
    const provider = getProvider();
    return await provider.getSigner();
  });
};

/**
 * Get DIDRegistry contract instance
 */
export const getDIDRegistryContract = async () => {
  if (!CONTRACT_ADDRESSES.DIDRegistry) {
    throw new Error('DIDRegistry contract address not set. Please deploy contracts first.');
  }
  const signer = await getSigner();
  return new ethers.Contract(
    CONTRACT_ADDRESSES.DIDRegistry,
    DID_REGISTRY_ABI,
    signer
  );
};

/**
 * Get CredentialManager contract instance with retry logic
 */
export const getCredentialManagerContract = async () => {
  if (!CONTRACT_ADDRESSES.CredentialManager) {
    throw new Error('CredentialManager contract address not set. Please deploy contracts first.');
  }
  
  return await retryWithBackoff(async () => {
    const signer = await getSigner();
    return new ethers.Contract(
      CONTRACT_ADDRESSES.CredentialManager,
      CREDENTIAL_MANAGER_ABI,
      signer
    );
  });
};

/**
 * Get DIDRegistry contract instance (read-only)
 */
export const getDIDRegistryContractReadOnly = () => {
  if (!CONTRACT_ADDRESSES.DIDRegistry) {
    throw new Error('DIDRegistry contract address not set. Please deploy contracts first.');
  }
  const provider = getProvider();
  return new ethers.Contract(
    CONTRACT_ADDRESSES.DIDRegistry,
    DID_REGISTRY_ABI,
    provider
  );
};

/**
 * Get CredentialManager contract instance (read-only)
 */
export const getCredentialManagerContractReadOnly = () => {
  if (!CONTRACT_ADDRESSES.CredentialManager) {
    throw new Error('CredentialManager contract address not set. Please deploy contracts first.');
  }
  const provider = getProvider();
  return new ethers.Contract(
    CONTRACT_ADDRESSES.CredentialManager,
    CREDENTIAL_MANAGER_ABI,
    provider
  );
};

/**
 * Listen for account changes
 */
export const onAccountsChanged = (callback) => {
  if (!checkMetaMask()) {
    return;
  }

  window.ethereum.on('accountsChanged', (accounts) => {
    callback(accounts.length > 0 ? accounts[0] : null);
  });
};

/**
 * Listen for chain changes
 */
export const onChainChanged = (callback) => {
  if (!checkMetaMask()) {
    return;
  }

  window.ethereum.on('chainChanged', (chainId) => {
    callback(chainId);
  });
};

