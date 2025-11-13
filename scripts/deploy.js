const hre = require("hardhat");

/**
 * Deployment script for NexID contracts
 * Deploys DIDRegistry and CredentialManager to local Hardhat network
 */
async function main() {
  console.log("🚀 Deploying NexID contracts...\n");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString(), "\n");

  // Deploy DIDRegistry
  console.log("📋 Deploying DIDRegistry...");
  const DIDRegistry = await hre.ethers.getContractFactory("DIDRegistry");
  const didRegistry = await DIDRegistry.deploy();
  await didRegistry.waitForDeployment();
  const didRegistryAddress = await didRegistry.getAddress();
  console.log("✅ DIDRegistry deployed to:", didRegistryAddress);

  // Deploy CredentialManager
  console.log("📋 Deploying CredentialManager...");
  const CredentialManager = await hre.ethers.getContractFactory("CredentialManager");
  const credentialManager = await CredentialManager.deploy();
  await credentialManager.waitForDeployment();
  const credentialManagerAddress = await credentialManager.getAddress();
  console.log("✅ CredentialManager deployed to:", credentialManagerAddress);

  console.log("\n🎉 Deployment complete!\n");
  console.log("📄 Contract Addresses:");
  console.log("   DIDRegistry:", didRegistryAddress);
  console.log("   CredentialManager:", credentialManagerAddress);
  console.log("\n💡 Copy these addresses to frontend/src/config.js\n");

  // Save addresses to a file for easy access
  const fs = require("fs");
  const addresses = {
    DIDRegistry: didRegistryAddress,
    CredentialManager: credentialManagerAddress,
    network: "localhost",
    chainId: 31337
  };
  
  fs.writeFileSync(
    "./frontend/src/contractAddresses.json",
    JSON.stringify(addresses, null, 2)
  );
  console.log("✅ Contract addresses saved to frontend/src/contractAddresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

