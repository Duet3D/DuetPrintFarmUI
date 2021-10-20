<template>
	<b-button :loading="isBusy" size="sm" variant="primary" @click="chooseFile">
		<b-icon icon="cloud-upload"></b-icon> Upload File
		<input ref="fileInput" type="file" accept=".g,.gcode,.gc,.gco,.nc,.ngc,.tap" hidden @change="fileSelected">
	</b-button>
</template>

<script>
'use strict'

import { addFile } from '../requests.js'

export default {
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
			if (e.target.files.length > 0) {
				try {
					console.log(e.target.files[0]);
					await addFile(e.target.files[0].name, e.target.files[0]);
				} catch (e) {
					alert('Upload failed!\n\n' + e.message);
				}
				e.target.value = '';
			}
		}
	}
}
</script>
