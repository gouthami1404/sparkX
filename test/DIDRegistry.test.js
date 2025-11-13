const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DIDRegistry", function () {
  let didRegistry;
  let owner, user1, user2;

  beforeEach(async function () {
    // Get test accounts
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy DIDRegistry contract
    const DIDRegistry = await ethers.getContractFactory("DIDRegistry");
    didRegistry = await DIDRegistry.deploy();
    await didRegistry.waitForDeployment();
  });

  describe("DID Registration", function () {
    it("Should allow a user to register a DID", async function () {
      const did = "did:ethr:0x1234567890abcdef";
      
      await expect(didRegistry.connect(user1).registerDID(did))
        .to.emit(didRegistry, "DIDRegistered")
        .withArgs(user1.address, did);

      const registeredDID = await didRegistry.getDID(user1.address);
      expect(registeredDID).to.equal(did);
      expect(await didRegistry.hasDID(user1.address)).to.be.true;
    });

    it("Should prevent registering empty DID", async function () {
      await expect(
        didRegistry.connect(user1).registerDID("")
      ).to.be.revertedWith("DID cannot be empty");
    });

    it("Should prevent registering multiple DIDs for same address", async function () {
      const did1 = "did:ethr:0x111";
      const did2 = "did:ethr:0x222";

      await didRegistry.connect(user1).registerDID(did1);
      
      await expect(
        didRegistry.connect(user1).registerDID(did2)
      ).to.be.revertedWith("DID already registered for this address");
    });

    it("Should allow different users to register different DIDs", async function () {
      const did1 = "did:ethr:0x111";
      const did2 = "did:ethr:0x222";

      await didRegistry.connect(user1).registerDID(did1);
      await didRegistry.connect(user2).registerDID(did2);

      expect(await didRegistry.getDID(user1.address)).to.equal(did1);
      expect(await didRegistry.getDID(user2.address)).to.equal(did2);
    });
  });

  describe("DID Update", function () {
    it("Should allow user to update their DID", async function () {
      const did1 = "did:ethr:0x111";
      const did2 = "did:ethr:0x222";

      await didRegistry.connect(user1).registerDID(did1);
      
      await expect(didRegistry.connect(user1).updateDID(did2))
        .to.emit(didRegistry, "DIDUpdated")
        .withArgs(user1.address, did2);

      expect(await didRegistry.getDID(user1.address)).to.equal(did2);
    });

    it("Should prevent updating DID if none registered", async function () {
      await expect(
        didRegistry.connect(user1).updateDID("did:ethr:0x222")
      ).to.be.revertedWith("No DID registered for this address");
    });

    it("Should prevent updating to empty DID", async function () {
      await didRegistry.connect(user1).registerDID("did:ethr:0x111");
      
      await expect(
        didRegistry.connect(user1).updateDID("")
      ).to.be.revertedWith("DID cannot be empty");
    });
  });

  describe("DID Retrieval", function () {
    it("Should return empty string for unregistered address", async function () {
      const did = await didRegistry.getDID(user1.address);
      expect(did).to.equal("");
      expect(await didRegistry.hasDID(user1.address)).to.be.false;
    });

    it("Should return correct DID for registered address", async function () {
      const did = "did:ethr:0xabcdef123456";
      await didRegistry.connect(user1).registerDID(did);
      
      expect(await didRegistry.getDID(user1.address)).to.equal(did);
      expect(await didRegistry.hasDID(user1.address)).to.be.true;
    });
  });
});

