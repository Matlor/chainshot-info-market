import ethereum from "./ethereum";
import ipfs from "./ipfs";

// helper
const makeReadable = async (request) => {
	request.basic.content = await ipfs.get(request.basic.content);

	let infos = request.infos;
	for (let i = 0; i < infos.length; i++) {
		infos[i].content = await ipfs.get(infos[i].content);
	}
	request.infos = infos;
	return request;
};

const submitRequest = async (content, reward, deadline) => {
	const cid = await ipfs.post(content);
	const receite = await ethereum.postRequest(cid, reward, deadline);
	console.log(receite);
	return receite;
};

const submitInformation = async (content, requestId) => {
	const cid = await ipfs.post(content);
	const receite = await ethereum.postInformation(cid, requestId);
	console.log(receite);
	return receite;
};

const fetchRequest = async (requestId) => {
	let requestEtheum = await ethereum.getRequest(requestId);
	let request = await makeReadable(requestEtheum);

	return request;
};

const fetchRequests = async () => {
	const counter = await ethereum.getRequestCounter();
	let requests = [];
	for (let i = 0; i < counter; i++) {
		let request = await fetchRequest(i);
		requests.push(request);
	}
	return requests;
};

export default {
	submitRequest,
	submitInformation,
	fetchRequest,
	fetchRequests,
};
