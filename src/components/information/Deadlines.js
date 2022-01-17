import { toTime } from "../../helper";
import { useState } from "react";

const Deadlines = ({ deadlines }) => {
	const [key, setKey] = useState(null);
	const [time, setTime] = useState(Date.now());

	const interval = () => {
		let index = null;

		if (time <= deadlines.basic * 1000) {
			index = 0;
		} else if (
			time <= deadlines.initiator * 1000 &&
			time > deadlines.basic * 1000
		) {
			index = 1;
		} else if (
			time <= deadlines.dispute * 1000 &&
			time > deadlines.initiator * 1000
		) {
			index = 2;
		} else if (
			time <= deadlines.arbitration * 1000 &&
			time > deadlines.dispute * 1000
		) {
			index = 3;
		} else if (
			time <= deadlines.payout * 1000 &&
			time > deadlines.arbitration * 1000
		) {
			index = 4;
		}

		return index;
	};

	let inter = interval();

	setTimeout(() => {
		let time = Date.now();
		setTime(time);

		if (key !== inter) {
			setKey(inter);
		}
	}, 3000);

	let arr = [
		deadlines.basic,
		deadlines.initiator,
		deadlines.dispute,
		deadlines.arbitration,
		deadlines.payout,
	];

	let listOfDeadlines = () => {
		return arr.map((deadline, index) => {
			let color;

			if (index === key) {
				color = "green";
			}

			let name = ["basic", "initiator", "dispute", "arbitration", "payout"];

			return (
				<div
					style={{
						margin: "0px 0px 0px 10px",
						backgroundColor: color,
					}}
				>
					{name[index]}: {toTime(deadline * 1000)}
				</div>
			);
		});
	};

	return <div>{listOfDeadlines()}</div>;
};

export default Deadlines;
