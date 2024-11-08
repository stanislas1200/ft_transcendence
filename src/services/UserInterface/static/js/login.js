function loadLogin() {
    const inputs = document.querySelectorAll('.input');
    const button = document.querySelector('.login__button');
    const loginButton = document.getElementById("loginButton");
    const register = document.getElementById("register");

    register.addEventListener("click", () => {
        event.preventDefault();
        loadPage("register", 1);
    });

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
        const [username, password] = inputs;

        if (username.value && password.value) {
            button.removeAttribute('disabled');
        } else {
            button.setAttribute('disabled', '');
        }
    }

    inputs.forEach((input) => {
        input.addEventListener('focus', handleFocus);
        input.addEventListener('blur', handleFocusOut);
        input.addEventListener('input', handleChange);
    });

    loginButton.addEventListener("click", () => {
        console.log("Bouton cliqué !");
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;

        login(username, password);
    });

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
                    localStorage.setItem('token', response.token);
                    loadPage("index", 1);
                    connectToNotifications();
                    const navbar = document.getElementById("navbar")
                    navbar.style.display = 'block';
                } else {
                    alert('Error: ' + JSON.parse(xhr.responseText).error);
                }
            }
        };
        xhr.send('username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password));
    }
}