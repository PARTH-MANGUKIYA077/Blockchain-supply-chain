// If executed directly (e.g. by Render Web Service 'node hardhat.config.js'):
if (require.main === module) {
  console.log("Detected direct execution of hardhat.config.js on Render/Node environment.");
  console.log("Redirecting to start Express server in backend/server.js...");
  require("./backend/server.js");
} else {
  require("@nomicfoundation/hardhat-toolbox");

  /** @type import('hardhat/config').HardhatUserConfig */
  module.exports = {
    solidity: {
      version: "0.8.24",
      settings: {
        viaIR: true,
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    },
    networks: {
      hardhat: {
        chainId: 31337
      },
      localhost: {
        url: "http://127.0.0.1:8545",
        chainId: 31337
      }
    },
    paths: {
      artifacts: './frontend/src/artifacts',
    }
  };
}
