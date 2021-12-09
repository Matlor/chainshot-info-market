const hre = require("hardhat");
const fs = require("fs");

async function main() {
	const InformationMarket = await hre.ethers.getContractFactory(
		"InformationMarket"
	);
	const informationMarket = await InformationMarket.deploy(5, 1, 44, 1);

	await informationMarket.deployed();

	console.log("informationMarket deployed to:", informationMarket.address);

	fs.writeFileSync(
		"/Users/mathiaslorenceau/Desktop/my-chainshot-folder/information-market/prototype-2-react-ipfs/src/address.json",
		JSON.stringify(informationMarket.address)
	);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
