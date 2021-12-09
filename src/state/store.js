import allReducers from "./reducers";
import { configureStore } from "@reduxjs/toolkit";

const store = configureStore({
	reducer: allReducers,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}),
});

export default store;
