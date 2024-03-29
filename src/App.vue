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

.job-table tr > td:nth-last-child(2),
.job-table tr > td:last-child {
	padding-right: 0.25rem;
	width: 1%;
}
.job-table tr > td:last-child {
	padding-left: 0.25rem;
	padding-right: 1.25rem;
}

.printer-table button {
	white-space: nowrap;
}
.printer-table td {
	vertical-align: middle;
}
.printer-table tr > td:nth-last-child(2),
.printer-table tr > td:last-child {
	padding-right: 0.25rem;
	width: 1%;
}
.printer-table tr > td:last-child {
	padding-left: 0.25rem;
	padding-right: 1.25rem;
}
</style>

<template>
	<div id="app">
        <b-container fluid class="my-3">
            <h1 class="mb-4 text-center">
                Duet3D Print Farm Overview
            </h1>

            <b-alert :show="!!errorMessage" :variant="(errorMessage != null && errorMessage.startsWith('Error')) ? 'danger' : 'warning'">
                <b-icon icon="exclamation-triangle" class="mr-1"></b-icon> {{ errorMessage }}
            </b-alert>

            <b-row>
                <b-col cols="8">
                    <b-card no-body>
                        <template #header>
                            <span>
                                <b-icon icon="card-list"></b-icon> Job Queue
                            </span>

                            <div>
                                <upload-button :disabled="!!errorMessage"></upload-button>

                                <b-button v-show="canClean" size="sm" variant="info" class="ml-2" @click="cleanUp">
                                    <b-icon icon="filter-left"></b-icon> Clean Up
                                </b-button>
                            </div>
                        </template>

                        <b-alert :show="jobs.length === 0" variant="info" class="mb-0">
                            <b-icon icon="info-circle" class="mr-1"></b-icon> No Jobs available
                        </b-alert>

                        <b-table v-show="jobs.length > 0" striped hover :fields="jobFields" :items="jobs" no-provider-paging :current-page="currentJobPage" :per-page="10" class="mb-0 job-table">
                            <template #cell(Filename)="{ item }">
                                <b-icon :icon="getJobIcon(item)" :icon-props="{ fontScale: 2 }"></b-icon>
                                {{ item.Filename }}
                            </template>
                            <template #cell(Hostname)="{ item }">
                                {{ getPrinterName(item.Hostname) }}
                            </template>
                            <template #cell(Progress)="{ item }">
                                <span v-if="!!item.ProgressText" v-text="item.ProgressText"></span>
                                <b-progress v-else-if="item.Progress !== null || item.TimeCompleted" :max="1" show-progress :animated="!item.TimeCompleted" :variant="getJobProgressVariant(item)">
                                    <b-progress-bar :value="item.TimeCompleted ? 1 : item.Progress" :label="`${((item.TimeCompleted ? 1 : item.Progress) * 100).toFixed(1)} %`"></b-progress-bar>
                                </b-progress>
                            </template>
                            <template #cell(Time)="{ item }">
                                {{ formatTime(item) }}
                            </template>
                            <template #cell(ResumeRepeat)="{ item, index }">
                                <b-button v-if="item.Paused" size="sm" variant="success" @click="resumeFile(index)">
                                    <b-icon icon="play-fill"></b-icon>
                                </b-button>
                                <b-button v-else-if="!!item.TimeCompleted" size="sm" variant="primary" @click="repeatFile(index)">
                                    <b-icon icon="arrow-repeat"></b-icon>
                                </b-button>
                            </template>
                            <template #cell(PauseCancelDelete)="{ item, index }">
                                <b-button v-if="item.Paused" size="sm" variant="danger" @click="cancelFile(index)">
                                    <b-icon icon="stop-fill"></b-icon>
                                </b-button>
                                <b-button v-else-if="!item.Hostname || !!item.TimeCompleted" size="sm" variant="danger" @click="deleteFile(index)">
                                    <b-icon icon="trash"></b-icon>
                                </b-button>
                                <b-button v-else-if="item.Progress !== null" size="sm" variant="warning" :disabled="!!item.ProgressText" @click="pauseFile(index)">
                                    <b-icon icon="pause"></b-icon>
                                </b-button>
                            </template>
                        </b-table>

                        <b-pagination v-show="jobs.length > 10" v-model="currentJobPage" :total-rows="jobs.length" :per-page="10" align="fill" size="sm" class="my-0"></b-pagination>
                    </b-card>
                </b-col>

                <b-col cols="4" class="pl-0">
                    <b-card no-body>
                        <template #header>
                            <span>
                                <b-icon icon="printer"></b-icon> Printer Management
                            </span>

                            <add-printer-button :disabled="!!errorMessage"></add-printer-button>
                        </template>

                        <b-alert :show="printers.length === 0" variant="warning" class="mb-0">
                            <b-icon icon="exclamation-triangle" class="mr-1"></b-icon> No Printers available
                        </b-alert>

                        <b-table v-show="printers.length > 0" striped hover :fields="printerFields" :items="printers" class="mb-0 printer-table">
                            <template #cell(Name)="{ item }">
                                <b-icon :icon="getPrinterIcon(item)"></b-icon>
                                {{ item.Name }}
                                <status-label :status="item.Status" class="ml-1"></status-label>
                            </template>
                            <template #cell(Online)="{ item }">
                                {{ `${item.Online ? 'Yes' : 'No'} ${item.Suspended ? ' (suspended)' : ''}` }}
                            </template>
                            <template #cell(SuspendResume)="{ item }">
                                <b-button v-if="item.Suspended" size="sm" variant="success" @click="resumePrinter(item.Hostname)">
                                    <b-icon icon="play-fill"></b-icon>
                                </b-button>
                                <b-button v-else size="sm" variant="warning" @click="suspendPrinter(item.Hostname)">
                                    <b-icon icon="pause"></b-icon>
                                </b-button>
                            </template>
                            <template #cell(Delete)="{ item }">
                                <b-button size="sm" variant="danger" @click="deletePrinter(item.Hostname)">
                                    <b-icon icon="trash"></b-icon>
                                </b-button>
                            </template>
                        </b-table>
                    </b-card>
                </b-col>
            </b-row>

			<b-row class="my-2">
				<b-col class="text-center text-secondary">
					Version {{ version }}
				</b-col>
			</b-row>
        </b-container>
	</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { BvTableFieldArray } from "bootstrap-vue/src/components/table";

