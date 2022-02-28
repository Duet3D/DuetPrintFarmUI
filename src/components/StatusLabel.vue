<template>
	<b-badge :variant="statusVariant">
		{{ statusText }}
	</b-badge>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class StatusLabel extends Vue {
	@Prop({ required: true, type: String }) readonly status!: string;

	get statusText() {
		let type = this.status;
		if (!this.status) {
			type = 'unknown';
		} else if (this.status === 'processing') {
			type = 'printing';
		}
		return type[0].toUpperCase() + type.substring(1);
	}

	get statusVariant() {
		switch (this.status) {
			case 'disconnected': return 'danger';
			case 'starting': return 'info';
			case 'updating': return 'primary';
			case 'off': return 'danger';
			case 'halted': return 'danger';
			case 'pausing': return 'warning';
			case 'paused': return 'warning';
			case 'resuming': return 'secondary';
			case 'processing': return 'success';
			case 'simulating': return 'success';
			case 'busy': return 'warning';
			case 'changingTool': return 'primary';
			case 'idle': return 'info';
			default: return 'dark';
		}
	}
}
</script>

