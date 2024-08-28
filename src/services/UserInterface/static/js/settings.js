function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function addErrorSettings(errorMessage) {
    const firstCol = document.getElementById('firstColSettings');

    const newCol = document.createElement('div');
    newCol.className = 'col-xl-12'
}

document.getElementById('updateInfo').addEventListener('submit', function(event) {
	event.preventDefault(); // Prevent the default form submission

    //Verif Of Email
    const email = document.getElementById('inputEmail').value;
    if (validateEmail(email)) {
        console.log("Adresse e-mail valide.");
    } else {
        console.log("Adresse e-mail invalide.");
    }

	const formData = new FormData();
	const userId = getCookie('userId');
	// Append form data
	formData.append('username', document.getElementById('inputUsername').value);
	formData.append('email', document.getElementById('inputEmail').value);
    formData.append('current_password', document.getElementById('inputOldPass').value);
    formData.append('new_password', document.getElementById('inputNewPass').value);
	// formData.append('avatar', document.getElementById('avatar').files[0]);

	// Create a new XMLHttpRequest
	const xhr = new XMLHttpRequest();
	xhr.open('POST', `https://localhost:8000/users/${userId}/edit`, true);

	xhr.onload = function() {
		if (xhr.status === 200) {
			console.log('Success:', xhr.responseText);
		} else {
			console.error('Error:', xhr.statusText);
		}
	};

	xhr.onerror = function() {
		console.error('Request Error');
	};

	// Send the FormData
	xhr.send(formData);
});