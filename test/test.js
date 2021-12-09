const { expect } = require("chai");
const { ethers } = require("hardhat");
var contractAddress = require("../src/address.json");

console.log(contractAddress, "address");

let signers = [];
let initiator;
let signer1;
let signer2;
let owner;

let InformationMarket;
let informationMarket;
let informationMarket1;
let informationMarket2;

let overrides;

beforeEach(async function () {
	InformationMarket = await ethers.getContractFactory("InformationMarket");

	signers = await ethers.getSigners();
	owner = signers[0];
	signer1 = signers[1];
	signer2 = signers[2];
	initiator = signers[3];

	informationMarket = await InformationMarket.deploy(5, 1, 44, 2);
	informationMarket1 = informationMarket.connect(signer1);
	informationMarket2 = informationMarket.connect(signer2);
	informationMarketInitiator = informationMarket.connect(initiator);
});
describe("InformationMarket", function () {
	it("should be able to ask a question", async function () {
		overrides = {
			value: ethers.utils.parseEther("0.01"),
		};
		await (
			await informationMarketInitiator.request(
				"my first request",
				120,
				overrides
			)
		).wait();

		await (
			await informationMarket1.submitInformation("answer of signer 1", 0)
		).wait();

		await (
			await informationMarket2.submitInformation("answer of signer 2", 0)
		).wait();

		let requestArray = await informationMarketInitiator.getRequest(0);
		let request = requestArray[0];

		expect(request.basic.initiatorAddress).to.equal(initiator.address);
		expect(request.basic.content).to.not.equal("");
		expect(request.basic.reward).above(0);

		expect(request.basic.informationIdCounter).least(2);

		expect(request.deadlines.basic).to.not.equal(0);
		expect(request.deadlines.initiator).to.not.equal(0);
		expect(request.deadlines.dispute).to.not.equal(0);
		expect(request.deadlines.arbitration).to.not.equal(0);
		expect(request.deadlines.payout).to.not.equal(0);
	}).timeout(30000);

	it("should be able to give an answer", async function () {
		overrides = {
			value: ethers.utils.parseEther("0.01"),
		};
		await (
			await informationMarketInitiator.request(
				"my first request",
				120,
				overrides
			)
		).wait();

		await (
			await informationMarket1.submitInformation("answer of signer 1", 0)
		).wait();

		await (
			await informationMarket2.submitInformation("answer of signer 2", 0)
		).wait();

		let requestArray = await informationMarketInitiator.getRequest(0);
		let infos = requestArray[1];

		expect(infos.length).to.equal(2);

		expect(infos[0].provider).to.not.equal("");
		expect(infos[0].content).to.not.equal("");
		expect(infos[1].provider).to.not.equal("");
		expect(infos[1].content).to.not.equal("");
	}).timeout(30000);

	it("the initiator should be able to pick a winner during specific time interval", async function () {
		overrides = {
			value: ethers.utils.parseEther("0.01"),
		};
		await (
			await informationMarketInitiator.request(
				"my first request",
				120,
				overrides
			)
		).wait();

		await (
			await informationMarket1.submitInformation("answer of signer 1", 0)
		).wait();

		await (
			await informationMarket2.submitInformation("answer of signer 2", 0)
		).wait();

		// expected to revert due to deadline
		await expect(informationMarketInitiator.pickWinner(0, signer1.address)).to
			.be.reverted;

		// increasing time
		await ethers.provider.send("evm_increaseTime", [120]);
		await ethers.provider.send("evm_mine");

		// expected to revert, due to them not being initiator
		await expect(informationMarket1.pickWinner(0, signer1.address)).to.be
			.reverted;

		await expect(informationMarket2.pickWinner(0, signer1.address)).to.be
			.reverted;

		// expected to succeed
		console.log(signer1.address, "this one");
		await (
			await informationMarketInitiator.pickWinner(0, signer1.address)
		).wait();

		// Expected address of winner to be in request
		let requestArray = await informationMarketInitiator.getRequest(0);
		let request = requestArray[0];

		expect(request.initiator.winnerByInitiator).to.equal(signer1.address);

		// increasing time
		await ethers.provider.send("evm_increaseTime", [120]);
		await ethers.provider.send("evm_mine");

		// expected to revert due to deadline being passed
		await expect(informationMarketInitiator.pickWinner(0, signer1.address)).to
			.be.reverted;
	}).timeout(30000);

	// --- DISPUTE ---
	// if dispute has not been started yet
	// provider address should be set under disputing provider
	// user that is not provider should not be able to cause a dispute
	// if no winner has been picked, there is not deposit needed
	// if a winner has been picked, the deposit should some fraction of the reward

	// arbitor should have the requestId
	// assigned arbitor should be set
	it("provider should be able to cause a dispute, case Provider has pickedWinner", async function () {
		overrides = {
			value: ethers.utils.parseEther("0.01"),
		};
		await (
			await informationMarketInitiator.request(
				"my first request",
				120,
				overrides
			)
		).wait();

		await (
			await informationMarket1.submitInformation("answer of signer 1", 0)
		).wait();

		await (
			await informationMarket2.submitInformation("answer of signer 2", 0)
		).wait();

		// increasing time
		await ethers.provider.send("evm_increaseTime", [120]);
		await ethers.provider.send("evm_mine");

		await (
			await informationMarketInitiator.pickWinner(0, signer1.address)
		).wait();

		// increasing time
		await ethers.provider.send("evm_increaseTime", [120]);
		await ethers.provider.send("evm_mine");

		// expect to revert: msg.value needs to be equal or more than the deposit of the initiator
		await expect(informationMarket2.dispute(0)).to.be.reverted;

		// expect to work
		overrides = {
			value: ethers.utils.parseEther("0.002"),
		};
		await (
			await expect(informationMarket2.dispute(0, overrides)).to.not.be.reverted
		).wait();

		let requestArray = await informationMarketInitiator.getRequest(0);
		let request = requestArray[0];

		// expect provider Deposit to be the minimum value
		expect(request.dispute.providerDeposit).to.equal(
			ethers.utils.parseEther("0.002")
		);

		// expect disputing provider to be correctly set
		expect(request.dispute.disputingProvider).to.equal(signer2.address);

		// TO DO: expect arbitor to be set, either owner or some other party

		//expect arbitor not to be the initiator, or provider
		expect(request.arbitration.assignedArbitor).to.not.equal(initiator.address);
		expect(request.arbitration.assignedArbitor).to.not.equal(signer1.address);
		expect(request.arbitration.assignedArbitor).to.not.equal(signer2.address);

		// TO DO: expect that arbitor to have the assigned case
	}).timeout(30000);

	it("provider should be able to cause a dispute, case Provider has NOT pickedWinner", async function () {
		overrides = {
			value: ethers.utils.parseEther("0.01"),
		};
		await (
			await informationMarketInitiator.request(
				"my first request",
				120,
				overrides
			)
		).wait();

		await (
			await informationMarket1.submitInformation("answer of signer 1", 0)
		).wait();

		await (
			await informationMarket2.submitInformation("answer of signer 2", 0)
		).wait();

		// increasing time
		await ethers.provider.send("evm_increaseTime", [120]);
		await ethers.provider.send("evm_mine");

		// increasing time
		await ethers.provider.send("evm_increaseTime", [120]);
		await ethers.provider.send("evm_mine");

		// expect to workd: msg.value can be 0
		await expect(informationMarket2.dispute(0)).to.not.be.reverted;

		// expect to be reverted, unnecessary payment
		overrides = {
			value: ethers.utils.parseEther("0.002"),
		};

		await expect(informationMarket2.dispute(0, overrides)).to.be.reverted;

		let requestArray = await informationMarketInitiator.getRequest(0);
		let request = requestArray[0];

		// expect provider Deposit to be 0
		expect(request.dispute.providerDeposit).to.equal(
			ethers.utils.parseEther("0")
		);

		// expect disputing provider to be correctly set
		expect(request.dispute.disputingProvider).to.equal(signer2.address);

		// TO DO: expect arbitor to be set, either owner or some other party

		//expect arbitor not to be the initiator, or provider
		expect(request.arbitration.assignedArbitor).to.not.equal(initiator.address);
		expect(request.arbitration.assignedArbitor).to.not.equal(signer1.address);
		expect(request.arbitration.assignedArbitor).to.not.equal(signer2.address);

		// TO DO: expect that arbitor to have the assigned case
	}).timeout(30000);

	// it is assumed that the owner is doing the arbitration
	it("arbitration occurs properly", async function () {
		overrides = {
			value: ethers.utils.parseEther("0.01"),
		};
		await (
			await informationMarketInitiator.request(
				"my first request",
				120,
				overrides
			)
		).wait();

		await (
			await informationMarket1.submitInformation("answer of signer 1", 0)
		).wait();

		await (
			await informationMarket2.submitInformation("answer of signer 2", 0)
		).wait();

		// increasing time
		await ethers.provider.send("evm_increaseTime", [120]);
		await ethers.provider.send("evm_mine");

		// increasing time
		await ethers.provider.send("evm_increaseTime", [120]);
		await ethers.provider.send("evm_mine");

		// expect to workd: msg.value can be 0
		await expect(informationMarket2.dispute(0)).to.not.be.reverted;

		// increasing time
		await ethers.provider.send("evm_increaseTime", [120]);
		await ethers.provider.send("evm_mine");

		let deadlines = await informationMarket.getDeadlines(0);
		let deadlinesInDec = [];
		for (let i = 0; i < deadlines.length; i++) {
			deadlinesInDec.push(parseInt(deadlines[i]._hex, 16));
		}
		console.log(deadlinesInDec);

		// if other people call the arbitorPicksWinner it is reverted
		await expect(
			informationMarketInitiator.arbitorPicksWinner(0, signer2.address)
		).to.be.reverted;
		await expect(informationMarket1.arbitorPicksWinner(0, signer2.address)).to
			.be.reverted;
		await expect(informationMarket2.arbitorPicksWinner(0, signer2.address)).to
			.be.reverted;

		// arbitor picks winner
		console.log(await informationMarket.arbitorPicksWinner(0, signer2.address));

		let requestArray = await informationMarketInitiator.getRequest(0);
		let request = requestArray[0];
		// winner is a provider
		expect(request.arbitration.winnerByArbitration).to.equal(signer2.address);
	}).timeout(30000);
});
