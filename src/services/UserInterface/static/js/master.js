testIfLoggedIn();


function logout() {
    let url = "https://localhost:8000/logout";
    url = url.replace("localhost", window.location.hostname);


    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.withCredentials = true;
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status == 200 ) {
                testIfLoggedIn()
            }
        }
    };
    xhr.send();
}

function setActive(element, pageName) {
    // Retirer la classe 'active' de tous les liens
    const links = document.querySelectorAll('ul li a');
    links.forEach(link => {
        link.classList.remove('active');
    });

    // Ajouter la classe 'active' au lien cliqué
    element.classList.add('active');

    // Charger la page correspondante
    loadPage(pageName);
}


function testIfLoggedIn() {
    let url = "https://localhost:8000/me";
    url = url.replace("localhost", window.location.hostname);


    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.withCredentials = true;
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status !== 200 && xhr.status !== 201) {
                window.location.replace("/login");
            }
            console.log(xhr.responseText);
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
                alert('Error: ' + JSON.parse(xhr.responseText).error);
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
        await loadPage('friendProfile');
        searchUser(target.innerHTML);
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