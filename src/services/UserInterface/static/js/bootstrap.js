document.addEventListener('DOMContentLoaded', () => {
	const alertPlaceholder = document.getElementById('liveAlertPlaceholder')
	if (!alertPlaceholder)
		return;
	const appendAlert = (message, type) => {
		const wrapper = document.createElement('div')
		wrapper.innerHTML = [
			`<div class="alert alert-${type} alert-dismissible" role="alert">`,
			`   <div>${message}</div>`,
			'   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
			'</div>'
		].join('')

		alertPlaceholder.append(wrapper)
	}

	const alertTrigger = document.getElementById('liveAlertBtn')
	if (!alertTrigger)
		return;
	if (alertTrigger) {
		alertTrigger.addEventListener('click', () => {
			appendAlert('Nice, you found me!', 'success')
		})
	}
}, { once: true });