import { useState } from "react";
import ethereum from "../../state/api/ethereum";
import { Input } from "@chakra-ui/react";
import { Button, Heading, Text } from "@chakra-ui/react";

const Arbitor = () => {
	const [winner, setWinner] = useState("");
	const [requestId, setRequestId] = useState("");

	const submitArbitration = async (e) => {
		e.preventDefault();
		let receite = await ethereum.arbitorPicksWinner(requestId, winner);
	};

	return (
		<div style={{ margin: "100px 0px 20px 0px" }}>
			<h1></h1>

			<Heading as="h3" size="xl">
				Arbitor:
			</Heading>

			<form onSubmit={submitArbitration}>
				<div style={{ display: "flex" }}>
					<div style={{ flexBasis: "50%" }}>
						<Text fontSize="xl">RequestId:</Text>
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
								setWinner(e.target.value);
							}}
						></Input>
					</div>
				</div>
				<Button type="submit">Arbitrate</Button>
			</form>
		</div>
	);
};

export default Arbitor;
