import { useState } from "react";
import { toTime } from "../../helper";
import { Text } from "@chakra-ui/react";

const Time = () => {
	const [time, setTime] = useState(Date.now());

	setTimeout(() => {
		let time = Date.now();
		setTime(time);
	}, 1000);

	return (
		<div style={{ margin: "50px 0px 50px 0px" }}>
			<Text fontSize="xl">Current Time: {toTime(time)}</Text>
		</div>
	);
};

export default Time;
