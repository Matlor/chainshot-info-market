import middleware from "../../state/middleware";
import ethereum from "../../state/api/ethereum";
import { useSelector } from "react-redux";
import Time from "./Time";
import FetchedRequests from "./FetchedRequests";
import Initator from "./Initiator";
import Provider from "./Provider";
import Arbitor from "./Arbitor";
import Account from "./Account";
import { useState } from "react";
import { Input } from "@chakra-ui/react";
import { Button, Heading, Flex } from "@chakra-ui/react";

const Information = () => {
	let requestsInState = useSelector((state) => state.allRequests);
	const [requestId, setRequestId] = useState(null);

	const fetchAllRequestsHandler = async () => {
		await middleware.dispatchRequests();
	};

	const submitPayout = async (e) => {
		e.preventDefault();
		let receite = await ethereum.payout(requestId);
		console.log(receite);
	};

	return (
		<Flex style={{ margin: "50px" }}>
			<div style={{ flexBasis: "50%", margin: "0px 50px 0px 50px" }}>
				<Button
					style={{ margin: "20px 0px 0px 0px" }}
					onClick={fetchAllRequestsHandler}
				>
					Fetch All Requests
				</Button>
				<Time />
				<FetchedRequests requestsInState={requestsInState} />
			</div>
			<div style={{ flexBasis: "50%", margin: "0px 50px 0px 50px" }}>
				<Account />

				<Provider requestsInState={requestsInState} />
				<Initator />
				<Arbitor />

				<div>
					<Heading as="h3" size="xl">
						Everyone:
					</Heading>
					<div>
						<form
							onSubmit={submitPayout}
							style={{ display: "flex", margin: "20px 0px" }}
						>
							<Input
								type="number"
								style={{ margin: "0px 20px 0px 0px" }}
								onChange={(e) => {
									setRequestId(e.target.value);
								}}
							></Input>
							<Button type="submit">Payout</Button>
						</form>
					</div>
				</div>
			</div>
		</Flex>
	);
};

export default Information;
