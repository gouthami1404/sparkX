const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CredentialManager", function () {
  let credentialManager;
  let issuer, subject, verifier;

  beforeEach(async function () {
    // Get test accounts
    [issuer, subject, verifier] = await ethers.getSigners();

    // Deploy CredentialManager contract
    const CredentialManager = await ethers.getContractFactory("CredentialManager");
    credentialManager = await CredentialManager.deploy();
    await credentialManager.waitForDeployment();
  });

  describe("Credential Issuance", function () {
    it("Should allow issuer to issue a credential", async function () {
      const credentialId = ethers.id("test-credential-1");
      const ipfsHash = "QmTestHash123456789";

      await expect(
        credentialManager.connect(issuer).issueCredential(subject.address, ipfsHash, credentialId)
      )
        .to.emit(credentialManager, "CredentialIssued")
        .withArgs(credentialId, issuer.address, subject.address, ipfsHash, 
          (timestamp) => timestamp > 0);

      const credential = await credentialManager.getCredential(credentialId);
      expect(credential.issuer).to.equal(issuer.address);
      expect(credential.subject).to.equal(subject.address);
      expect(credential.ipfsHash).to.equal(ipfsHash);
      expect(credential.isRevoked).to.be.false;
    });

    it("Should prevent issuing credential with empty IPFS hash", async function () {
      const credentialId = ethers.id("test-credential-2");
      
      await expect(
        credentialManager.connect(issuer).issueCredential(subject.address, "", credentialId)
      ).to.be.revertedWith("IPFS hash cannot be empty");
    });

    it("Should prevent issuing credential to zero address", async function () {
      const credentialId = ethers.id("test-credential-3");
      const ipfsHash = "QmTestHash123456789";
      
      await expect(
        credentialManager.connect(issuer).issueCredential(ethers.ZeroAddress, ipfsHash, credentialId)
      ).to.be.revertedWith("Subject address cannot be zero");
    });

    it("Should prevent duplicate credential IDs", async function () {
      const credentialId = ethers.id("test-credential-4");
      const ipfsHash = "QmTestHash123456789";

      await credentialManager.connect(issuer).issueCredential(subject.address, ipfsHash, credentialId);
      
      await expect(
        credentialManager.connect(issuer).issueCredential(subject.address, ipfsHash, credentialId)
      ).to.be.revertedWith("Credential ID already exists");
    });

    it("Should track credentials by subject", async function () {
      const credentialId1 = ethers.id("test-credential-5");
      const credentialId2 = ethers.id("test-credential-6");
      const ipfsHash = "QmTestHash123456789";

      await credentialManager.connect(issuer).issueCredential(subject.address, ipfsHash, credentialId1);
      await credentialManager.connect(issuer).issueCredential(subject.address, ipfsHash, credentialId2);

      const subjectCreds = await credentialManager.getCredentialsBySubject(subject.address);
      expect(subjectCreds.length).to.equal(2);
      expect(subjectCreds[0]).to.equal(credentialId1);
      expect(subjectCreds[1]).to.equal(credentialId2);
    });

    it("Should track credentials by issuer", async function () {
      const credentialId = ethers.id("test-credential-7");
      const ipfsHash = "QmTestHash123456789";

      await credentialManager.connect(issuer).issueCredential(subject.address, ipfsHash, credentialId);

      const issuerCreds = await credentialManager.getCredentialsByIssuer(issuer.address);
      expect(issuerCreds.length).to.equal(1);
      expect(issuerCreds[0]).to.equal(credentialId);
    });
  });

  describe("Credential Revocation", function () {
    it("Should allow issuer to revoke their credential", async function () {
      const credentialId = ethers.id("test-credential-8");
      const ipfsHash = "QmTestHash123456789";

      await credentialManager.connect(issuer).issueCredential(subject.address, ipfsHash, credentialId);
      
      await expect(credentialManager.connect(issuer).revokeCredential(credentialId))
        .to.emit(credentialManager, "CredentialRevoked")
        .withArgs(credentialId, issuer.address, (timestamp) => timestamp > 0);

      const credential = await credentialManager.getCredential(credentialId);
      expect(credential.isRevoked).to.be.true;
      expect(credential.revokedAt).to.be.gt(0);
    });

    it("Should prevent non-issuer from revoking credential", async function () {
      const credentialId = ethers.id("test-credential-9");
      const ipfsHash = "QmTestHash123456789";

      await credentialManager.connect(issuer).issueCredential(subject.address, ipfsHash, credentialId);
      
      await expect(
        credentialManager.connect(verifier).revokeCredential(credentialId)
      ).to.be.revertedWith("Only issuer can revoke");
    });

    it("Should prevent revoking non-existent credential", async function () {
      const credentialId = ethers.id("test-credential-10");
      
      await expect(
        credentialManager.connect(issuer).revokeCredential(credentialId)
      ).to.be.revertedWith("Credential does not exist");
    });

    it("Should prevent revoking already revoked credential", async function () {
      const credentialId = ethers.id("test-credential-11");
      const ipfsHash = "QmTestHash123456789";

      await credentialManager.connect(issuer).issueCredential(subject.address, ipfsHash, credentialId);
      await credentialManager.connect(issuer).revokeCredential(credentialId);
      
      await expect(
        credentialManager.connect(issuer).revokeCredential(credentialId)
      ).to.be.revertedWith("Credential already revoked");
    });
  });

  describe("Credential Verification", function () {
    it("Should verify valid credential", async function () {
      const credentialId = ethers.id("test-credential-12");
      const ipfsHash = "QmTestHash123456789";

      await credentialManager.connect(issuer).issueCredential(subject.address, ipfsHash, credentialId);
      
      expect(await credentialManager.verifyCredential(credentialId)).to.be.true;
    });

    it("Should not verify revoked credential", async function () {
      const credentialId = ethers.id("test-credential-13");
      const ipfsHash = "QmTestHash123456789";

      await credentialManager.connect(issuer).issueCredential(subject.address, ipfsHash, credentialId);
      await credentialManager.connect(issuer).revokeCredential(credentialId);
      
      expect(await credentialManager.verifyCredential(credentialId)).to.be.false;
    });

    it("Should not verify non-existent credential", async function () {
      const credentialId = ethers.id("test-credential-14");
      
      expect(await credentialManager.verifyCredential(credentialId)).to.be.false;
    });
  });

  describe("Credential Retrieval", function () {
    it("Should retrieve credential details correctly", async function () {
      const credentialId = ethers.id("test-credential-15");
      const ipfsHash = "QmTestHash123456789";

      await credentialManager.connect(issuer).issueCredential(subject.address, ipfsHash, credentialId);
      
      const credential = await credentialManager.getCredential(credentialId);
      expect(credential.issuer).to.equal(issuer.address);
      expect(credential.subject).to.equal(subject.address);
      expect(credential.ipfsHash).to.equal(ipfsHash);
      expect(credential.isRevoked).to.be.false;
      expect(credential.issuedAt).to.be.gt(0);
      expect(credential.revokedAt).to.equal(0);
    });

    it("Should revert when getting non-existent credential", async function () {
      const credentialId = ethers.id("test-credential-16");
      
      await expect(
        credentialManager.getCredential(credentialId)
      ).to.be.revertedWith("Credential does not exist");
    });
  });
});