import { getQueue, pauseFile, resumeFile, cancelFile, repeatFile, deleteFile, cleanUp } from './api/requests'
import { getPrinters, suspendPrinter, resumePrinter, deletePrinter } from './api/requests'
import { Job, Printer } from './api/types';

import { displayTime } from './utils'
import pkg from '../package.json'

@Component
export default class App extends Vue {
	get canClean() {
		return this.jobs.some(job => job.TimeCompleted !== null);
	}

	public errorMessage: string | null = 'Attempting to connect...';

	public jobFields: BvTableFieldArray = [
		{ key: 'Filename' },
		{ key: 'TimeCreated', formatter: (value) => value ? (new Date(value)).toLocaleString() : 'n/a' },
		{ key: 'Hostname', label: 'Printer' },
		{ key: 'Progress' },
		{ key: 'Time', label: 'Time Left / Completed' },
		{ key: 'ResumeRepeat', label: '' },
		{ key: 'PauseCancelDelete', label: '' }
	];

	public jobs: Array<Job> = [];

	public currentJobPage = 1;

	public printerFields: BvTableFieldArray = [
		{ key: 'Name', sortable: true },
		{ key: 'Hostname', sortable: true },
		{ key: 'SuspendResume', label: '', sortable: false },
		{ key: 'Delete', label: '', sortable: false }
	];

	public printers: Array<Printer> = [];

