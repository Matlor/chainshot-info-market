import ethereum from "../../state/api/ethereum";
import { useState, useRef } from "react";
import { Button, Text } from "@chakra-ui/react";

const Account = () => {
	const [account, setAccount] = useState("");

	const ref = useRef("");
	window.ethereum.on("accountsChanged", async () => {
		let address = await ethereum.testMetamask();

		if (ref.current == "") {
			ref.current = address;
			setAccount(address);
		}

		if (ref.current != address) {
			ref.current = address;
			setAccount(address);
		}
	});

	let accounts = [
		{
			address: "0x24876602373858cF6c6f9429e37b8fC04E5c1e20",
			name: "Arbitor",
		},
		{
			address: "0x0F729f69699Fe3c6736d0e8974c7D4af8F0B1CE4",
			name: "Initiator",
		},
		{
			address: "0xE62e10dEfE4465E8F290d5f5180238e6a634B130",
			name: "Provider1",
		},
		{
			address: "0x47239d71e9aAc8E150F5337202d79f9b257E3203",
			name: "Provider2",
		},
	];

	let accountName = "";

	for (let i = 0; i < accounts.length; i++) {
		if (accounts[i].address.toLocaleLowerCase() == account) {
			accountName = accounts[i].name;
		}
	}

	const testMeta = async (e) => {
		e.preventDefault();
		await ethereum.testMetamask();
	};

	return (
		<div>
			<Button style={{ margin: "20px 0px 0px 0px" }} onClick={testMeta}>
				Connect
			</Button>
			<Text fontSize="xl">
				{account}
				{accountName}
			</Text>
		</div>
	);
};

export default Account;
