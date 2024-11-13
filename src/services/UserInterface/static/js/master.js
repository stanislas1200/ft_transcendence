let wss;

function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}

function removeAlertAfterTimeout(alertElement, timeout = 5000) {
    setTimeout(() => {
        alertElement.classList.remove('show');
        alertElement.classList.add('fade');
        setTimeout(() => {
            alertElement.remove();
        }, 1000);
    }, timeout);
}
function notifications(Title) {
    let alertHtml = `
    <strong>${Title}</strong>
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
    <span aria-hidden="true">&times;</span>
    </button>
    `;

    let newNotif = document.createElement('div');
    newNotif.classList.add('alert', `alert-succes`, 'alert-dismissible', 'fade', 'show');
    newNotif.innerHTML = alertHtml;
    document.getElementById('alert-container').appendChild(newNotif);
    removeAlertAfterTimeout(newNotif)
}

function disconnectFromNotifications() {
    if (wss) {
        wss.close();
        wss = null;
        console.log('Disconnected from notifications system.');
    }
}
function connectToNotifications() {
    testIfLoggedIn(function (isLoggedIn) {
        if (isLoggedIn === 0) {
            let userId = getCookie('userId');
            if (!userId) {
                return;
            }
            if (window.location.pathname.includes('/login') || window.location.pathname.includes('/register')) {
                return;
            }
            let wsUrl = `wss://localhost:8001/ws/notifications/${userId}`;
            wsUrl = wsUrl.replace('localhost', window.location.hostname);

            wss = new WebSocket(wsUrl);

            wss.addEventListener('open', function (event) {
                console.log('Connected to notifications system.')
            });

            wss.addEventListener('message', function (event) {
                let serverMessage = JSON.parse(event.data);
                if (!(serverMessage && serverMessage.data && serverMessage.data.content))
                    return
                let content = serverMessage.data.content;
                notifications(content);
                if (serverMessage.type === 'friend_request' && window.location.pathname === '/profile/') {
                    listRequest();
                }

            });

            wss.addEventListener('close', function (event) {
                connectToNotifications()
                // console.log('Close: ', event);
            });

            wss.addEventListener('error', function (event) {
                // console.log('Error: ', event);
            });
        }
    });
}

// connectToNotifications()

function logout() {
    event.preventDefault();
    let url = "https://localhost:8000/logout";
    url = url.replace("localhost", window.location.hostname);


    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.withCredentials = true;
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status == 200) {
                testIfLoggedIn()
            }
        }
    };
    xhr.send();
}

async function setActive(element, pageName) {
    // disable the chat button
    event.preventDefault();
    document.getElementById('chatButtonMaster').removeAttribute('href');
    console.log('test setActive : ', isActive);
    if (isActive == true)
        return;
    isActive = true;
    // Retirer la classe 'active' de tous les liens
    event.preventDefault(); // Prevent the form from submitting the traditional way
    const links = document.querySelectorAll('ul li a');
    links.forEach(link => {
        link.classList.remove('active');
    });

    // Ajouter la classe 'active' au lien cliqué
    element.classList.add('active');

    // Charger la page correspondante
    console.log('first setActive :', isActive);
    await loadPage(pageName, 1);
    document.getElementById('chatButtonMaster').setAttribute('href', '#' + pageName);
    console.log('setActive :', isActive);
}

async function testIfLoggedIn(callback) {
    if (window.location.pathname === '/login/' || window.location.pathname === '/register/') {
        const navbar = document.getElementById("navbar");
        if (navbar)
            navbar.style.display = 'none';
        return;
    }
    let url = "https://localhost:8000/me";
    url = url.replace("localhost", window.location.hostname);


    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.withCredentials = true;
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status !== 200 && xhr.status !== 201) {
                disconnectFromNotifications();
                loadPage("login", 1);
                const navbar = document.getElementById("navbar");
                if (navbar)
                navbar.style.display = 'none';
                if (callback) callback(1);
            }
            else
                if (callback) callback(0);
            // console.log(xhr.responseText);
        }
    };
    xhr.send();
}


function searchFriend() {
    const searchFriend = document.getElementById('searchValue');
    const proposition = document.getElementById('proposition');

    // Écouter l'événement "input"
    // proposition.classList.add('hide');
    searchFriend.addEventListener('input', function (event) {
        if (event.target.value) {
            searchAllUser(event.target.value, proposition);
            // proposition.classList.remove('hide');
        } else if (event.target.value === "") {
            proposition.innerHTML = "";
            // proposition.classList.add('hide');
        }
    });
    // backAndForward();
}

function searchAllUser(searchName, proposition) {
    let url = "https://localhost:8001/game/search?page=1&query=sgodin&filter=user/game";
    url = url.replace("localhost", window.location.hostname);
    url = url.replace("sgodin", searchName);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.withCredentials = true;
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 201) {
                response = JSON.parse(xhr.responseText);
                printAllResponse(response, proposition);
                findFriend();
            } else {
                // alert('Error: ' + JSON.parse(xhr.responseText).error);
            }
        }
    };
    xhr.send();
}


function printAllResponse(response, proposition) {
    proposition.innerHTML = "";
    for (let i = 0; i < response.users.length; i++) {
        var newSearchItem = document.createElement('div');
        newSearchItem.classList.add('proposition-item');
        newSearchItem.innerHTML = response.users[i].username;
        proposition.appendChild(newSearchItem);
        // var newLi = document.createElement('li');
        // newLi.innerHTML = response.users[i].username;
        // newLi.classList.add('selection');
        // proposition.appendChild(newLi);
    }
}


function findFriend() {
    const inputs = document.querySelectorAll('.proposition-item');

    const click = async ({ target }) => {
        await loadPage('profile', 1, target.innerHTML);
        // searchUser(target.innerHTML);
        const searchFriend = document.getElementById('searchValue');
        const proposition = document.getElementById('proposition');
        searchFriend.value = "";
        // proposition.classList.add('hide');
        proposition.innerHTML = "";
    }

    inputs.forEach((input) => {
        input.addEventListener('click', click);
    });
}