'use strict'

export function displayTime(value?: number, showTrailingZeroes = false): string {
	if (value == null || isNaN(value)) {
		return 'n/a';
	}

	value = Math.round(value);
	if (value < 0) {
		value = 0;
	}

	const timeLeft: Array<string> = [];
	if (value >= 3600) {
		const temp = Math.floor(value / 3600);
		if (temp > 0) {
			timeLeft.push(temp + 'h');
			value = value % 3600;
		}
	}
	if (value >= 60) {
		const temp = Math.floor(value / 60);
		if (temp > 0) {
			timeLeft.push(((value > 9 || !showTrailingZeroes) ? temp : '0' + temp) + 'm');
			value = value % 60;
		}
	}
    value = Math.floor(value);
	timeLeft.push(((value > 9 || !showTrailingZeroes) ? value : '0' + value) + 's');

	return timeLeft.join(' ');
}
