const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying SupplyChain contract...");

  const [deployer, mfr, supplier, distributor, retailer, consumer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
  const supplyChain = await SupplyChain.deploy();
  await supplyChain.waitForDeployment();

  const contractAddress = await supplyChain.getAddress();
  console.log(`SupplyChain contract deployed to: ${contractAddress}`);

  // Assign initial roles for local demo environment
  console.log("\nAssigning initial demo roles...");
  await (await supplyChain.assignRole(deployer.address, "ADMIN")).wait();
  await (await supplyChain.assignRole(mfr.address, "MANUFACTURER")).wait();
  await (await supplyChain.assignRole(supplier.address, "SUPPLIER")).wait();
  await (await supplyChain.assignRole(distributor.address, "DISTRIBUTOR")).wait();
  await (await supplyChain.assignRole(retailer.address, "RETAILER")).wait();
  await (await supplyChain.assignRole(consumer.address, "CONSUMER")).wait();

  console.log(`- Admin:        ${deployer.address}`);
  console.log(`- Manufacturer: ${mfr.address}`);
  console.log(`- Supplier:     ${supplier.address}`);
  console.log(`- Distributor:  ${distributor.address}`);
  console.log(`- Retailer:     ${retailer.address}`);
  console.log(`- Consumer:     ${consumer.address}`);

  // Create initial demo product
  console.log("\nCreating demo product...");
  const tx = await supplyChain.connect(mfr).createProduct(
    "SKU-PHARMA-1001",
    "LifeSave Organic Vaccine",
    "Temperature-sensitive medical supply batch 001",
    hre.ethers.parseEther("0.05"),
    "Zurich Facility Lab 4"
  );
  await tx.wait();
  console.log("Demo product created successfully!");

  // Save deployed address and ABI for backend and frontend
  const artifact = await hre.artifacts.readArtifact("SupplyChain");
  
  const deploymentConfig = {
    address: contractAddress,
    network: hre.network.name,
    chainId: hre.network.config.chainId || 31337,
    abi: artifact.abi,
    sampleAccounts: {
      admin: deployer.address,
      manufacturer: mfr.address,
      supplier: supplier.address,
      distributor: distributor.address,
      retailer: retailer.address,
      consumer: consumer.address
    }
  };

  // Write to frontend & backend config directories
  const dirs = [
    path.join(__dirname, "../frontend/src/config"),
    path.join(__dirname, "../backend/config")
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(dir, "contractDetails.json"),
      JSON.stringify(deploymentConfig, null, 2)
    );
  });

  console.log("\nContract deployment configuration saved to frontend & backend!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
