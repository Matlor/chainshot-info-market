import { CID, create } from "ipfs-http-client";
const ipfs = create("https://ipfs.infura.io:5001");

// helper
const stringToCID = (cidString) => {
	return CID.parse(cidString);
};

const get = async (cidString) => {
	let cid = stringToCID(cidString);
	let result = await ipfs.dag.get(cid);
	return result.value;
};

const post = async (content) => {
	let cid = (await ipfs.dag.put(content)).toString();
	return cid;
};

export default {
	post,
	get,
};
