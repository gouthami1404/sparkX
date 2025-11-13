// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DIDRegistry
 * @dev Smart contract for registering and managing Decentralized Identifiers (DIDs)
 * Each Ethereum address can register one DID that maps to their identity
 */
contract DIDRegistry {
    // Mapping from user address to their DID
    mapping(address => string) private dids;
    
    // Mapping to check if an address has registered a DID
    mapping(address => bool) public hasRegistered;
    
    // Event emitted when a DID is registered
    event DIDRegistered(address indexed owner, string did);
    
    // Event emitted when a DID is updated
    event DIDUpdated(address indexed owner, string newDid);
    
    /**
     * @dev Register a DID for the caller's address
     * @param did The Decentralized Identifier string (e.g., "did:ethr:0xABC...")
     * @notice Only the caller can register their own DID
     */
    function registerDID(string memory did) public {
        require(bytes(did).length > 0, "DID cannot be empty");
        require(!hasRegistered[msg.sender], "DID already registered for this address");
        
        dids[msg.sender] = did;
        hasRegistered[msg.sender] = true;
        
        emit DIDRegistered(msg.sender, did);
    }
    
    /**
     * @dev Update an existing DID for the caller
     * @param newDid The new Decentralized Identifier string
     * @notice Only the owner can update their own DID
     */
    function updateDID(string memory newDid) public {
        require(bytes(newDid).length > 0, "DID cannot be empty");
        require(hasRegistered[msg.sender], "No DID registered for this address");
        
        dids[msg.sender] = newDid;
        
        emit DIDUpdated(msg.sender, newDid);
    }
    
    /**
     * @dev Get the DID for a specific user address
     * @param user The address to query
     * @return The DID string associated with the address
     */
    function getDID(address user) public view returns (string memory) {
        return dids[user];
    }
    
    /**
     * @dev Check if an address has registered a DID
     * @param user The address to check
     * @return True if the address has registered a DID
     */
    function hasDID(address user) public view returns (bool) {
        return hasRegistered[user];
    }
}

