import api from "../api";
import { listRequests, updateSpecificRequest } from "../actions";
import store from "../store";

const dispatchRequests = async () => {
	let requests = await api.fetchRequests();
	store.dispatch(listRequests(requests));
};

// add request id through event listener
const dispatchRequest = async (requestId) => {
	console.log(
		"An Event has occured, callback function is called with requestId:",
		requestId
	);

	let request = await api.fetchRequest(requestId);
	console.log("fetched request:", request);

	store.dispatch(updateSpecificRequest(request));
};

export default {
	dispatchRequests,
	dispatchRequest,
};
