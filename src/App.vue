<style scoped>
.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}
</style>

<style>
.job-table button {
	white-space: nowrap;
}
.job-table td {
	vertical-align: middle;
}
.job-table tr > td:last-child {
	padding-right: 20px;
	width: 1%;
}

.printer-table button {
	white-space: nowrap;
}
.printer-table td {
	vertical-align: middle;
}
.printer-table tr > td:last-child {
	padding-right: 20px;
	width: 1%;
}
</style>

<template>
	<div id="app">
		<b-container class="mt-3">
			<h1 class="mb-3 text-center">
				Print Farm Overview
			</h1>

			<b-alert :show="!!errorMessage" variant="warning">
				<b-icon icon="exclamation-triangle"></b-icon> {{ errorMessage }}
			</b-alert>

			<b-card no-body>
				<template #header>
					<span>
						<b-icon icon="card-list"></b-icon> Job Queue
					</span>

					<upload-button></upload-button>
				</template>

				<b-table striped hover :fields="jobFields" :items="jobs" class="mb-0 job-table">
					<template #cell(Delete)="data">
						<b-button v-show="!data.item.Hostname || !!data.item.TimeCompleted" size="sm" variant="danger" @click="deleteFile(data.index)">
							<b-icon icon="trash"></b-icon> Delete
						</b-button>
					</template>
				</b-table>
			</b-card>

			<b-card class="mt-3" no-body>
				<template #header>
					<span>
						<b-icon icon="printer"></b-icon> Printer Management
					</span>

					<add-printer-button></add-printer-button>
				</template>

				<b-table striped hover :fields="printerFields" :items="printers" class="mb-0 printer-table">
					<template #cell(Delete)="data">
						<b-button size="sm" variant="danger" @click="deletePrinter(data.item.Hostname)">
							<b-icon icon="trash"></b-icon> Delete
						</b-button>
					</template>
				</b-table>
			</b-card>
		</b-container>
	</div>
</template>

<script>
'use strict'

import { getQueue, getPrinters, deleteFileByIndex, deletePrinter } from './requests.js'
import { displayTime } from './utils.js'

export default {
	data() {
		return {
			errorMessage: null,
			jobFields: [
				{ key: 'Filename', sortable: true },
				{ key: 'Hostname', sortable: true },
				{ key: 'TimeCreated', formatter: (value) => value ? (new Date(value)).toLocaleString() : 'n/a', sortable: true },
				{ key: 'Progress', formatter: (value, key, item) => item.TimeCompleted ? '100 %' : (value ? `${(value * 100).toFixed(1)} %` : 'n/a'), sortable: true },
				{ key: 'TimeLeft', formatter: (value) => displayTime(value), sortable: true },
				{ key: 'TimeCompleted', formatter: (value) => value ? (new Date(value)).toLocaleString() : 'n/a', sortable: true },
				{ key: 'Delete', label: '', sortable: false }
			],
			jobs: [],
			printerFields: [
				{ key: 'Hostname', sortable: true },
				{ key: 'Online', formatter: (value) => value ? 'Yes' : 'No', sortable: true },
				{ key: 'JobFile', formatter: (value) => value ? value : 'none', sortable: true },
				{ key: 'Delete', label: '', sortable: false }
			],
			printers: []
		}
    },
	mounted() {
		// Start querying the print farm
		this.updateLoop();
	},
	methods: {
		async updateLoop() {
			// Get live values
			try {
				this.jobs = await getQueue();
				this.printers = await getPrinters();

				this.errorMessage = null;
			} catch (e) {
				this.errorMessage = e.toString();
			}

			// Update once a second
			setTimeout(this.updateLoop, 1000);
		},
		async deleteFile(index) {
			try {
				await deleteFileByIndex(index);
				this.jobs = await getQueue();
			} catch (e) {
				alert(`Failed to delete file!\n\n${e.message}`);
			}
		},
		async deletePrinter(hostname) {
			try {
				await deletePrinter(hostname);
				this.printers = await getPrinters();
			} catch (e) {
				alert(`Failed to delete printer!\n\n${e.message}`);
			}
		}
	}
}
</script>
