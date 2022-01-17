//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;
import "hardhat/console.sol";

contract InformationMarket {
    address owner;
    uint256 depositMultiple;
    uint256 randomNumber;
    uint256 delayInMinutes;

    constructor(
        uint256 _depositMultiple,
        uint256 _requiredStake,
        uint256 _randomNumber,
        uint256 _delayInMinutes
    ) {
        owner = msg.sender;
        depositMultiple = _depositMultiple;
        requiredStake = _requiredStake;
        randomNumber = _randomNumber;
        delayInMinutes = _delayInMinutes;
    }

    modifier onlyOwner(uint256 _randomNumber) {
        require(
            msg.sender == owner,
            "msg.sender is not the owner of the contract"
        );
        _;
    }

    // --- EVENTS ---
    event RandomNumberEvent();
    event RequestHasChanged(uint256 _requestId);

    // ----------- RANDOM NUMBER ------------------
    function setRandomNumber(uint256 _newRandomNumber)
        external
        onlyOwner(_newRandomNumber)
    {
        randomNumber = _newRandomNumber;
        emit RandomNumberEvent();
    }

    // ----------- VARIABLES ------------------------------------------------------------------------------------------------------------
    uint256 public requestIdCounter;

    // --- DEADLINES ---
    struct Deadlines {
        uint256 basic;
        uint256 initiator;
        uint256 dispute;
        uint256 arbitration;
        uint256 payout;
    }

    // --- BASIC ---
    struct Basic {
        address payable initiatorAddress;
        string content;
        uint256 reward;
        uint256 initiatorDeposit;
        uint256 informationIdCounter;
    }

    // --- INITIATOR ---
    struct Initiator {
        address payable winnerByInitiator;
    }

    // --- DISPUTE ---
    struct Dispute {
        address payable disputingProvider;
        uint256 providerDeposit;
    }

    // --- ARBITRATION ---
    struct Arbitration {
        address payable assignedArbitor;
        address payable winnerByArbitration;
    }

    // --- ACTUAL REQUEST ---
    struct Request {
        Deadlines deadlines;
        Basic basic;
        Initiator initiator;
        Dispute dispute;
        Arbitration arbitration;
        bool requestClosed;
    }

    // --- MAPPINGS ---
    mapping(uint256 => Request) public requests;
    mapping(address => uint256) requestAddresses;

    // ---------------- INFORMATION ------------------------------------------------

    // --- ACTUAL INFORMATION ---
    struct Information {
        address payable provider;
        string content;
    }

    // --- MAPPINGS ---
    // requestId -> information Id -> address
    mapping(uint256 => mapping(uint256 => Information)) providers;

    // provider address  -> requestId ->  hasGivenAnser
    mapping(address => mapping(uint256 => bool)) providerAddresses;

    // --- INFORMATION MODIFIERS ---
    modifier onlyProvider(uint256 _requestId) {
        require(providerAddresses[msg.sender][_requestId] == true);
        _;
    }

    // ---------------- ARBITORS ------------------------------------------------
    // MOST ARBITOR FUNCTIONALITIES ARE NOT IMPLEMENTED YET
    // OWNER WILL END UP BEING THE ARBITOR AS <10 REGISTERED ARBITORS

    uint256 requiredStake;
    uint256 numArbitors;

    // --- ARBITRATION ---
    struct ArbitorArbitration {
        address arbitorAddress;
        uint256 arbitorId;
        uint256 provisionaryReward;
    }

    // --- SLASHING ---
    // assigned cases can only be 1 at the moment
    // to do: array and reset every 10 cases
    struct ArbitorSlashing {
        uint256 casesHandled;
        uint256 timestampLastCase;
        uint256 stakedBalance;
        uint256 assignedCaseId;
    }

    // --- ACTUAL ARBITOR ---
    struct Arbitor {
        ArbitorArbitration arbitration;
        ArbitorSlashing slashing;
    }

    // --- MAPPINGS ---
    mapping(address => Arbitor) arbitors;
    mapping(uint256 => address) arbitorAddresses;

    // ---------------- ARBITOR FUNCTIONS ------------------------------------------------
    // Arbitor has to stake directly (denominated in wei)

    function register() external payable {
        require(
            msg.value >= requiredStake,
            "you have to pay more than that to register as an arbitor"
        );
        require(
            arbitors[msg.sender].arbitration.arbitorAddress == address(0),
            "you are already registred as an arbitor"
        );

        // arbitor is added to the list of arbitors
        Arbitor storage newArbitor = arbitors[msg.sender];
        newArbitor.arbitration.arbitorAddress = msg.sender;

        newArbitor.arbitration.arbitorId = numArbitors;

        // stake
        newArbitor.slashing.stakedBalance = msg.value;

        // to to: make searchable in other mapping as well:
        arbitorAddresses[numArbitors] = msg.sender;

        numArbitors++;
    }

    // NOT IMPLEMENTED
    function withdraw() external {
        require(msg.sender == address(0));
    }

    // RANDOM DRAWING IS NOT IMPLEMENTED. OWNER IS RETURNED AS ARBITOR
    // returns owner if not enough arbitors
    function drawArbitor() internal returns (address _drawnArbitor) {
        if (numArbitors >= 10) {
            // random drawing
        } else {
            return owner;
        }
    }

    // ---------------------- PHASE MODIFIERS ------------------------------------------------------

    modifier ifBasicPhaseRequirements(uint256 _requestId) {
        require(
            block.timestamp <= requests[_requestId].deadlines.basic,
            "incorrect time interval"
        );
        _;
    }

    modifier ifInitiatorPhaseRequirements(uint256 _requestId) {
        require(
            block.timestamp > requests[_requestId].deadlines.basic &&
                block.timestamp <= requests[_requestId].deadlines.initiator,
            "incorrect time interval"
        );
        require(
            requests[_requestId].basic.informationIdCounter > 0,
            "no information has been provided"
        );
        _;
    }

    modifier ifDisputePhaseRequirements(uint256 _requestId) {
        require(
            block.timestamp > requests[_requestId].deadlines.initiator &&
                block.timestamp <= requests[_requestId].deadlines.dispute,
            "incorrect time interval"
        );
        // if it was possible to pick a winner (at least one received information)
        require(
            requests[_requestId].basic.informationIdCounter > 0,
            "no information has been provided"
        );
        _;
    }

    modifier ifArbitrationPhaseRequirements(uint256 _requestId) {
        require(
            requests[_requestId].dispute.disputingProvider != address(0),
            "there is no dispute"
        );
        require(
            block.timestamp > requests[_requestId].deadlines.dispute &&
                block.timestamp <= requests[_requestId].deadlines.arbitration,
            "incorrect time interval"
        );

        _;
    }

    modifier ifPayoutPhaseRequirements(uint256 _requestId) {
        require(
            block.timestamp > requests[_requestId].deadlines.arbitration,
            "incorrect time interval"
        );
        _;
    }

    // ---------------------- BASIC PHASE FUNCTIONS ------------------------------------------------------

    function request(string memory _requestContent, uint256 _deadline)
        external
        payable
    {
        Request storage newRequest = requests[requestIdCounter];
        newRequest.basic.content = _requestContent;
        newRequest.basic.reward =
            (msg.value / depositMultiple) *
            (depositMultiple - 1);
        newRequest.basic.initiatorDeposit = msg.value / depositMultiple;
        newRequest.basic.initiatorAddress = payable(msg.sender);

        newRequest.deadlines.basic = block.timestamp + _deadline;
        newRequest.deadlines.initiator =
            newRequest.deadlines.basic +
            delayInMinutes *
            1 minutes;
        newRequest.deadlines.dispute =
            newRequest.deadlines.basic +
            delayInMinutes *
            2 minutes;
        newRequest.deadlines.arbitration =
            newRequest.deadlines.basic +
            delayInMinutes *
            3 minutes;
        newRequest.deadlines.payout =
            newRequest.deadlines.basic +
            delayInMinutes *
            4 minutes;

        requestAddresses[msg.sender] = requestIdCounter;
        requestIdCounter++;

        emit RequestHasChanged(requestIdCounter - 1);
    }

    function submitInformation(
        string memory _informationContent,
        uint256 _requestId
    ) external ifBasicPhaseRequirements(_requestId) {
        Information memory newInformation;
        newInformation.content = _informationContent;
        newInformation.provider = payable(msg.sender);

        uint256 informationCounter = requests[_requestId]
            .basic
            .informationIdCounter;
        providers[_requestId][informationCounter] = newInformation;

        providerAddresses[msg.sender][_requestId] = true;

        requests[_requestId].basic.informationIdCounter++;

        emit RequestHasChanged(_requestId);
    }

    // ---------------------- INITIATOR PHASE FUNCTIONS ------------------------------------------------------

    modifier onlyInitiator(uint256 _requestId) {
        require(
            msg.sender == requests[_requestId].basic.initiatorAddress,
            "you are not the initiator of this request"
        );
        _;
    }

    function pickWinner(uint256 _requestId, address payable _winnerAddress)
        external
        ifInitiatorPhaseRequirements(_requestId)
        onlyInitiator(_requestId)
    {
        require(
            providerAddresses[_winnerAddress][_requestId] == true,
            "that provider address does not exist"
        );
        requests[_requestId].initiator.winnerByInitiator = _winnerAddress;

        emit RequestHasChanged(_requestId);
    }

    // ---------------------- DISPUTE PHASE FUNCTIONS ------------------------------------------------------

    function dispute(uint256 _requestId)
        external
        payable
        ifDisputePhaseRequirements(_requestId)
        onlyProvider(_requestId)
    {
        require(
            requests[_requestId].dispute.disputingProvider == address(0),
            "disputing provider has alreaby been set"
        );

        // if the initiator has picked a winner, the provider has to provide a deposit to initiate a dispute
        if (requests[_requestId].initiator.winnerByInitiator != address(0)) {
            require(
                msg.value >= requests[_requestId].basic.initiatorDeposit,
                "deposit is too small"
            );

            // assigns deposit balance
            requests[_requestId].dispute.providerDeposit = msg.value;

            // if the provider has not picked a winner calling the function is free
        } else {
            require(msg.value == 0 wei, "function is free to call");
        }

        requests[_requestId].dispute.disputingProvider = payable(msg.sender);

        // arbitor it picked
        address drawnArbitor = drawArbitor();

        // To Do: An Arbitor cannot have several assigned cases at the moment
        arbitors[drawnArbitor].slashing.assignedCaseId = _requestId;
        requests[_requestId].arbitration.assignedArbitor = payable(
            drawnArbitor
        );

        emit RequestHasChanged(_requestId);
    }

    // ---------------------- ARBITRATION PHASE FUNCTIONS ------------------------------------------------------

    function arbitorPicksWinner(uint256 _requestId, address _winningProvider)
        external
        ifArbitrationPhaseRequirements(_requestId)
    {
        require(
            requests[_requestId].arbitration.assignedArbitor == msg.sender,
            "msg.sender is not the assigned arbitor"
        );

        requests[_requestId].arbitration.winnerByArbitration = payable(
            _winningProvider
        );

        emit RequestHasChanged(_requestId);
    }

    // ---------------------- PAYOUT PHASE FUNCTIONS ------------------------------------------------------

    function payout(uint256 _requestId)
        external
        ifPayoutPhaseRequirements(_requestId)
    {
        require(requests[_requestId].requestClosed == false, "Case is closed");

        uint256 informationIdCounter = requests[_requestId]
            .basic
            .informationIdCounter;
        address payable initiatorAddress = requests[_requestId]
            .basic
            .initiatorAddress;
        address payable singleProvider = providers[_requestId][0].provider;
        address payable winnerByInitiator = requests[_requestId]
            .initiator
            .winnerByInitiator;
        address payable disputingProvider = requests[_requestId]
            .dispute
            .disputingProvider;
        address payable winnerByArbitration = requests[_requestId]
            .arbitration
            .winnerByArbitration;
        address payable arbitorsAddress = requests[_requestId]
            .arbitration
            .assignedArbitor;

        uint256 initiatorDeposit = requests[_requestId].basic.initiatorDeposit;
        uint256 providerDeposit = requests[_requestId].dispute.providerDeposit;
        uint256 reward = requests[_requestId].basic.reward;

        // no answer -> reimbursed deposit
        if (informationIdCounter == 0) {
            initiatorAddress.transfer(initiatorDeposit);

            // if one answer -> reimbursed deposit
        } else if (informationIdCounter == 1) {
            // reimburse
            initiatorAddress.transfer(initiatorDeposit);

            // pay reward
            singleProvider.transfer(reward);

            // more than one answer
        } else {
            // if there was a dispute
            if (disputingProvider != address(0)) {
                // if initiator won
                if (winnerByArbitration == winnerByInitiator) {
                    // reimburse
                    requests[_requestId].dispute.providerDeposit = 0;
                    initiatorAddress.transfer(initiatorDeposit);

                    // pay reward
                    requests[_requestId].basic.reward = 0;
                    winnerByInitiator.transfer(reward);

                    // dispute fee -> arbitor (provisionaryReward)
                    requests[_requestId].dispute.providerDeposit = 0;
                    arbitors[arbitorsAddress]
                        .arbitration
                        .provisionaryReward += providerDeposit;

                    // disputing provider or somebody else won (other than the initiator)
                } else {
                    // arbitor gets initiatorDeposit
                    arbitors[arbitorsAddress]
                        .arbitration
                        .provisionaryReward += initiatorDeposit;

                    // challenging provider receives deposit back
                    requests[_requestId].basic.initiatorDeposit = 0;
                    disputingProvider.transfer(providerDeposit);

                    // reward is payed out
                    requests[_requestId].basic.reward = 0;
                    winnerByArbitration.transfer(reward);
                }
                // if there was no dispute
            } else {
                // reimbursed
                initiatorAddress.transfer(initiatorDeposit);

                // reward is paid out
                winnerByInitiator.transfer(reward);
            }
        }
        requests[_requestId].requestClosed = true;

        emit RequestHasChanged(_requestId);
    }

    // ------------------------ SLASHING TIME FUNCTIONS ----------------------------------------
    function slashingArbitor() internal {}

    // ------------------------ GETTER FUNCTIONS ----------------------------------------

    function getRequest(uint256 _requestId)
        external
        view
        returns (
            Request memory,
            Information[] memory,
            Arbitor memory
        )
    {
        uint256 counter = requests[_requestId].basic.informationIdCounter;

        Information[] memory infoArray = new Information[](counter);

        for (uint256 i = 0; i < counter; i++) {
            infoArray[i] = providers[_requestId][i];
        }

        return (
            requests[_requestId],
            infoArray,
            arbitors[requests[_requestId].arbitration.assignedArbitor]
        );
    }

    function getDeadlines(uint256 _requestId)
        external
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256,
            uint256,
            uint256
        )
    {
        uint256 current = block.timestamp;
        uint256 basic = requests[_requestId].deadlines.basic;
        uint256 initiator = requests[_requestId].deadlines.initiator;
        uint256 dispute = requests[_requestId].deadlines.dispute;
        uint256 arbitration = requests[_requestId].deadlines.arbitration;
        uint256 payout = requests[_requestId].deadlines.payout;

        return (current, basic, initiator, dispute, arbitration, payout);
    }

    function test() external pure returns (uint256) {
        return 10;
    }
}
