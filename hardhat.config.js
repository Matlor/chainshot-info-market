require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
const account1 = process.env.ACCOUNT_1;
const account2 = process.env.ACCOUNT_2;
const account3 = process.env.ACCOUNT_3;
const account4 = process.env.ACCOUNT_4;

const rinkebyEndpoint = process.env.RINKEBY_ENDPOINT;
console.log(account1)
console.log(typeof account1)
console.log(rinkebyEndpoint)

module.exports = {
	solidity: "0.8.4",
	paths: {
		artifacts: "./src/artifacts",
	},
	networks: {
		rinkeby: {
			url: `${rinkebyEndpoint}`,
			accounts: [account1, account2, account3, account4],
		},
	},
};