	public version = pkg.version;

	mounted() {
		// Start querying the print farm
		this.updateLoop();
	}

	getJobIcon(item: Job): string {
		if (item.Paused) {
			return 'pause';
		}
		if (item.TimeCompleted) {
			return item.Cancelled ? 'x' : 'check';
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
	}

	getPrinterName(hostname: string): string {
		const printer = this.printers.find(printer => printer.Hostname === hostname);
		return printer ? printer.Name : hostname;
	}

	getJobProgressVariant(item: Job): string {
		if (item.TimeCompleted) {
			return item.Cancelled ? 'danger' : 'success';
		}
		if (!item.Hostname || item.Paused || this.printers.some(printer => (printer.Hostname === item.Hostname) && ((printer.Status === 'pausing') || (printer.Status === 'paused') || (printer.Status === 'resuming') || (printer.Status === 'cancelling')))
		) {
			return 'warning';
		}
		return 'primary';
	}

	formatTime(item: Job): string {
		if (item.TimeCompleted) {
			return (new Date(item.TimeCompleted)).toLocaleString();
		}
		if (item.TimeLeft) {
			return `${displayTime(item.TimeLeft)} remaining`;
		}
		return '';
	}

	getPrinterIcon(item: Printer): string {
		return item.Online ? 'check' : 'x';
	}

	async updateLoop(): Promise<void> {
		// Get live values
		try {
			this.jobs = await getQueue();
			this.printers = await getPrinters();

			this.errorMessage = null;
		} catch (e) {
			this.jobs = this.printers = [];
			this.errorMessage = e as string;
		}

		// Update once a second
		setTimeout(this.updateLoop, 1000);
	}

	async cleanUp(): Promise<void> {
		try {
			await cleanUp();
			this.jobs = await getQueue();
		} catch (e) {
			alert(`Failed to clean up!\n\n${e as string}`);
		}
	}

	async pauseFile(index: number): Promise<void> {
		try {
			await pauseFile(index);
			this.jobs = await getQueue();
		} catch (e) {
			alert(`Failed to pause file!\n\n${e as string}`);
		}
	}

	async resumeFile(index: number): Promise<void> {
		try {
			await resumeFile(index);
			this.jobs = await getQueue();
		} catch (e) {
			alert(`Failed to resume file!\n\n${e as string}`);
		}
	}

	async cancelFile(index: number): Promise<void> {
		try {
			await cancelFile(index);
			this.jobs = await getQueue();
		} catch (e) {
			alert(`Failed to cancel file!\n\n${e as string}`);
		}
	}

	async repeatFile(index: number): Promise<void> {
		try {
			await repeatFile(index);
			this.jobs = await getQueue();
		} catch (e) {
			alert(`Failed to repeat file!\n\n${e as string}`);
		}
	}

	async deleteFile(index: number): Promise<void> {
		try {
			await deleteFile(index);
			this.jobs = await getQueue();
		} catch (e) {
			alert(`Failed to delete file!\n\n${e as string}`);
		}
	}

	async suspendPrinter(hostname: string): Promise<void> {
		try {
			await suspendPrinter(hostname);
			this.printers = await getPrinters();
			if (this.printers.some(printer => printer.Hostname === hostname && printer.JobFile !== null)) {
				alert('This printer will be suspended as soon as the current print job has finished');
			}
		} catch (e) {
			alert(`Failed to suspend printer!\n\n${e as string}`);
		}
	}

	async resumePrinter(hostname: string): Promise<void> {
		try {
			await resumePrinter(hostname);
			this.printers = await getPrinters();
		} catch (e) {
			alert(`Failed to resume printer!\n\n${e as string}`);
		}
	}

	async deletePrinter(hostname: string): Promise<void> {
		try {
			await deletePrinter(hostname);
			this.printers = await getPrinters();
		} catch (e) {
			alert(`Failed to delete printer!\n\n${e as string}`);
		}
	}
}
</script>
