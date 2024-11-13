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
                listRequest();
            } else {
                alert('Error: ' + JSON.parse(xhr.responseText).error);
            }
        }
    };
    xhr.send();
}

function answerdRequest(choice, userId) {
    let url = "https://localhost:8000/decline-request/userId/";
    var response;
    url = url.replace("localhost", window.location.hostname);
    if (choice == 'accept')
        url = url.replace("decline", choice);
    else if (choice == 'Block user')
        url = url.replace("decline-request", "block_user");
    else if (choice == 'Unblock user')
        url = url.replace("decline-request", "unblock_user");
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
                notifications(JSON.parse(xhr.responseText).error);
            }
        }
    };
    xhr.send();
}

function displayRequest(response) {
    if (response.sent_requests.length) {
        const profileName = document.getElementById('userNameFriend');
        if (profileName && profileName.innerHTML == response.sent_requests[0].receiver) {
            const addFriend = document.getElementById('addFriend');
            if (addFriend) {
                addFriend.innerHTML = 'Request pending';
                addFriend.classList.add('disabled');
            }
        }
    }

    if (response.received_requests.length == 0)
        console.log('no request pending');
    else {
        const requestRecieve = document.getElementById('request-recieve');
        if (!requestRecieve)
            return;

        requestRecieve.innerHTML = "";

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
            // button.innerHTML += "<button class=\"fa fa-ban my-fa\" value=\"" + userId + "\"><\/button>";
            newRequest.appendChild(button);
            requestRecieve.appendChild(newRequest);
        }
        const click = async ({ target }) => {
            if (target.classList[1] == 'fa-times')
                answerdRequest('decline', target.value);
            // if (target.classList[1] == 'fa-ban')
            //     answerdRequest('block', target.value);
            if (target.classList[1] == 'fa-check')
                answerdRequest('accept', target.value);

            target.parentElement.parentElement.remove();
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