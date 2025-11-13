import axios from 'axios';
import { IPFS_CONFIG } from '../config';

/**
 * Upload a file to IPFS using Pinata
 * @param {File} file - The file to upload
 * @returns {Promise<string>} - The IPFS hash (CID)
 */
export const uploadToIPFS = async (file) => {
  try {
    // Use Pinata if configured
    if (IPFS_CONFIG.usePinata && IPFS_CONFIG.pinataJWT) {
      return await uploadToPinata(file);
    }
    
    // Fallback to public IPFS API
    return await uploadToPublicIPFS(file);
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw new Error(`Failed to upload to IPFS: ${error.message}`);
  }
};

/**
 * Upload file to Pinata
 * @param {File} file - The file to upload
 * @returns {Promise<string>} - The IPFS hash (CID)
 */
const uploadToPinata = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    // Add metadata (optional but recommended)
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        app: 'NexID',
        type: 'credential-document',
      },
    });
    formData.append('pinataMetadata', metadata);

    // Add options for pinning
    const pinataOptions = JSON.stringify({
      cidVersion: 1,
    });
    formData.append('pinataOptions', pinataOptions);

    const response = await axios.post(
      `${IPFS_CONFIG.pinataApiUrl}/pinning/pinFileToIPFS`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${IPFS_CONFIG.pinataJWT}`,
          'Content-Type': 'multipart/form-data',
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    // Pinata returns hash in 'IpfsHash' field
    const ipfsHash = response.data.IpfsHash;
    
    if (!ipfsHash) {
      throw new Error('Pinata upload failed: No hash returned');
    }

    console.log('File uploaded to Pinata:', ipfsHash);
    return ipfsHash;
  } catch (error) {
    console.error('Pinata upload error:', error);
    if (error.response) {
      throw new Error(`Pinata upload failed: ${error.response.data?.error?.details || error.response.statusText}`);
    }
    throw error;
  }
};

/**
 * Upload file to public IPFS API (fallback)
 * @param {File} file - The file to upload
 * @returns {Promise<string>} - The IPFS hash (CID)
 */
const uploadToPublicIPFS = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(
      'https://ipfs.io/api/v0/add',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const ipfsHash = response.data.Hash || response.data.hash;
    
    if (!ipfsHash) {
      throw new Error('IPFS upload failed: No hash returned');
    }

    return ipfsHash;
  } catch (error) {
    console.error('Public IPFS upload error:', error);
    throw new Error(`Public IPFS upload failed: ${error.message}`);
  }
};

/**
 * Upload JSON data to IPFS using Pinata
 * @param {Object} data - The JSON data to upload
 * @returns {Promise<string>} - The IPFS hash (CID)
 */
export const uploadJSONToIPFS = async (data) => {
  try {
    // Use Pinata if configured
    if (IPFS_CONFIG.usePinata && IPFS_CONFIG.pinataJWT) {
      return await uploadJSONToPinata(data);
    }
    
    // Fallback to public IPFS API
    return await uploadJSONToPublicIPFS(data);
  } catch (error) {
    console.error('IPFS JSON upload error:', error);
    throw new Error(`Failed to upload JSON to IPFS: ${error.message}`);
  }
};

/**
 * Upload JSON to Pinata
 * @param {Object} data - The JSON data to upload
 * @returns {Promise<string>} - The IPFS hash (CID)
 */
const uploadJSONToPinata = async (data) => {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    
    const response = await axios.post(
      `${IPFS_CONFIG.pinataApiUrl}/pinning/pinJSONToIPFS`,
      {
        pinataContent: data,
        pinataMetadata: {
          name: 'nexid-proof',
          keyvalues: {
            app: 'NexID',
            type: 'selective-disclosure-proof',
          },
        },
        pinataOptions: {
          cidVersion: 1,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${IPFS_CONFIG.pinataJWT}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const ipfsHash = response.data.IpfsHash;
    
    if (!ipfsHash) {
      throw new Error('Pinata JSON upload failed: No hash returned');
    }

    console.log('JSON uploaded to Pinata:', ipfsHash);
    return ipfsHash;
  } catch (error) {
    console.error('Pinata JSON upload error:', error);
    if (error.response) {
      throw new Error(`Pinata JSON upload failed: ${error.response.data?.error?.details || error.response.statusText}`);
    }
    throw error;
  }
};

/**
 * Upload JSON to public IPFS API (fallback)
 * @param {Object} data - The JSON data to upload
 * @returns {Promise<string>} - The IPFS hash (CID)
 */
const uploadJSONToPublicIPFS = async (data) => {
  try {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });

    const formData = new FormData();
    formData.append('file', blob, 'data.json');

    const response = await axios.post(
      'https://ipfs.io/api/v0/add',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const ipfsHash = response.data.Hash || response.data.hash;
    
    if (!ipfsHash) {
      throw new Error('IPFS JSON upload failed: No hash returned');
    }

    return ipfsHash;
  } catch (error) {
    console.error('Public IPFS JSON upload error:', error);
    throw new Error(`Public IPFS JSON upload failed: ${error.message}`);
  }
};

/**
 * Retrieve file from IPFS
 * @param {string} ipfsHash - The IPFS hash (CID)
 * @returns {Promise<string>} - The file content URL
 */
export const getIPFSFileUrl = (ipfsHash) => {
  // Use Pinata gateway if configured, otherwise use public gateway
  if (IPFS_CONFIG.usePinata && IPFS_CONFIG.pinataJWT) {
    return `${IPFS_CONFIG.gatewayUrl}${ipfsHash}`;
  }
  return `${IPFS_CONFIG.publicGatewayUrl}${ipfsHash}`;
};

/**
 * Fetch JSON data from IPFS
 * @param {string} ipfsHash - The IPFS hash (CID)
 * @returns {Promise<Object>} - The JSON data
 */
export const fetchJSONFromIPFS = async (ipfsHash) => {
  try {
    const url = getIPFSFileUrl(ipfsHash);
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching from IPFS:', error);
    throw new Error(`Failed to fetch from IPFS: ${error.message}`);
  }
};

