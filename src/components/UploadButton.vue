<template>
	<b-button :disabled="disabled" :loading="isBusy" size="sm" variant="primary" @click="chooseFile">
		<b-icon icon="cloud-upload"></b-icon> Upload File
		<input ref="fileInput" type="file" accept=".g,.gcode,.gc,.gco,.nc,.ngc,.tap" hidden multiple @change="fileSelected">
	</b-button>
</template>

<script>
'use strict'

import { addFile } from '../api/requests.ts'

export default {
	props: {
		disabled: {
			default: false,
			type: Boolean
		}
	},
	data() {
		return {
			isBusy: false
		}
	},
	methods: {
		chooseFile() {
			if (!this.isBusy) {
				this.$refs.fileInput.click();
			}
		},
		async fileSelected(e) {
			this.isBusy = true;
			try {
				for (let i = 0; i < e.target.files.length; i++) {
					await addFile(e.target.files[i].name, e.target.files[i]);
				}
			} catch (e) {
				alert('Upload failed!\n\n' + e.message);
			}
			e.target.value = '';
			this.isBusy = false;
		}
	}
}
</script>
