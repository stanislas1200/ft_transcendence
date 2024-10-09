function loadProfile() {
    const userName = document.getElementById('userName');
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
                userName.innerHTML = response.username;
                loadProfilePicture(response.id);
                loadHistoryFromUser(response.id);
            } else {
                alert('Error: ' + JSON.parse(xhr.responseText).error);
            }
        }
    };
    xhr.send();
}

function answerdRequest(choice, userId) {
    let url = "https://localhost:8000/decline-request/userId/";
    url = url.replace("localhost", window.location.hostname);
    if (choice == 'accept')
        url = url.replace("decline", choice);
    else if (choice == 'block')
        url = url.replace("decline-request", "block_user");
    url = url.replace("userId", userId);
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.withCredentials = true;
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 201) {
                response = JSON.parse(xhr.responseText);
            } else {
                alert('Error: ' + JSON.parse(xhr.responseText).error);
            }
        }
    };
    xhr.send();
}

function displayRequest(response) {
    // console.log(response);
    if (response.received_requests.length == 0)
        console.log('no request pending');
    else {
        const requestRecieve = document.getElementById('request-recieve');
        if (!requestRecieve)
            return;

        for (let i = 0; i < response.received_requests.length; i++) {
            const newRequest = document.createElement('div');
            newRequest.classList.add('friend-request');
            const name = document.createElement('p');
            name.classList.add('friendRequestName');
            name.innerHTML = response.received_requests[i].sender;
            newRequest.appendChild(name);
            const button = document.createElement('div');
            button.classList.add('friendRequestButton');
            const userId = response.received_requests[i].id;
            // console.log(userId);
            button.innerHTML += "<button class=\"fa fa-check my-fa\" value=\"" + userId + "\"><\/button>";
            button.innerHTML += "<button class=\"fa fa-times my-fa\" value=\"" + userId + "\"><\/button>";
            button.innerHTML += "<button class=\"fa fa-ban my-fa\" value=\"" + userId + "\"><\/button>";
            newRequest.appendChild(button);
            requestRecieve.appendChild(newRequest);
        }
        const click = async ({ target }) => {
            if (target.classList[1] == 'fa-times')
                answerdRequest('decline', target.value);
            if (target.classList[1] == 'fa-ban')
                answerdRequest('block', target.value);
            if (target.classList[1] == 'fa-check')
                answerdRequest('accept', target.value);
        }

        const inputs = document.querySelectorAll('.my-fa');
        inputs.forEach((input) => {
            input.addEventListener('click', click);
        });
    }
}

function listRequest() {
    let url = "https://localhost:8000/list_request/";
    url = url.replace("localhost", window.location.hostname);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.withCredentials = true;
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 201) {
                response = JSON.parse(xhr.responseText);
                displayRequest(response);
            } else {
                alert('Error: ' + JSON.parse(xhr.responseText).error);
            }
        }
    };
    xhr.send();
}