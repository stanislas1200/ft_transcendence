function validateForm() {
    let valid = true;

    // Effacer les erreurs précédentes
    document.querySelectorAll('.error').forEach(el => el.style.display = 'none');

    // Vérifier le prénom (uniquement des lettres)
    const firstName = document.getElementById('firstName').value;
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(firstName)) {
        document.getElementById('firstNameError').textContent = "Le prénom ne doit contenir que des lettres.";
        document.getElementById('firstNameError').style.display = 'block';
        valid = false;
    }

    // Vérifier le nom (uniquement des lettres)
    const lastName = document.getElementById('lastName').value;
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(lastName)) {
        document.getElementById('lastNameError').textContent = "Le nom ne doit contenir que des lettres.";
        document.getElementById('lastNameError').style.display = 'block';
        valid = false;
    }

    // Vérifier l'adresse e-mail
    const email = document.getElementById('email').value;
    if (!/\S+@\S+\.\S+/.test(email)) {
        document.getElementById('emailError').textContent = "Veuillez entrer une adresse e-mail valide.";
        document.getElementById('emailError').style.display = 'block';
        valid = false;
    }

    // Vérifier le mot de passe (doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial)
    const password = document.getElementById('password').value;
    const passwordStrength = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordStrength.test(password)) {
        document.getElementById('passwordError').textContent = "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.";
        document.getElementById('passwordError').style.display = 'block';
        valid = false;
    }

    // Vérifier la confirmation du mot de passe
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (password !== confirmPassword) {
        document.getElementById('confirmPasswordError').textContent = "Les mots de passe ne correspondent pas.";
        document.getElementById('confirmPasswordError').style.display = 'block';
        valid = false;
    }

    return valid;
}

// Fonction pour prévisualiser l'image téléchargée
function previewImage(event) {
    const reader = new FileReader();
    reader.onload = function () {
        const output = document.getElementById('profileImage');
        output.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
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
