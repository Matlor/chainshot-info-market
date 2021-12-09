import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import { Provider } from "react-redux";
import store from "./state/store";
import { ChakraProvider } from "@chakra-ui/react";

ReactDOM.render(
	<ChakraProvider>
		<Provider store={store}>
			<App />
		</Provider>
	</ChakraProvider>,
	document.getElementById("root")
);
