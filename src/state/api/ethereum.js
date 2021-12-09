import { ethers } from "ethers";
import * as deepcopy from "deepcopy";
import contractAddress from "../../address.json";
import compiledContract from "../../artifacts/contracts/InformationMarket.sol/InformationMarket.json";
let abi = compiledContract.abi;

// To do: restructure
// this is probably not necessary
const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
const defaultProvider = new ethers.providers.getDefaultProvider("rinkeby");
const defaultContract = new ethers.Contract(
	contractAddress,
	abi,
	defaultProvider
);

// ------------------------------------------------------------------

const parseHexInt = (hexInput) => {
	return parseInt(hexInput._hex, 16);
};

const getMetamaskSigner = async () => {
	await window.ethereum.enable();
	return metamaskProvider.getSigner();
};

const testMetamask = async () => {
	const metaProvider = new ethers.providers.Web3Provider(window.ethereum);
	await metaProvider.provider.request({ method: "eth_requestAccounts" });

	return metaProvider.provider.selectedAddress;
};

// ------------------------------------------------------------------

const listenToEvent = (callback) => {
	console.log("The App is listening to Events");
	defaultContract.on("RequestHasChanged", (_requestId) => {
		let id = parseHexInt(_requestId);
		callback(id);
	});
};

const getDeadlines = async (requestId) => {
	console.log(await defaultContract.getDeadlines(requestId), "get deadlines");
};

const getRequest = async (requestId) => {
	let responseArrays = await deepcopy(
		await defaultContract.getRequest(requestId)
	);

	let requestObj = responseArrays[0];
	let informationArray = responseArrays[1];
	let arbitorArray = responseArrays[2];

	let deadlines = {
		basic: parseHexInt(requestObj.deadlines.basic),
		initiator: parseHexInt(requestObj.deadlines.initiator),
		dispute: parseHexInt(requestObj.deadlines.dispute),
		arbitration: parseHexInt(requestObj.deadlines.arbitration),
		payout: parseHexInt(requestObj.deadlines.payout),
	};

	let basic = {
		initiatorAddress: requestObj.basic.initiatorAddress,
		content: requestObj.basic.content,
		reward: parseHexInt(requestObj.basic.reward),
		initiatorDeposit: parseHexInt(requestObj.basic.initiatorDeposit),
		informationIdCounter: parseHexInt(requestObj.basic.informationIdCounter),
	};

	let initiator = {
		winnerByInitiator: requestObj.initiator.winnerByInitiator,
	};

	let dispute = {
		disputingProvider: requestObj.dispute.disputingProvider,
		providerDeposit: parseHexInt(requestObj.dispute.providerDeposit),
	};

	let arbitration = {
		assignedArbitor: requestObj.arbitration.assignedArbitor,
		winnerByArbitration: requestObj.arbitration.winnerByArbitration,
		provisionaryReward: parseHexInt(
			arbitorArray.arbitration.provisionaryReward
		),
	};

	let request = {
		deadlines,
		basic,
		initiator,
		dispute,
		arbitration,
		requestClosed: requestObj.requestClosed,
		infos: informationArray,
		requestId,
	};

	console.log(request, "request");

	return request;
};

const postRequest = async (cid, reward, deadline) => {
	const signer = await getMetamaskSigner();
	const contract = new ethers.Contract(contractAddress, abi, signer);
	const overrides = {
		value: ethers.utils.parseEther(`${reward}`),
	};
	const transaction = await contract.request(cid, deadline, overrides);

	return await transaction.wait();
};

const postInformation = async (cid, requestID) => {
	const signer = await getMetamaskSigner();
	const contract = new ethers.Contract(contractAddress, abi, signer);
	const transaction = await contract.submitInformation(cid, requestID);

	return await transaction.wait();
};

const getRequestCounter = async () => {
	return parseHexInt(await defaultContract.requestIdCounter());
};

const pickWinner = async (requestId, providerAddress) => {
	const signer = await getMetamaskSigner();
	const contract = new ethers.Contract(contractAddress, abi, signer);

	console.log(contract);
	console.log(requestId, providerAddress);

	const transaction = await contract.pickWinner(requestId, providerAddress);
	console.log(transaction);

	return await transaction.wait();
};

const dispute = async (requestId, providerDeposit) => {
	const signer = await getMetamaskSigner();
	const contract = new ethers.Contract(contractAddress, abi, signer);

	console.log(providerDeposit);
	const overrides = {
		value: `${providerDeposit}`,
	};

	const transaction = await contract.dispute(requestId, overrides);

	return await transaction.wait();
};

const arbitorPicksWinner = async (requestId, winnersAddress) => {
	const signer = await getMetamaskSigner();
	const contract = new ethers.Contract(contractAddress, abi, signer);

	const transaction = await contract.arbitorPicksWinner(
		requestId,
		winnersAddress
	);
	console.log(transaction);

	return await transaction.wait();
};

const payout = async (requestId) => {
	const signer = await getMetamaskSigner();
	const contract = new ethers.Contract(contractAddress, abi, signer);

	const transaction = await contract.payout(requestId);
	console.log(transaction);

	return await transaction.wait();
};

export default {
	listenToEvent,
	getDeadlines,
	getRequest,
	postRequest,
	getRequestCounter,
	postInformation,
	dispute,
	testMetamask,
	arbitorPicksWinner,
	pickWinner,
	payout,
};
