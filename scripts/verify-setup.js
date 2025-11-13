const fs = require('fs');
const path = require('path');

/**
 * Verification script to check if PixelGenesis is set up correctly
 */
function verifySetup() {
  console.log('🔍 Verifying PixelGenesis setup...\n');

  let allGood = true;

  // Check if contracts are compiled
  const artifactsDir = path.join(__dirname, '..', 'artifacts', 'contracts');
  if (!fs.existsSync(artifactsDir)) {
    console.log('❌ Contracts not compiled. Run: npm run compile');
    allGood = false;
  } else {
    console.log('✅ Contracts compiled');
  }

  // Check if contract addresses file exists
  const addressesFile = path.join(__dirname, '..', 'frontend', 'src', 'contractAddresses.json');
  if (!fs.existsSync(addressesFile)) {
    console.log('⚠️  Contract addresses not found. Deploy contracts first: npm run deploy');
  } else {
    const addresses = JSON.parse(fs.readFileSync(addressesFile, 'utf8'));
    if (!addresses.DIDRegistry || !addresses.CredentialManager) {
      console.log('⚠️  Contract addresses incomplete. Redeploy: npm run deploy');
    } else {
      console.log('✅ Contract addresses configured');
      console.log(`   DIDRegistry: ${addresses.DIDRegistry}`);
      console.log(`   CredentialManager: ${addresses.CredentialManager}`);
    }
  }

  // Check if node_modules exist
  const rootNodeModules = path.join(__dirname, '..', 'node_modules');
  const frontendNodeModules = path.join(__dirname, '..', 'frontend', 'node_modules');

  if (!fs.existsSync(rootNodeModules)) {
    console.log('❌ Root dependencies not installed. Run: npm install');
    allGood = false;
  } else {
    console.log('✅ Root dependencies installed');
  }

  if (!fs.existsSync(frontendNodeModules)) {
    console.log('❌ Frontend dependencies not installed. Run: cd frontend && npm install');
    allGood = false;
  } else {
    console.log('✅ Frontend dependencies installed');
  }

  console.log('\n' + '='.repeat(50));
  if (allGood) {
    console.log('✅ Setup looks good! You can start the app.');
    console.log('\nNext steps:');
    console.log('1. Start Hardhat node: npm run node');
    console.log('2. Deploy contracts: npm run deploy (in another terminal)');
    console.log('3. Start frontend: npm run frontend');
  } else {
    console.log('⚠️  Some setup steps are incomplete. Please fix the issues above.');
  }
  console.log('='.repeat(50));
}

verifySetup();

