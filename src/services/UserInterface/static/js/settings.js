document.getElementById('updateInfo').addEventListener('click', function(event) {
	console.log("wesh on passe ici");
	event.preventDefault(); // Prevent the default form submission


	//Verif Of Email
	const email = document.getElementById('inputEmail').value;
	if (!validateEmail(email)) {
		addErrorSettings("Adresse e-mail invalide.");
		return ;
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


function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function addErrorSettings(errorMessage) {
    // Créer un nouvel élément div pour le conteneur d'erreur
    const errorContainer = document.createElement('div');
    errorContainer.className = 'col-12';

    // Créer la structure HTML de l'erreur
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';

    // Ajouter l'icône d'erreur
    const errorIcon = document.createElement('div');
    errorIcon.className = 'error__icon';
    errorIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24" height="24" fill="none">
            <path fill="#393a37" d="m13 13h-2v-6h2zm0 4h-2v-2h2zm-1-15c-1.3132 0-2.61358.25866-3.82683.7612-1.21326.50255-2.31565 1.23915-3.24424 2.16773-1.87536 1.87537-2.92893 4.41891-2.92893 7.07107 0 2.6522 1.05357 5.1957 2.92893 7.0711.92859.9286 2.03098 1.6651 3.24424 2.1677 1.21325.5025 2.51363.7612 3.82683.7612 2.6522 0 5.1957-1.0536 7.0711-2.9289 1.8753-1.8754 2.9289-4.4189 2.9289-7.0711 0-1.3132-.2587-2.61358-.7612-3.82683-.5026-1.21326-1.2391-2.31565-2.1677-3.24424-.9286-.92858-2.031-1.66518-3.2443-2.16773-1.2132-.50254-2.5136-.7612-3.8268-.7612z"></path>
        </svg>
    `;

    // Ajouter le titre de l'erreur (le message d'erreur)
    const errorTitle = document.createElement('div');
    errorTitle.className = 'error__title';
    errorTitle.textContent = errorMessage;

    // Ajouter le bouton de fermeture de l'erreur
    const errorClose = document.createElement('div');
    errorClose.className = 'error__close';
    errorClose.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 20 20" height="20">
            <path fill="#393a37" d="m15.8333 5.34166-1.175-1.175-4.6583 4.65834-4.65833-4.65834-1.175 1.175 4.65833 4.65834-4.65833 4.6583 1.175 1.175 4.65833-4.6583 4.6583 4.6583 1.175-1.175-4.6583-4.6583z"></path>
        </svg>
    `;

    // Assembler la structure de l'erreur
    errorDiv.appendChild(errorIcon);
    errorDiv.appendChild(errorTitle);
    errorDiv.appendChild(errorClose);

    // Ajouter l'erreur dans le conteneur principal
    errorContainer.appendChild(errorDiv);

    // Insérer le message d'erreur au-dessus des colonnes
    const rowElement = document.querySelector('.row');
    rowElement.insertBefore(errorContainer, document.getElementById('firstColSettings'));
}
