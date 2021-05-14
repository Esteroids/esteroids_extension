var Web3 = require('web3-eth');

var web3 = '';
var web3Testnet = '';

var web3 = new Web3.Eth("https://mainnet.infura.io/v3/6db5e33d6c914e68aa62bb7120213443");
//const web3 = new Web3("http://localhost:8545");

//web3.eth.ens.getContent("esteroids.eth").then(function(add) {console.log(add);});


// var web3 = new Web3("https://rinkeby.infura.io/v3/4ff76c15e5584ee4ad4d0c248ec86e17");
// // const web3 = new Web3("http://localhost:8545");

 // web3.ens.getContenthash("esteroids").then(function(add) {console.log(add);});

module.exports = {
	// Mainnet functions
	connect_web3: function(node) {
		web3 = new Web3.Eth(node);
	},

	getContenthash: function(name) {
		return web3.ens.getContenthash(name);
	},

	getContent: function(name) {
		return web3.ens.getContent(name);
	},

	getSkynet: function(name) {
		return web3.ens.getText(name,"skynet");
    	},

    	// Testnet functions
    	connectWeb3Testnet: function(node) {
		web3Testnet = new Web3.Eth(node);
	},

	getContenthashTestnet: function(name) {
		return web3Testnet.ens.getContenthash(name);
	}
};
