import { combineReducers } from "redux";
import { currentUserRequests } from "./currentUserRequests";
import { allRequestsReducer } from "./allRequestsReducer";

const allReducers = combineReducers({
	usersRequest: currentUserRequests,
	allRequests: allRequestsReducer,
});

export default allReducers;
