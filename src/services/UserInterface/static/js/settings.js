let button;
// let pp;

function loadSettings() {
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const userName = document.getElementById('username');
    const email = document.getElementById('email');
    var response; let url = "https://localhost:8000/me";
    url = url.replace("localhost", window.location.hostname); var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.withCredentials = true;
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 201) {
                // console.log('Login Success:', xhr.responseText);
                response = JSON.parse(xhr.responseText);
                // localStorage.setItem('token', response.token);
                // Here you can store the session ID or token if needed
                // window.location.replace("/home");
            } else {
                alert('Error: ' + JSON.parse(xhr.responseText).error);
            }
        }
        email.value = response.email;
        firstName.value = response.firstname;
        lastName.value = response.lastname;
        userName.value = response.username;
        loadProfilePicture(response.id);
        saveChangement(response.id);
    };
    xhr.send();
    button = document.getElementById('saveButton');
    // pp = document.getElementById('profilePicture');
    validateForm();
    inputsChangement();
}

function containsUpperCase(pwd) {
    return /[A-Z]/.test(pwd);  // A-Z pour les majuscules
}

function containsLowerCase(pwd) {
    return /[a-z]/.test(pwd);  // a-z pour les minuscules
}

function containsSpecialCharacter(pwd) {
    return /[!@#$%^&*(),.?":{}|<>]/.test(pwd);  // Caractères spéciaux communs
}

function containsNumber(pwd) {
    return /\d/.test(pwd);  // \d correspond à un chiffre (0-9)
}

function checkPassword(pwd) {
    let check = 0;

    if (!containsUpperCase(pwd)) {
        document.getElementById('newPasswordError').textContent = "the password must contain at least one capital letter";
        check++;
    }
    if (!containsLowerCase(pwd)) {
        document.getElementById('newPasswordError').textContent = "password must contain at least one lowercase letter";
        check++;
    }
    if (!containsNumber(pwd)) {
        document.getElementById('newPasswordError').textContent = "password must contain at least one number";
        check++;
    }
    if (!containsSpecialCharacter(pwd)) {
        console.log(containsSpecialCharacter(pwd));
        document.getElementById('newPasswordError').textContent = "password must contain at least one special caracter";
        check++;
    }
    if (check != 0)
        return 1;
    return 0;
}

// function validateForm() {
function validateForm() {
    button.addEventListener("click", () => {
        console.log('button press');
        // console.log('button press');
        let valid = true;

        // Effacer les erreurs précédentes
        document.querySelectorAll('.error').forEach(el => el.style.display = 'none');

        // Vérifier le prénom (uniquement des lettres)
        const newFirstName = document.getElementById('firstName').value;
        if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(newFirstName)) {
            document.getElementById('firstNameError').textContent = "Le prénom ne doit contenir que des lettres.";
            document.getElementById('firstNameError').style.display = 'block';
            valid = false;
        }

        // Vérifier le nom (uniquement des lettres)
        const newLastName = document.getElementById('lastName').value;
        if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(newLastName)) {
            document.getElementById('lastNameError').textContent = "Le nom ne doit contenir que des lettres.";
            document.getElementById('lastNameError').style.display = 'block';
            valid = false;
        }

        // Vérifier l'adresse e-mail
        const newEmail = document.getElementById('email').value;
        if (!/\S+@\S+\.\S+/.test(newEmail)) {
            document.getElementById('emailError').textContent = "Veuillez entrer une adresse e-mail valide.";
            document.getElementById('emailError').style.display = 'block';
            valid = false;
        }

        const currentPassword = document.getElementById('oldPassword').value;

        const newPassword = document.getElementById('newPassword').value;
        if (currentPassword === newPassword) {
            document.getElementById('newPasswordError').textContent = "password must be different from the current!";
            valid = false;
        }
        else if (checkPassword(newPassword) != 0) {
            valid = false;
        }
        document.getElementById('newPasswordError').style.display = 'block';
        if (valid == true) {
            // ajouter ici l'envoie pour le back!!
        }
        // return valid;
    });
}

function triggerFileInput() {
    console.log('click');
    document.getElementById('profilePic').click(); // Simule un clic sur l'input
}

function previewImage(event) {
    // pp.addEventListener("click", () => {
    const reader = new FileReader();
    reader.onload = function () {
        const output = document.getElementById('profileImage');
        output.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
    // });
}

function inputsChangement() {
    const inputs = document.querySelectorAll('.input');

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

    // const handleChange = () => {
    //     const [username, password] = inputs;

    //     if (username.value && password.value) {
    //         button.removeAttribute('disabled');
    //     } else {
    //         button.setAttribute('disabled', '');
    //     }
    // }

    inputs.forEach((input) => {
        input.addEventListener('focus', handleFocus);
        input.addEventListener('blur', handleFocusOut);
        // input.addEventListener('input', handleChange);
    });
}

function loadProfilePicture(id) {
    const profilePicture = document.getElementById('profileImage');
    var response;
    let url = "https://localhost:8000/users/<int:user_id>/avatar";
    url = url.replace("localhost", window.location.hostname); var xhr = new XMLHttpRequest();
    url = url.replace("<int:user_id>", id);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.withCredentials = true;
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 3) {
            if (xhr.status === 200 || xhr.status === 201) {
                response = xhr.responseText;
            } else {
                alert('Error: ' + JSON.parse(xhr.responseText).error);
            }
        }
        var newProfilePicture = url.replace("/users/<int:user_id>/avatar".replace("<int:user_id>", id), response);
        profilePicture.src = newProfilePicture;
    };
    xhr.send();
}

function saveChangement(id) {
    const saveButton = document.getElementById('saveButton');
    saveButton.addEventListener('click', function () {
        const firstName = document.getElementById('firstName');
        const lastName = document.getElementById('lastName');
        const userName = document.getElementById('username');
        const email = document.getElementById('email');
        const profilePicture = document.getElementById('profilePic');
        let url = "https://localhost:8000/users/<int:user_id>/edit";
        url = url.replace("localhost", window.location.hostname); var xhr = new XMLHttpRequest();
        url = url.replace("<int:user_id>", id);
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url, false);
        xhr.withCredentials = true;
        formData = new FormData();
        console.log(profilePicture);
        formData.append("avatar", profilePicture.files[0]);
        formData.append("username", userName.value);
        formData.append("email", email.value);
        formData.append("first_name", firstName.value);
        formData.append("last_name", lastName.value);
        console.log(formData);
        xhr.send(formData);
    });
}