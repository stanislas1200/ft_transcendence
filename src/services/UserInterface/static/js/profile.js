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
            } else {
                alert('Error: ' + JSON.parse(xhr.responseText).error);
            }
        }
    };
    xhr.send();
}

// function loadHistoryFromUser(id) {
//     const userName = document.getElementById('userName');
//     // console.log('user found');
//     let url = "https://localhost:8001/game/hist?UserId={{UserId}}";
//     url = url.replace("localhost", window.location.hostname);
//     url = url.replace("{{UserId}}", id);
//     var xhr = new XMLHttpRequest();
//     xhr.open('GET', url, true);
//     xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
//     xhr.withCredentials = true;
//     xhr.onreadystatechange = function () {
//         // console.log(xhr.readyState);
//         if (xhr.readyState === 4) {
//             if (xhr.status === 200 || xhr.status === 201) {
//                 response = JSON.parse(xhr.responseText);
//                 // console.log(response);
//             } else {
//                 alert('Error: ' + JSON.parse(xhr.responseText).error);
//             }
//         }
//     };
//     xhr.send();
// }