import { useState } from "react";
import ethereum from "../../state/api/ethereum";
import { Input } from "@chakra-ui/react";
import { Button, Heading, Text } from "@chakra-ui/react";

const Initator = () => {
	const [winnerAddress, setWinnerAddress] = useState(null);
	const [requestId, setRequestId] = useState(null);

	const submitWinner = async (e) => {
		e.preventDefault();

		let receite = await ethereum.pickWinner(requestId, winnerAddress);
		console.log(receite);
	};

	return (
		<div>
			<Heading as="h3" size="xl">
				Initiator:
			</Heading>
			<form onSubmit={submitWinner}>
				<div style={{ display: "flex" }}>
					<div style={{ flexBasis: "50%" }}>
						<Text fontSize="xl"> Request Id:</Text>
						<Input
							type="number"
							onChange={(e) => {
								setRequestId(e.target.value);
							}}
						></Input>
					</div>
					<div style={{ flexBasis: "50%" }}>
						<Text fontSize="xl"> Provider Address:</Text>
						<Input
							type="text"
							onChange={(e) => {
								setWinnerAddress(e.target.value);
							}}
						></Input>
					</div>
				</div>
				<Button type="submit">Pick Winner</Button>
			</form>
		</div>
	);
};

export default Initator;
