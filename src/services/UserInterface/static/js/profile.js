function loadProfile() {
    const userName = document.getElementById('userName');
    console.log('userName');
    var response;
    let url = "https://localhost:8000/me";
    url = url.replace("localhost", window.location.hostname);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.withCredentials = true;
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 201) {
                response = JSON.parse(xhr.responseText);
                userName.textContent = response.username;
                loadProfilePicture(response.id);
                searchUser();
            } else {
                alert('Error: ' + JSON.parse(xhr.responseText).error);
            }
        }
    };
    xhr.send();
}

function searchUser() {
    const searchButton = document.getElementById('searchButton');
    const searchValue = document.getElementById('searchValue');

    searchButton.addEventListener('click', function () {
        // console.log('clique');
        // console.log(searchValue.value);

        let url = "https://localhost:8001/game/search?page=1&query=sgodin&filter=user/game";
        url = url.replace("localhost", window.location.hostname);
        url = url.replace("sgodin", searchValue.value);
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.withCredentials = true;
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 201) {
                    response = JSON.parse(xhr.responseText);
                    if (response.users.length == 1) {
                        loadHistoryFromUser(response.users[0].id);
                    } else if (response.users.length > 0) {
                        let foundUser = response.users.find(users => users.username === searchValue.value);
                        if (foundUser)
                            loadHistoryFromUser(foundUser.id);
                    }
                } else {
                    alert('Error: ' + JSON.parse(xhr.responseText).error);
                }
            }
        };
        xhr.send();
    });
}

function loadHistoryFromUser(id) {
    console.log('user found');
    console.log(id);
    let url = "https://localhost:8001/game/hist?UserId={{UserId}}";
    url = url.replace("localhost", window.location.hostname);
    url = url.replace("{{UserId}}", id);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.withCredentials = true;
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 201) {
                response = JSON.parse(xhr.responseText);
                console.log(response);
            } else {
                alert('Error: ' + JSON.parse(xhr.responseText).error);
            }
        }
    };
    xhr.send();
}