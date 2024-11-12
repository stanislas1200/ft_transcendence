// let button;
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
                response = JSON.parse(xhr.responseText);
                email.value = response.email;
                firstName.value = response.firstname;
                lastName.value = response.lastname;
                userName.value = response.username;
                loadProfilePicture(response.id);
                saveChangement(response.id);
            } else {
                alert('Error: ' + JSON.parse(xhr.responseText).error);
            }
        }
    };
    xhr.send();
    // button = document.getElementById('saveButton');
    // validateForm();
    inputsChangement();
    deleteProfile();
}

function deleteProfile() {
    const deleteButton = document.getElementById('deleteButton');

    const click = ({ target }) => {
        let pwd = document.getElementById('oldPassword').value;
        console.log(pwd);
        if (!pwd)
            return (alert('need your password'));
        let url = "https://localhost:8000/delete_user/";
        url = url.replace("localhost", window.location.hostname);
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        formData = new FormData();
        formData.append("current_password", pwd);
        // xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.withCredentials = true;
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 201) {
                    response = JSON.parse(xhr.responseText);
                    console.log(response);
                    testIfLoggedIn();
                } else {
                    alert('Error: ' + JSON.parse(xhr.responseText).error);
                }
            }
        };
        xhr.send(formData);
    }

    deleteButton.addEventListener('click', click);
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
        // document.getElementById('newPasswordError').textContent = "the password must contain at least one capital letter";
        check++;
    }
    if (!containsLowerCase(pwd)) {
        // document.getElementById('newPasswordError').textContent = "password must contain at least one lowercase letter";
        check++;
    }
    if (!containsNumber(pwd)) {
        // document.getElementById('newPasswordError').textContent = "password must contain at least one number";
        check++;
    }
    if (!containsSpecialCharacter(pwd)) {
        // console.log(containsSpecialCharacter(pwd));
        // document.getElementById('newPasswordError').textContent = "password must contain at least one special caracter";
        check++;
    }
    if (check != 0)
        return 1;
    return 0;
}

// function validateForm() {
function validateForm() {
    // console.log('button press');
    let valid = 1;

    const newFirstName = document.getElementById('firstName');
    const spanNewFirstName = document.getElementById('span-firstname');
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(newFirstName.value)) {
        console.log('firstname error');
        valid = 0;
        newFirstName.classList.add('error');
        spanNewFirstName.style.color = 'var(--accent)';
    } else {
        newFirstName.classList.remove('error');
        spanNewFirstName.style.color = 'var(--secondary)';
    }

    // Vérifier le nom (uniquement des lettres)
    const newLastName = document.getElementById('lastName');
    const spanNewLastName = document.getElementById('span-lastname');
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(newLastName.value)) {
        console.log('lastname error');
        valid = 0;
        newLastName.classList.add('error');
        spanNewLastName.style.color = 'var(--accent)';
    } else {
        newLastName.classList.remove('error');
        spanNewLastName.style.color = 'var(--secondary)';
    }

    const username = document.getElementById('username');
    const spanusername = document.getElementById('span-username');
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(username.value)) {
        console.log('lastname error');
        valid = 0;
        username.classList.add('error');
        spanusername.style.color = 'var(--accent)';
    } else {
        username.classList.remove('error');
        spanusername.style.color = 'var(--secondary)';
    }

    // Vérifier l'adresse e-mail
    const newEmail = document.getElementById('email');
    const spanNewEmail = document.getElementById('span-email');
    if (!/\S+@\S+\.\S+/.test(newEmail.value)) {
        console.log('email error');
        valid = 0;
        newEmail.classList.add('error');
        spanNewEmail.style.color = 'var(--accent)';
    } else {
        newEmail.classList.remove('error');
        spanNewEmail.style.color = 'var(--secondary)';
    }

    const currentPassword = document.getElementById('oldPassword');
    const spanCurrentPassword = document.getElementById('span-oldpwd');

    const newPassword = document.getElementById('newPassword');
    const spanNewPassword = document.getElementById('span-newpwd');
    var newPwd = 0;
    var oldPwd = 0;
    if (currentPassword.value == '' && newPassword.value != '') {
        oldPwd = 1;
        console.log('no password enter');
    } else if (currentPassword.value != '' && newPassword.value == '') {
        //
    } else if (currentPassword.value != '' && newPassword != '') {
        if (currentPassword.value === newPassword.value) {
            console.log('same pwd than before error');
            newPwd = 1;
        }
        if (checkPassword(newPassword.value) != 0) {
            console.log('new pwd error');
            newPwd = 1;
        }
    }
    if (newPwd == 1) {
        valid = 0;
        newPassword.classList.add('error');
        spanNewPassword.style.color = 'var(--accent)';
    } else {
        newPassword.classList.remove('error');
        spanNewPassword.style.color = 'var(--secondary)';
    }
    if (oldPwd == 1) {
        valid = 0;
        currentPassword.classList.add('error');
        spanCurrentPassword.style.color = 'var(--accent)';
    } else {
        currentPassword.classList.remove('error');
        spanCurrentPassword.style.color = 'var(--secondary)';
    }
    return valid;
}

function triggerFileInput() {
    document.getElementById('profilePic').click(); // Simule un clic sur l'input
}

function previewImage(event) {
    const reader = new FileReader();
    reader.onload = function () {
        const output = document.getElementById('profileImage');
        output.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
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

    inputs.forEach((input) => {
        input.addEventListener('focus', handleFocus);
        input.addEventListener('blur', handleFocusOut);
    });
}

function loadProfilePicture(id) {
    const profilePicture = document.getElementById('profileImage');
    if (!profilePicture)
        return;
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function saveChangement(id) {
    const saveButton = document.getElementById('saveButton');
    if (!saveButton)
        return;
    saveButton.addEventListener('click', function () {
        let verif = 1
        verif = validateForm();
        if (verif == 1) {
            const firstName = document.getElementById('firstName');
            const lastName = document.getElementById('lastName');
            const userName = document.getElementById('username');
            const email = document.getElementById('email');
            const profilePicture = document.getElementById('profilePic');
            const oldPwd = document.getElementById('oldPassword');
            const newPwd = document.getElementById('newPassword');

            if (!firstName || !lastName || !userName || !email)
                return;

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
            formData.append("current_password", oldPwd.value);
            formData.append("new_password", newPwd.value);
            console.log(formData);
            xhr.send(formData);
            saveButton.innerHTML = 'save with sucess!';
            saveButton.classList.add('sucess-saving');
            sleep(1000).then(() => {
                saveButton.innerHTML = 'save changement';
                saveButton.classList.remove('sucess-saving');
            });
        }
        else {
            console.log('error');
        }
    });
}