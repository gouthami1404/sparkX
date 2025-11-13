// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CredentialManager
 * @dev Smart contract for managing Verifiable Credentials (VCs)
 * Stores credential metadata on-chain, with actual documents stored on IPFS
 */
contract CredentialManager {
    // Credential structure
    struct Credential {
        bytes32 credentialId;      // Unique identifier for the credential
        address issuer;            // Address of the entity issuing the credential
        address subject;           // Address of the user who owns the credential
        string ipfsHash;          // IPFS hash pointing to the credential document/JSON
        bool isRevoked;           // Whether the credential has been revoked
        uint256 issuedAt;         // Timestamp when credential was issued
        uint256 revokedAt;        // Timestamp when credential was revoked (0 if not revoked)
    }
    
    // Mapping from credentialId to Credential
    mapping(bytes32 => Credential) public credentials;
    
    // Mapping from subject address to array of credential IDs
    mapping(address => bytes32[]) public credentialsBySubject;
    
    // Mapping from issuer address to array of credential IDs
    mapping(address => bytes32[]) public credentialsByIssuer;
    
    // Array to store all credential IDs (for enumeration)
    bytes32[] public allCredentialIds;
    
    // Events
    event CredentialIssued(
        bytes32 indexed credentialId,
        address indexed issuer,
        address indexed subject,
        string ipfsHash,
        uint256 timestamp
    );
    
    event CredentialRevoked(
        bytes32 indexed credentialId,
        address indexed issuer,
        uint256 timestamp
    );
    
    /**
     * @dev Issue a new verifiable credential
     * @param subject The address of the user receiving the credential
     * @param ipfsHash The IPFS hash (CID) of the credential document
     * @param credentialId Unique identifier for this credential
     * @notice Only the issuer can issue credentials
     */
    function issueCredential(
        address subject,
        string memory ipfsHash,
        bytes32 credentialId
    ) public {
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(subject != address(0), "Subject address cannot be zero");
        require(credentials[credentialId].issuer == address(0), "Credential ID already exists");
        
        // Create new credential
        credentials[credentialId] = Credential({
            credentialId: credentialId,
            issuer: msg.sender,
            subject: subject,
            ipfsHash: ipfsHash,
            isRevoked: false,
            issuedAt: block.timestamp,
            revokedAt: 0
        });
        
        // Add to subject's credential list
        credentialsBySubject[subject].push(credentialId);
        
        // Add to issuer's credential list
        credentialsByIssuer[msg.sender].push(credentialId);
        
        // Add to global list
        allCredentialIds.push(credentialId);
        
        emit CredentialIssued(credentialId, msg.sender, subject, ipfsHash, block.timestamp);
    }
    
    /**
     * @dev Revoke a credential
     * @param credentialId The ID of the credential to revoke
     * @notice Only the issuer can revoke their credentials
     */
    function revokeCredential(bytes32 credentialId) public {
        Credential storage credential = credentials[credentialId];
        require(credential.issuer != address(0), "Credential does not exist");
        require(credential.issuer == msg.sender, "Only issuer can revoke");
        require(!credential.isRevoked, "Credential already revoked");
        
        credential.isRevoked = true;
        credential.revokedAt = block.timestamp;
        
        emit CredentialRevoked(credentialId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Get credential details by ID
     * @param credentialId The ID of the credential
     * @return issuer The issuer address
     * @return subject The subject address
     * @return ipfsHash The IPFS hash
     * @return isRevoked Whether the credential is revoked
     * @return issuedAt Timestamp when issued
     * @return revokedAt Timestamp when revoked (0 if not revoked)
     */
    function getCredential(bytes32 credentialId) 
        public 
        view 
        returns (
            address issuer,
            address subject,
            string memory ipfsHash,
            bool isRevoked,
            uint256 issuedAt,
            uint256 revokedAt
        ) 
    {
        Credential memory credential = credentials[credentialId];
        require(credential.issuer != address(0), "Credential does not exist");
        
        return (
            credential.issuer,
            credential.subject,
            credential.ipfsHash,
            credential.isRevoked,
            credential.issuedAt,
            credential.revokedAt
        );
    }
    
    /**
     * @dev Get all credential IDs for a subject (user)
     * @param subject The address of the subject
     * @return Array of credential IDs
     */
    function getCredentialsBySubject(address subject) 
        public 
        view 
        returns (bytes32[] memory) 
    {
        return credentialsBySubject[subject];
    }
    
    /**
     * @dev Get all credential IDs issued by an issuer
     * @param issuer The address of the issuer
     * @return Array of credential IDs
     */
    function getCredentialsByIssuer(address issuer) 
        public 
        view 
        returns (bytes32[] memory) 
    {
        return credentialsByIssuer[issuer];
    }
    
    /**
     * @dev Get total number of credentials
     * @return The total count
     */
    function getTotalCredentials() public view returns (uint256) {
        return allCredentialIds.length;
    }
    
    /**
     * @dev Verify if a credential is valid (exists and not revoked)
     * @param credentialId The ID of the credential to verify
     * @return True if credential exists and is not revoked
     */
    function verifyCredential(bytes32 credentialId) public view returns (bool) {
        Credential memory credential = credentials[credentialId];
        return credential.issuer != address(0) && !credential.isRevoked;
    }
}

