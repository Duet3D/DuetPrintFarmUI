<template>
	<div>
		<b-button :disabled="disabled" size="sm" variant="success" v-b-modal.modal-add-printer>
			<b-icon icon="plus"></b-icon> Add Printer
		</b-button>

		<b-modal id="modal-add-printer" title="Add Printer" :ok-disabled="hostname == ''" @ok="ok">
			<p>Please enter the hostname of the new printer:</p>
			<b-form-input v-model="hostname" placeholder="Hostname or IP address" autofocus @keyup.enter="ok"></b-form-input>
		</b-modal>
	</div>
</template>

<script>
'use strict'

import { addPrinter } from '../api/requests.ts'

export default {
	props: {
		disabled: {
			default: false,
			type: Boolean
		}
	},
	data() {
		return {
			hostname: ''
		}
	},
	methods: {
		async ok() {
			this.$bvModal.hide('modal-add-printer');
			try {
				await addPrinter(this.hostname);
				this.hostname = '';
			} catch (e) {
				alert(`Failed to add printer:\n\n${e.message}`);
			}
		}
	}
}
</script>
