export const addRequest = (request) => {
	return { type: "ADD_REQUEST", payload: request };
};

export const listRequests = (list) => {
	return { type: "LIST_REQUESTS", payload: list };
};

export const updateSpecificRequest = (request) => {
	return { type: "UPDATE_SPECIFIC_REQUEST", payload: request };
};
