<template>
	<div>
		<b-button :disabled="disabled" size="sm" variant="success" v-b-modal.modal-add-printer>
			<b-icon icon="plus"></b-icon> Add Printer
		</b-button>

		<b-modal id="modal-add-printer" title="Add Printer" :ok-disabled="!hostname" @ok="ok">
			<p>Please enter the hostname of the new printer:</p>
			<b-form-input v-model="hostname" placeholder="Hostname or IP address" autofocus @keyup.enter="ok"></b-form-input>
		</b-modal>
	</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { addPrinter } from '@/api/requests';

@Component
export default class AddPrinterButton extends Vue {
	@Prop({ default: false }) readonly disabled!: boolean;

	public hostname: string = "";

	async ok() {
		this.$bvModal.hide('modal-add-printer');
		try {
			await addPrinter(this.hostname);
			this.hostname = '';
		} catch (e) {
			alert(`Failed to add printer:\n\n${e as string}`);
		}
	}
}
</script>
