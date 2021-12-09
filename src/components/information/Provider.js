import { useState } from "react";
import api from "../../state/api";
import ethereum from "../../state/api/ethereum";
import { Input, Button, Heading, Text } from "@chakra-ui/react";

const Provider = ({ requestsInState }) => {
	const [inputValue, setInputValue] = useState("");
	const [requestId, setRequestId] = useState("");
	const [dispute, setDispute] = useState("");

	const submitAnswer = async (e) => {
		e.preventDefault();
		let receite = await api.submitInformation(inputValue, requestId);
		console.log(receite);
	};

	const submitDispute = async (e) => {
		e.preventDefault();

		let deposit = requestsInState[dispute].basic.initiatorDeposit;

		if (
			requestsInState[dispute].initiator.WinnerByInitiator ==
			"0x0000000000000000000000000000000000000000"
		) {
			deposit = 0;
		}

		await ethereum.dispute(dispute, deposit);
	};

	return (
		<div style={{ margin: "80px 0px 80px 0px" }}>
			<Heading as="h3" size="xl">
				Provider:
			</Heading>
			<div style={{ margin: "20px 0px 50px 0px" }}>
				<form onSubmit={submitAnswer}>
					<div style={{ display: "flex" }}>
						<div style={{ flexBasis: "50%" }}>
							<Text fontSize="xl"> Information: </Text>
							<Input
								type="text"
								value={inputValue}
								onChange={(e) => {
									setInputValue(e.target.value);
								}}
							></Input>
						</div>

						<div style={{ flexBasis: "50%" }}>
							<Text fontSize="xl">Request Id:</Text>
							<Input
								type="number"
								onChange={(e) => {
									setRequestId(e.target.value);
								}}
							></Input>
						</div>
					</div>
					<Button type="submit"> Submit </Button>
				</form>
			</div>

			<div>
				<form onSubmit={submitDispute}>
					<div>
						<Text fontSize="xl">RequestId:</Text>
					</div>

					<div>
						<Input
							type="number"
							style={{ margin: "0px 20px 0px 0px" }}
							onChange={(e) => {
								setDispute(e.target.value);
							}}
						></Input>
					</div>
					<div>
						<Button type="submit">Dispute</Button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default Provider;
