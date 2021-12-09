export const currentUserRequests = (state = [], action) => {
	switch (action.type) {
		case "ADD_REQUEST":
			return [...state, action.payload];
		default:
			return state;
	}
};
