import { Job, Printer } from "./types";

const baseUrl: string = (process.env.NODE_ENV === "production") ? `${location.protocol}//${location.host}/` : "http://127.0.0.1:5000/";
const defaultRequestTimeout: number = 4000;

function request(method: string, url: string, params: Record<any, string> | null = null, body: any | null = null, timeout: number = defaultRequestTimeout): Promise<string | null> {
	let internalURL = baseUrl + url;
	if (params) {
		let hadParam = false;
		for (const key in params) {
			internalURL += (hadParam ? '&' : '?') + key + '=' + encodeURIComponent(params[key]);
			hadParam = true;
		}
	}

	const xhr = new XMLHttpRequest();
	xhr.open(method, internalURL);
	xhr.responseType = "text";
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.timeout = timeout;

	return new Promise((resolve, reject) => {
		xhr.onload = function() {
			if (xhr.status >= 200 && xhr.status < 300) {
				try {
					if (!xhr.responseText) {
						resolve(null);
					} else {
						resolve(xhr.responseText);
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

export async function getQueue(): Promise<Array<Job>> {
    const response = await request('GET', 'printFarm/queue');
    return response ? JSON.parse(response, Job.reviver) : [];
}

export async function addFile(filename: string, content: any): Promise<void> {
	const payload = (content instanceof(Blob)) ? content : new Blob([content]);
	await request('PUT', 'printFarm/job', { filename }, payload, 0)
}

export async function pauseFile(index: number): Promise<void> {
    await request('POST', 'printFarm/pause', { 'index': index.toString() });
}

export async function resumeFile(index: number): Promise<void> {
    await request('POST', 'printFarm/resume', { 'index': index.toString() });
}

export async function cancelFile(index: number): Promise<void> {
    await request('POST', 'printFarm/cancel', { 'index': index.toString() });
}

export async function repeatFile(index: number) {
    await request('POST', 'printFarm/repeat', { 'index': index.toString() });
}

export async function deleteFile(index: number) {
    return request('DELETE', 'printFarm/job', { 'index': index.toString() });
}

export async function cleanUp(): Promise<void> {
    await request('POST', 'printFarm/cleanUp');
}

// Printers

export async function getPrinters(): Promise<Array<Printer>> {
    const response = await request('GET', 'printFarm/printers');
    return response ? (JSON.parse(response) as Array<Printer>) : [];
}

export async function addPrinter(hostname: string): Promise<void> {
    await request('PUT', 'printFarm/printer', { hostname });
}

export async function suspendPrinter(hostname: string): Promise<void> {
    await request('POST', 'printFarm/suspendPrinter', { hostname });
}

export async function resumePrinter(hostname: string) {
    return request('POST', 'printFarm/resumePrinter', { hostname });
}

export async function deletePrinter(hostname: string) {
    return request('DELETE', 'printFarm/printer', { hostname });
}
