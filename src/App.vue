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
				Duet3D Print Farm Overview
			</h1>

			<b-alert :show="!!errorMessage" variant="warning">
				<b-icon icon="exclamation-triangle" class="mr-1"></b-icon> {{ errorMessage }}
			</b-alert>

			<b-card no-body>
				<template #header>
					<span>
						<b-icon icon="card-list"></b-icon> Job Queue
					</span>

					<upload-button :disabled="!!errorMessage"></upload-button>
				</template>

				<b-alert :show="jobs.length === 0" variant="info" class="mb-0">
					<b-icon icon="info-circle" class="mr-1"></b-icon> No Jobs Available
				</b-alert>

				<b-table v-show="jobs.length > 0" striped hover :fields="jobFields" :items="jobs" class="mb-0 job-table">
					<template #cell(Filename)="{ item }">
						<b-icon :icon="getJobIcon(item)" :icon-props="{ fontScale: 2 }"></b-icon>
						{{ item.Filename }}
					</template>
					<template #cell(Progress)="{ item }">
						<span v-if="item.Progress === null && !item.TimeCompleted">
							n/a
						</span>
						<b-progress v-else :max="1" show-progress :animated="!item.TimeCompleted" :variant="getJobProgressVariant(item)">
							<b-progress-bar :value="item.TimeCompleted ? 1 : item.Progress" :label="`${((item.TimeCompleted ? 1 : item.Progress) * 100).toFixed(1)} %`"></b-progress-bar>
						</b-progress>
					</template>
					<template #cell(Delete)="{ item, index }">
						<b-button v-show="!item.Hostname || !!item.TimeCompleted" size="sm" variant="danger" @click="deleteFile(index)">
							<b-icon icon="trash"></b-icon>
						</b-button>
					</template>
				</b-table>
			</b-card>

			<b-card class="mt-3" no-body>
				<template #header>
					<span>
						<b-icon icon="printer"></b-icon> Printer Management
					</span>

					<add-printer-button :disabled="!!errorMessage"></add-printer-button>
				</template>

				<b-alert :show="printers.length === 0" variant="warning" class="mb-0">
					<b-icon icon="exclamation-triangle" class="mr-1"></b-icon> No Jobs Available
				</b-alert>

				<b-table v-show="printers.length > 0" striped hover :fields="printerFields" :items="printers" class="mb-0 printer-table">
					<template #cell(Hostname)="{ item }">
						<b-icon :icon="getPrinterIcon(item)"></b-icon>
						{{ item.Hostname }}
						<status-label :status="item.Status" class="ml-1"></status-label>
					</template>
					<template #cell(Delete)="data">
						<b-button size="sm" variant="danger" @click="deletePrinter(data.item.Hostname)">
							<b-icon icon="trash"></b-icon>
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
				{ key: 'Progress', sortable: true },
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
		getJobIcon(item) {
			if (item.TimeCompleted) {
				return 'check';
			}
			if (item.Hostname) {
				if (this.printers.some(printer => (printer.Hostname === item.Hostname) && 
					(printer.Status === 'pausing') || (printer.Status === 'paused') || (printer.Status === 'resuming') || (printer.Status === 'cancelling'))
				) {
					return 'pause';
				}
				return 'play-fill';
			}
			return 'asterisk';
		},
		getJobProgressVariant(item) {
			if (item.TimeCompleted) {
				return 'success';
			}
			if (item.Hostname && this.printers.some(printer => (printer.Hostname === item.Hostname) && 
				(printer.Status === 'pausing') || (printer.Status === 'paused') || (printer.Status === 'resuming') || (printer.Status === 'cancelling'))
			) {
				return 'warning';
			}
			return 'primary';
		},
		getPrinterIcon(item) {
			return item.Online ? 'check' : 'x';
		},
		async updateLoop() {
			// Get live values
			try {
				this.jobs = await getQueue();
				this.printers = await getPrinters();

				this.errorMessage = null;
			} catch (e) {
				this.jobs = this.printers = [];
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
