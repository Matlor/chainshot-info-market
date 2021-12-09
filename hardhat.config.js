require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

const account1 = process.env.ACCOUNT_1;
const account2 = process.env.ACCOUNT_2;
const account3 = process.env.ACCOUNT_3;
const account4 = process.env.ACCOUNT_4;

module.exports = {
	solidity: "0.8.4",
	paths: {
		artifacts: "./src/artifacts",
	},
	networks: {
		rinkeby: {
			url: "https://rinkeby.infura.io/v3/933c547826184ce8a703dd7ddb67aaa2",
			accounts: [account1, account2, account3, account4],
		},
	},
};
