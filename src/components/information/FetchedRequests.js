import Deadlines from "./Deadlines";

const FetchedRequests = ({ requestsInState }) => {
	let requests = () => {
		if (requestsInState.length > 0) {
			return requestsInState.map((request, index) => {
				// ----------------------------------------------------------------
				// INFOS
				let infos = () => {
					if (request.infos.length > 0) {
						return request.infos.map((info, index) => {
							return (
								<div style={{ margin: "0px 0px 0px 15px" }} key={index}>
									{index}:
									<div style={{ margin: "0px 0px 0px 15px" }}>
										content: {info.content}
									</div>
									<div style={{ margin: "0px 0px 0px 15px" }}>
										providerAddress: {info.provider}
									</div>
								</div>
							);
						});
					} else {
						return <div></div>;
					}
				};

				return (
					<div style={{ margin: "50px 0px 150px 0px" }} key={index}>
						<div style={{ margin: "5px 0px 5px 0px" }}>
							requestId: {request.requestId}
						</div>
						<div style={{ margin: "5px 0px 5px 0px" }}>
							initiatorAddress: {request.basic.initiatorAddress}
						</div>
						--------
						<div style={{ fontWeight: "bold" }}>
							Content: {request.basic.content}
						</div>
						<div style={{ margin: "5px 0px 5px 0px" }}>
							Reward: {request.basic.reward}
						</div>
						<div style={{ margin: "5px 0px 5px 0px" }}>
							InitiatorDeposit: {request.basic.initiatorDeposit}
						</div>
						<div style={{ margin: "5px 0px 5px 0px" }}>
							Information: {infos()}
						</div>
						--------
						<Deadlines deadlines={request.deadlines} />
						--------
						<div style={{ margin: "5px 0px 5px 0px" }}>
							WinnerByInitiator: {request.initiator.winnerByInitiator}
						</div>
						--------
						<div style={{ margin: "5px 0px 5px 0px" }}>
							DisputingProvider: {request.dispute.disputingProvider}
						</div>
						<div style={{ margin: "5px 0px 5px 0px" }}>
							ProviderDeposit: {request.dispute.providerDeposit}
						</div>
						--------
						<div style={{ margin: "5px 0px 5px 0px" }}>
							AssignedArbitor: {request.arbitration.assignedArbitor}
						</div>
						<div style={{ margin: "5px 0px 5px 0px" }}>
							WinnerByArbitration: {request.arbitration.winnerByArbitration}
						</div>
						--------
						<div style={{ margin: "5px 0px 5px 0px" }}>
							Arbitor Provisionary Reward:
							{request.arbitration.provisionaryReward}
						</div>
						<div style={{ margin: "5px 0px 5px 0px" }}>
							requestClosed: {JSON.stringify(request.requestClosed)}
						</div>
					</div>
				);
			});
		} else {
			return <div></div>;
		}
	};

	return <div style={{ margin: "0px 0px 20px 0px" }}>{requests()}</div>;
};

export default FetchedRequests;
