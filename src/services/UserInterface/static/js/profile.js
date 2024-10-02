function loadProfile() {
    console.log('loadprofile');
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

function displayRequest(response) {
    console.log(response);
    if (response.received_requests.length == 0)
        console.log('no request pending');
    else {
        const request = document.getElementById('request-recieve');
        for (let i = 0; i < response.received_requests.length; i++) {
            request.innerHTML += "<p>" + response.received_requests[i].sender + "<\/p>";
            request.innerHTML += "<i class=\"fa fa-check my-fa\"><\/i>";
            request.innerHTML += "<i class=\"fa fa-times my-fa\"><\/i>";
            request.innerHTML += "<i class=\"fa fa-ban my-fa\"><\/i>";
            // request.appendChild(newRequest);
        }
    }
}

function listRequest() {
    console.log('list request');
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
                // console.log(response);
                displayRequest(response);
            } else {
                alert('Error: ' + JSON.parse(xhr.responseText).error);
            }
        }
    };
    xhr.send();
}