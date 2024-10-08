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
		const [firstName, lastName, email, username, password, passwordConfirm] = inputs;
		const confirmSpan = document.getElementById('password-confirm-span');

		if (!(passwordConfirm.value && passwordConfirm.value)) {
			// passwordConfirm.classList.add('error');
			// confirmSpan.style.color = 'var(--accent)';
		} else {
			passwordConfirm.classList.remove('error');
			confirmSpan.style.color = 'var(--secondary)';
			button.removeAttribute('disabled');
		}
		if (email.value && validateEmail(email.value)) {
			email.classList.remove('error');
			document.getElementById('email-span').style.color = 'var(--secondary)';
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

	button.addEventListener("click", () => {
		// console.log("Bouton cliqué !");
		var firstNameInput = document.getElementById('firstName').value;
		var lastNameInput = document.getElementById('lastName').value;
		var usernameInput = document.getElementById('username').value;
		var emailInput = document.getElementById('email').value;
		var passwordInput = document.getElementById('password').value;
		var confirmPasswordInput = document.getElementById('confirmPassword').value;
		const emailSpan = document.getElementById('email-span');
		const confirmSpan = document.getElementById('password-confirm-span');
		const [firstName, lastName, email, username, password, passwordConfirm] = inputs;

		// debut verif des donnees
		if (!validateEmail(emailInput)) {
			email.classList.add('error');
			emailSpan.style.color = 'var(--accent)';
			// button.setAttribute('disabled', '');
			if (passwordInput !== confirmPasswordInput) {
				passwordConfirm.classList.add('error');
				confirmSpan.style.color = 'var(--accent)';
			}
			return;
		}
		if (passwordInput !== confirmPasswordInput) {
			passwordConfirm.classList.add('error');
			confirmSpan.style.color = 'var(--accent)';
			// button.setAttribute('disabled', '');
			return;
		}


		let url = "https://localhost:8000/register";
		url = url.replace("localhost", window.location.hostname);

		var xhr = new XMLHttpRequest();
		xhr.open('POST', url, true);
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				if (xhr.status === 200 || xhr.status === 201) {
					login(usernameInput, passwordInput);
					return;
				} else {
					alert('Error: ' + JSON.parse(xhr.responseText).error);
				}
			}
		};
		xhr.send('username=' + encodeURIComponent(usernameInput) + '&first_name=' + encodeURIComponent(firstNameInput)
			+ '&last_name=' + encodeURIComponent(lastNameInput) + '&email=' + encodeURIComponent(emailInput) + '&password=' + encodeURIComponent(passwordInput)
			+ '&c_password=' + encodeURIComponent(confirmPasswordInput));
	});

});

function validateEmail(email) {
	var re = /\S+@\S+\.\S+/;
	return re.test(email);
}

function errorButton(button) {
	const span = document.getElementById(button);
}

function login(username, password) {
	let url = "https://localhost:8000/login";
	url = url.replace("localhost", window.location.hostname);

	var xhr = new XMLHttpRequest();
	xhr.open('POST', url, true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.withCredentials = true;
	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4) {
			if (xhr.status === 200 || xhr.status === 201) {
				console.log('Login Success:', xhr.responseText);
				var response = JSON.parse(xhr.responseText);
				// console.log(response);
				// localStorage.setItem('token', response.token);
				// Here you can store the session ID or token if needed
				window.location.replace("/");
			} else {
				alert('Error: ' + JSON.parse(xhr.responseText).error);
			}
		}
	};
	xhr.send('username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password));
}