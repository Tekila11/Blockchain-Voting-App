module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 7545,            // Standard Ganache GUI port
      network_id: "*",       // Any network (default: none)
    },
  },
  contracts_directory: './contracts/',
  contracts_build_directory: './client/src/contracts/',
  compilers: {
    solc: {
      version: "0.8.0",     // Fetch exact version from solc-bin
    //   optimizer: {
    //     enabled: true,
    //     runs: 200
    //   }
    }
  },
};