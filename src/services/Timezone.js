function formatToLocalTime(utcDate, timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone) {
	const date = new Date(utcDate);
	return new Intl.DateTimeFormat("en-GB", {
		timeZone,
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hour12: true
	}).format(date);
}

export { formatToLocalTime };
