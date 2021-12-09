export const allRequestsReducer = (state = [], action) => {
	switch (action.type) {
		case "LIST_REQUESTS":
			return action.payload;

		/* case "LIST_INFORMATIONS_OF_REQUEST":
			const index = state.findIndex(
				(request) => request.requestId === action.payload.id
			);
			// copy lowest level state
			let newState = [...state];

			// copy higher level of state
			let newRequestObject = { ...newState[index] };

			// changing highest copied level
			newRequestObject.infos = action.payload.informations;

			// putting highest level copy into lower level copy
			newState[index] = newRequestObject;

			// returning copy
			return newState;

		
*/

		case "UPDATE_SPECIFIC_REQUEST":
			if (state.length > 0) {
				let id = action.payload.requestId;
				let index = state.findIndex((request) => request.requestId === id);
				if (index != -1) {
					let newState = [...state];
					//let newRequest = {...state[index]};

					newState[index] = action.payload;
					return newState;
				}
				let newState = [...state, action.payload];
				return newState;
			} else {
				return state;
			}

		default:
			return state;
	}
};
