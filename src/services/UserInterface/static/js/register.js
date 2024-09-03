document.addEventListener('DOMContentLoaded', () => {
	const inputs = document.querySelectorAll('.input');
	const button = document.querySelector('.register-button');

	const handleFocus = ({ target }) => {
		const span = target.previousElementSibling;
		if (span) {
			span.classList.add('span-active');
		}
	}

	const handleFocusOut = ({ target }) => {
		if (target.value === '') {
			const span = target.previousElementSibling;
			if (span) {
				span.classList.remove('span-active');
			}
		}
	}

	const handleChange = () => {
		const [firstName, lastName, username, email, password, passwordConfirm] = inputs;
		const confirmSpan = document.getElementById('password-confirm-span');

		if (passwordConfirm.value && (password.value !== passwordConfirm.value)) {
			passwordConfirm.classList.add('error');
			confirmSpan.style.color = 'var(--accent)';
		} else {
			passwordConfirm.classList.remove('error');
			confirmSpan.style.transition = '200ms';
			confirmSpan.style.color = 'var(--secondary)';
			button.removeAttribute('disabled');
		}
		if (!(username.value && email.value && password.value && passwordConfirm.value && firstName.value && lastName.value)) {
			button.setAttribute('disabled', '');
		}
	};

	inputs.forEach((input) => {
		input.addEventListener('focus', handleFocus);
		input.addEventListener('blur', handleFocusOut);
		input.addEventListener('input', handleChange);
	});
});
