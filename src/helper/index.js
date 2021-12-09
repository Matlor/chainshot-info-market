export const toTime = (unix) => {
	let newDate = new Date(unix);
	let date = newDate.toLocaleTimeString([], {
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});

	return date;
};
