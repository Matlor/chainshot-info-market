import Request from "./Request";
import Information from "./information/Information";
import { useState, useEffect } from "react";
import ethereum from "../state/api/ethereum";
import middleware from "../state/middleware";
import { Heading } from "@chakra-ui/react";

const App = () => {
	useEffect(() => {
		ethereum.listenToEvent(middleware.dispatchRequest);
	}, []);

	const [navigation, setNavigation] = useState(true);

	const navigateRequest = () => {
		setNavigation(true);
	};

	const navigateInformation = () => {
		setNavigation(false);
	};

	return (
		<div>
			<div
				style={{
					display: "flex",
					justifyContent: "space-evenly",
					padding: "20px",
					backgroundColor: "#e1eedd",
					marginBottom: "20px",
				}}
			>
				<Heading onClick={navigateRequest}>Request</Heading>
				<Heading onClick={navigateInformation}>Information</Heading>
			</div>
			{navigation ? <Request /> : <Information />}
		</div>
	);
};

export default App;
