'use strict'

const defaultRequestTimeout = 4000;

const baseUrl = (process.env.NODE_ENV === 'production') ? `${location.protocol}//${location.host}/` : 'http://127.0.0.1:5000/';

function request(method, url, params = null, body = null, timeout = defaultRequestTimeout) {
	let internalURL = baseUrl + url;
	if (params) {
		let hadParam = false;
		for (let key in params) {
			internalURL += (hadParam ? '&' : '?') + key + '=' + encodeURIComponent(params[key]);
			hadParam = true;
		}
	}

	const xhr = new XMLHttpRequest();
	xhr.open(method, internalURL);
	xhr.responseType = 'text';
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.timeout = timeout;

	return new Promise((resolve, reject) => {
		xhr.onload = function() {
			if (xhr.status >= 200 && xhr.status < 300) {
				try {
					if (!xhr.responseText) {
						resolve(null);
					} else {
						resolve(JSON.parse(xhr.responseText));
					}
				} catch (e) {
					reject(e);
				}
			} else if (xhr.status !== 0) {
				reject(new Error(`Server returned HTTP code ${xhr.status} ${xhr.statusText}`));
			} else {
				reject(new Error('HTTP request failed'));
			}
		};
		xhr.onabort = function() {
			reject(new Error('Request aborted'));
		}
		xhr.onerror = function() {
			reject(new Error('HTTP request failed'));
		};
		xhr.ontimeout = function () {
			reject(new Error('HTTP request timed out'));
		};
		xhr.send(body);
	});
}

// Job Queue

export function getQueue() { return request('GET', 'printFarm/queue') }

export function addFile(filename, content) {
	const payload = (content instanceof(Blob)) ? content : new Blob([content]);
	return request('PUT', 'printFarm/job', { filename }, payload, 0)
}

export function pauseFile(index) { return request('POST', 'printFarm/pause', { index }) }

export function resumeFile(index) { return request('POST', 'printFarm/resume', { index }) }

export function cancelFile(index) { return request('POST', 'printFarm/cancel', { index }) }

export function repeatFile(index) { return request('POST', 'printFarm/repeat', { index }) }

export function deleteFile(index) { return request('DELETE', 'printFarm/job', { index }) }

export function cleanUp() { return request('POST', 'printFarm/cleanUp') }

// Printers

export function getPrinters() { return request('GET', 'printFarm/printers') }

export function addPrinter(hostname) { return request('PUT', 'printFarm/printer', { hostname }) }

export function suspendPrinter(hostname) { return request('POST', 'printFarm/suspendPrinter', { hostname }) }

export function resumePrinter(hostname) { return request('POST', 'printFarm/resumePrinter', { hostname }) }

export function deletePrinter(hostname) { return request('DELETE', 'printFarm/printer', { hostname }) }

