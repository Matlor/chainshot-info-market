//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;
import "hardhat/console.sol";

contract InformationMarket {
  
    address owner;
    uint depositMultiple;
    uint randomNumber;
    uint delayInMinutes;

    constructor(uint _depositMultiple, uint _requiredStake, uint _randomNumber, uint _delayInMinutes){
        owner = msg.sender;
        depositMultiple = _depositMultiple;
        requiredStake = _requiredStake;
        randomNumber = _randomNumber;
        delayInMinutes = _delayInMinutes;
    }

    modifier onlyOwner (uint _randomNumber) {
      require(msg.sender == owner, "you are not the owner of this contract");
      _;
      
    }  


    // --- EVENTS ---
    event RandomNumberEvent();
    event RegisterEvent();
    event WithdrawEvent();
    event DrawArbitorEvent();
    event RequestEvent();
    event SubmitInformationEvent();
    event PickWinnerEvent();
    event DisputeEvent();
    event ArbitorPicksWinner();
    event PayoutEvent();
    event SlashingArbitorEvent();

    event RequestHasChanged(uint _requestId);



    // ----------- RANDOM NUMBER ------------------
    function setRandomNumber(uint _newRandomNumber) external onlyOwner(_newRandomNumber) {
        randomNumber = _newRandomNumber;
        emit RandomNumberEvent();
    }
    // ----------- VARIABLES ------------------------------------------------------------------------------------------------------------
    uint public requestIdCounter;


   
  
    // --- DEADLINES ---
    struct Deadlines {
        uint basic;
        uint initiator;
        uint dispute;
        uint arbitration;
        uint payout;
    }

    // --- BASIC ---
    struct Basic {
        address payable initiatorAddress;
        string content;
        uint reward;
        uint initiatorDeposit;
        uint informationIdCounter;
    }

    // --- INITIATOR ---
    struct Initiator {
       address payable winnerByInitiator;
    }

    // --- DISPUTE ---
    struct Dispute {
        address payable disputingProvider;
        uint providerDeposit;
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
    mapping(uint => Request) public requests;
    mapping(address => uint)  requestAddresses;
    

    // ---------------- INFORMATION ------------------------------------------------

    // --- ACTUAL INFORMATION ---
    struct Information {
        address payable provider;
        string content;
    }

    // --- MAPPINGS ---
    // requestId -> infoId -> address
    // make public
    mapping(uint => mapping(uint => Information)) providers;

    // this simply allows me to NOT iterate over providers for one request to check if address is provider
    // provider address  -> requestId ->  hasGivenAnser
    mapping(address => mapping(uint => bool)) providerAddresses;


    // --- INFORMATION MODIFIERS ---
    modifier onlyProvider (uint _requestId) {
        require(providerAddresses[msg.sender][_requestId] == true);
        _;
    }

    // ---------------- ARBITORS ------------------------------------------------
    uint requiredStake;
    uint numArbitors;


    // --- ARBITRATION ---
    struct ArbitorArbitration {
        address arbitorAddress;
        uint arbitorId;
        uint provisionaryReward;
    }

    // --- SLASHING ---
    // assigned cases can only be 1!! -> assignedCaseId -> with slashing and so on could be complicated!
    // do an array and delete every 10 cases. I still have in the request thing who was arbitor
    struct ArbitorSlashing {
        uint casesHandled;
        uint timestampLastCase;
        uint stakedBalance;
        uint assignedCaseId;
    }

    // --- ACTUAL ARBITOR ---
    struct Arbitor {
        ArbitorArbitration arbitration;
        ArbitorSlashing slashing;
    }

    // --- MAPPINGS ---
    mapping(address => Arbitor)arbitors;
    mapping(uint => address)arbitorAddresses;


    // ---------------- ARBITOR FUNCTIONS ------------------------------------------------
    // stakes directly
    // stake is in wei defined

    function register() external payable {
        require(msg.value>= requiredStake, "you have to pay more than that to register as an arbitor");
        require(arbitors[msg.sender].arbitration.arbitorAddress == address(0), "you are already registred as an arbitor");

        // is added to the list of arbitors
        Arbitor storage newArbitor = arbitors[msg.sender];
        newArbitor.arbitration.arbitorAddress = msg.sender;

        newArbitor.arbitration.arbitorId = numArbitors;

        // stake
        newArbitor.slashing.stakedBalance = msg.value;

        // make searchable in other mapping as well:
        arbitorAddresses[numArbitors] = msg.sender;

        numArbitors++;

        //emit RegisterEvent();
        
    }


    // should there be a variable that differentiates between the provisionary reward and the stake?
    // should delete arbitor from mapping otherwise it will lead to problems when registering
    // I have to check if the arbitor is still in a case when he wants to withdraw!
    // assigned cases has to be 0
    // how does the regegistering works? if falls below staked amount, will automatically deregister!
    function withdraw() external {
        require(msg.sender == address(0));

        //emit WithdrawEvent();
    }

    // returns owner if not enough arbitors
    function drawArbitor() internal  returns(address _drawnArbitor){
        if(numArbitors>=10){    
            // hash random number
            // totalSize/numArbitors
            // how many times does the (totalnum/numArbitors) -> fit into the random number with 

            // Have to check how that works here:
            //uint randomValue = uint(keccak256(randomNumber));
            uint randomValue = randomNumber;

            // the one with the Id of choice -> choice is randomValue/numArbitors because it rounds to 0!
            return arbitorAddresses[randomValue/numArbitors];
        } else {            
            return owner;
        }
    }

    // ---------------------- PHASE MODIFIERS ------------------------------------------------------

    modifier ifBasicPhaseRequirements (uint _requestId){
        require(block.timestamp <= requests[_requestId].deadlines.basic , "incorrect time interval");
        _;
    }

    modifier ifInitiatorPhaseRequirements (uint _requestId){
        require(block.timestamp > requests[_requestId].deadlines.basic && block.timestamp <= requests[_requestId].deadlines.initiator , "incorrect time interval");
        require(requests[_requestId].basic.informationIdCounter > 0, "no information has been provided");
        _;
    }

     modifier ifDisputePhaseRequirements (uint _requestId){
        require(block.timestamp > requests[_requestId].deadlines.initiator && block.timestamp <= requests[_requestId].deadlines.dispute, "incorrect time interval");
        // it was possible to pick a winner (there was one info at least)
        require(requests[_requestId].basic.informationIdCounter > 0, "no information has been provided");
        _;
    }

     modifier ifArbitrationPhaseRequirements (uint _requestId){
         console.log(block.timestamp, "timestamp");
         console.log(requests[_requestId].deadlines.dispute, "dispute");
         console.log(requests[_requestId].deadlines.arbitration, "arbitration");
         require(requests[_requestId].dispute.disputingProvider != address(0), "there is not a dispute");
        require(block.timestamp > requests[_requestId].deadlines.dispute && block.timestamp <= requests[_requestId].deadlines.arbitration , "incorrect time interval");
        
        _;
    }

     modifier ifPayoutPhaseRequirements (uint _requestId){
        require(block.timestamp > requests[_requestId].deadlines.arbitration , "incorrect time interval");
        _;
    }

    // ---------------------- BASIC PHASE FUNCTIONS ------------------------------------------------------

    function request(string memory _requestContent, uint _deadline) external payable {

        Request storage newRequest = requests[requestIdCounter];
        newRequest.basic.content = _requestContent;
        newRequest.basic.reward = (msg.value/depositMultiple)*(depositMultiple-1);
        newRequest.basic.initiatorDeposit =  msg.value/depositMultiple;
        newRequest.basic.initiatorAddress = payable(msg.sender);

        newRequest.deadlines.basic = block.timestamp + _deadline; 
        newRequest.deadlines.initiator = newRequest.deadlines.basic + delayInMinutes * 1 minutes;
        newRequest.deadlines.dispute = newRequest.deadlines.basic + delayInMinutes * 2 minutes;
        newRequest.deadlines.arbitration = newRequest.deadlines.basic + delayInMinutes * 3 minutes;
        newRequest.deadlines.payout = newRequest.deadlines.basic + delayInMinutes * 4 minutes;
        
        requestAddresses[msg.sender] = requestIdCounter;
        requestIdCounter++;

        emit RequestHasChanged(requestIdCounter-1);
       
    }



    function submitInformation(string memory _informationContent, uint _requestId) external ifBasicPhaseRequirements(_requestId) {

        Information memory newInformation;
        newInformation.content = _informationContent;
        newInformation.provider = payable(msg.sender);

        uint informationCounter = requests[_requestId].basic.informationIdCounter;
        providers[_requestId][informationCounter] = newInformation;

        providerAddresses[msg.sender][_requestId] = true;
        
        requests[_requestId].basic.informationIdCounter++;

        emit RequestHasChanged(_requestId);


    }
    
    // ---------------------- INITIATOR PHASE FUNCTIONS ------------------------------------------------------
    
    modifier onlyInitiator (uint _requestId) {
      require(msg.sender == requests[_requestId].basic.initiatorAddress, "you are not the initiator of this request");
      _;
    }   

    function pickWinner(uint _requestId, address payable _winnerAddress) external ifInitiatorPhaseRequirements(_requestId) onlyInitiator(_requestId) {
        require(providerAddresses[_winnerAddress][_requestId] == true, "that provider address does not exist");
        requests[_requestId].initiator.winnerByInitiator = _winnerAddress;

        emit RequestHasChanged(_requestId);

    }

    // ---------------------- DISPUTE PHASE FUNCTIONS ------------------------------------------------------

    function dispute(uint _requestId) external payable ifDisputePhaseRequirements(_requestId) onlyProvider(_requestId)  {
        require(requests[_requestId].dispute.disputingProvider == address(0), "disputing provider has alreaby been set");
     
        // if the initiator has picked a winner, the provider has to pay to dispute. 
        if(requests[_requestId].initiator.winnerByInitiator != address(0)){
            require(msg.value >= requests[_requestId].basic.initiatorDeposit, "deposit is too small");

            // assigns balance (if there has to be one)
            requests[_requestId].dispute.providerDeposit = msg.value;

        // if the provider has not picked a winner, calling the function should be free
        } else {
            require(msg.value == 0 wei, "function is free to call");
        }

        requests[_requestId].dispute.disputingProvider = payable(msg.sender);  

        // arbitor it chosen at random through the draw function
        address drawnArbitor = drawArbitor();

        // To Do: Cannot be done twice at the moment
        arbitors[drawnArbitor].slashing.assignedCaseId = _requestId;
        requests[_requestId].arbitration.assignedArbitor = payable(drawnArbitor);

        emit RequestHasChanged(_requestId);


    }
    
    // ---------------------- ARBITRATION PHASE FUNCTIONS ------------------------------------------------------

    function arbitorPicksWinner(uint _requestId, address _winningProvider) external ifArbitrationPhaseRequirements(_requestId) {
        require(requests[_requestId].arbitration.assignedArbitor == msg.sender, "assigned arbitor is correct");
        
    
        requests[_requestId].arbitration.winnerByArbitration = payable(_winningProvider);

        emit RequestHasChanged(_requestId);
       
    }

    // ---------------------- PAYOUT PHASE FUNCTIONS ------------------------------------------------------
 
    /* 
    Case 1: 0 answer
    -> reimbursed

    Case 2: 1 answer
    -> reimbursed
    -> reward is paid to that one no matter what    

    Case 3: >1 answers

        d) arbitration happened: initiator wins
        -> remibursed
        -> reward is paid out to winner
        -> challenger pays arbitor (from info.)
       
        b) arbitration happened: somebody else won
        -> both cases -> challenger gets fee back 
        -> initiator pays arbitor
        -> reward is paid out to winner
        
        c) no arbitration
        -> deposit of initiator is remibursed
        -> reward is payed out
     */


    // could several cases be happening here?
    // THIS THING IS NOT CORRECT! CHECK NOTES.JS
    function payout(uint _requestId) external ifPayoutPhaseRequirements(_requestId) {
        require(requests[_requestId].requestClosed == false, "Case is already closed");

        uint informationIdCounter = requests[_requestId].basic.informationIdCounter;
        address payable initiatorAddress =  requests[_requestId].basic.initiatorAddress;
        address payable singleProvider = providers[_requestId][0].provider;
        address payable winnerByInitiator = requests[_requestId].initiator.winnerByInitiator;
        address payable disputingProvider = requests[_requestId].dispute.disputingProvider;
        address payable winnerByArbitration = requests[_requestId].arbitration.winnerByArbitration;
        address payable arbitorsAddress = requests[_requestId].arbitration.assignedArbitor;

        uint initiatorDeposit = requests[_requestId].basic.initiatorDeposit;
        uint providerDeposit = requests[_requestId].dispute.providerDeposit;
        uint reward = requests[_requestId].basic.reward;
   
        // no answer -> reimbursed deposit
        if(informationIdCounter == 0){
           initiatorAddress.transfer(initiatorDeposit);

        // if one answer -> reimbursed deposit
        // does that make total sense with the other funcitons?
        } else if (informationIdCounter == 1) {
            // reimburse
           initiatorAddress.transfer(initiatorDeposit);
            
            // pay reward
            singleProvider.transfer(reward);

        // more than one answer
        } else {
            
            // if there was a dispute
            // does that imply there was also arbitration? not necessarily!
            if(disputingProvider != address(0)) {

                // if initiator won
                if(winnerByArbitration == winnerByInitiator) {
                    // reimburse
                     requests[_requestId].dispute.providerDeposit = 0;
                    initiatorAddress.transfer(initiatorDeposit);
                   

                    // pay reward
                    requests[_requestId].basic.reward = 0;
                    winnerByInitiator.transfer(reward);
               

                    // dispute fee -> arbitor (provisionaryReward)
                    requests[_requestId].dispute.providerDeposit = 0;     
                    arbitors[arbitorsAddress].arbitration.provisionaryReward += providerDeposit;
                    

                } else {
                    // challenger or somebody else won
                
                    // arbitor gets initiatorDeposit
                    arbitors[arbitorsAddress].arbitration.provisionaryReward += initiatorDeposit;

                    // challenger gets fee back
                    requests[_requestId].basic.initiatorDeposit = 0;
                    disputingProvider.transfer(providerDeposit); 
                    

                    // reward is payed out   
                     requests[_requestId].basic.reward = 0;
                   winnerByArbitration.transfer(reward);   
                  
                }

            } else {
                // no arbitration happened
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

    function slashingArbitor() internal {
       emit SlashingArbitorEvent();
    }

    // ------------------------ GETTER FUNCTIONS ----------------------------------------


     function getRequest(uint _requestId) external view returns(Request memory,  Information[] memory, Arbitor memory){
        uint counter = requests[_requestId].basic.informationIdCounter;
        
        Information[] memory infoArray = new Information[](counter);
       
        for(uint i=0; i<counter; i++){
            infoArray[i] = providers[_requestId][i];
        }

       

       // returns a request and all the related questions     
       return (requests[_requestId], infoArray, arbitors[requests[_requestId].arbitration.assignedArbitor]);
    } 
    

    function getDeadlines(uint _requestId) external view returns(uint, uint, uint, uint, uint, uint){
        uint current = block.timestamp;
        uint basic = requests[_requestId].deadlines.basic;
        uint initiator = requests[_requestId].deadlines.initiator;
        uint dispute = requests[_requestId].deadlines.dispute;
        uint arbitration = requests[_requestId].deadlines.arbitration;
        uint payout = requests[_requestId].deadlines.payout;

        return(current, basic, initiator, dispute, arbitration, payout);
    }


    function test() external pure returns(uint) {
        return 10;
    }
}