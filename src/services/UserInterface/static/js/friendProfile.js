function findGoodUser(usernameSearching, response) {
    for (let i = 0; i < response.users.length; i++) {
        if (response.users[i].username === usernameSearching) {
            return (i);
        }
    }
}

function searchUser(usernameSearching) {
    console.log('debut search user');
    if (usernameSearching != "") {
        const userNameFriend = document.getElementById('userNameFriend');
        let url = "https://localhost:8001/game/search?page=1&query=sgodin&filter=user/game";
        url = url.replace("localhost", window.location.hostname);
        url = url.replace("sgodin", usernameSearching);
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.withCredentials = true;
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 201) {
                    response = JSON.parse(xhr.responseText);
                    // console.log(response);
                    // console.log(response.users.length);
                    // if (response.users.length != 1) {
                    numUser = findGoodUser(usernameSearching, response);
                    // console.log(response.users[numUser]);
                    // console.log(userNameFriend);
                    var tmp = userNameFriend.textContent;
                    userNameFriend.innerHTML = response.users[numUser].username;
                    // console.log("innerHTML: " + userNameFriend.innerHTML);
                    userNameFriend.textContent = tmp.replace("test", response.users[numUser].username);
                    // console.log(userNameFriend.textContent);
                    // console.log(tmp);
                    // userNameFriend.textContent = tmp;
                    // userName.textContent = response.users[numUser].username;
                    // console.log(userName.textContent);
                    // console.log('fin search user');
                    loadProfilePicture(response.users[numUser].id);
                    loadHistoryFromUser(response.users[numUser].id);
                    // } else {
                    //     userName.textContent = response.users[0].username;
                    //     loadProfilePicture(response.users[0].id);
                    // }
                    // if (response.users.length == 1) {
                    //     load
                    //     loadHistoryFromUser(response.users[0].id);
                    // } else if (response.users.length > 0) {
                    //     let foundUser = response.users.find(users => users.username === searchValue.value);
                    //     if (foundUser)
                    //         loadHistoryFromUser(foundUser.id);
                    // }
                    // console.log(this.response);
                } else {
                    alert('Error: ' + JSON.parse(xhr.responseText).error);
                }
            }
        };
        xhr.send();
    }
}

function loadHistoryFromUser(id) {
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
                // console.log(response);
                displayHistorique(id, response);
            } else {
                alert('Error: ' + JSON.parse(xhr.responseText).error);
            }
        }
    };
    xhr.send();
}

function loadHistoryFromGame(id, gameId) {
    // console.log("userId: " + id + "gameId: " + gameId);
    let url = "https://localhost:8001/game/hist?UserId={{UserId}}&GameId={{gameId}}";
    url = url.replace("localhost", window.location.hostname);
    url = url.replace("{{UserId}}", id);
    url = url.replace("{{gameId}}", gameId);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.withCredentials = true;
    xhr.onreadystatechange = function () {
        // console.log(xhr.readyState);
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 201) {
                response = JSON.parse(xhr.responseText);
                // console.log(response);
            } else {
                alert('Error: ' + JSON.parse(xhr.responseText).error);
            }
        }
    };
    xhr.send();
}

function getStats(id) {
    let url = "https://localhost:8001/game/stats?UserId={{UserId}}";
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
                graphique(response);
                listRequest();
            } else {
                alert('Error: ' + JSON.parse(xhr.responseText).error);
            }
        }
    };
    xhr.send();
}

function friendRequest(id) {
    let url = "https://localhost:8000/send-request/";
    url = url.replace("localhost", window.location.hostname);
    url += id + '/';
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.withCredentials = true;
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 201) {
                response = JSON.parse(xhr.responseText);
                // console.log(response);
            } else {
                alert('Error: ' + JSON.parse(xhr.responseText).error);
            }
        }
    };
    xhr.send();
}

function displayHistorique(userId, response) {
    const historySpace = document.getElementById('history');
    if (response.length == 0) {
        // no historique for the moment
        historySpace.innerHTML = "<p class=\"game\">no history for the moment<\/p>";
    } else {

        let nbrWin = 0;
        let totalGauche = 0;
        let totalDroite = 0;
        for (let i = 0; i < response.length; i++) {
            let date = response[i].start_date.substr(0, 10);
            let tmp = "<p class=\"game\">";
            tmp += "<a class=\"id\" style=\"visibility: collapse;\">" + i + "<\/a>"
            if (response[i].status != 'playing') {
                if (response[i].win == true) {
                    tmp += "<a class=\"victory\" style=\"color: green;\">" + "Win" + "<\/a>"
                    nbrWin++;
                }
                else
                    tmp += "<a class=\"victory\" style=\"color: red;\">" + "Loose" + "<\/a>"
                tmp += "<a class=\"mode\">" + response[i].gameName + "<\/a>"
                tmp += "<a class=\"score\">" + response[i].scores + "<\/a>"
                tmp += "<a class=\"date\">" + date + "<\/a>"
                tmp += "<a class=\"status\">" + response[i].status + "<\/a>"
                tmp += "<\/p>";
                historySpace.innerHTML += tmp;
            }
        }
        getStats(userId);
    }
    const click = async ({ target }) => {
        // console.log(target);
        while (target.previousElementSibling) {
            target = target.previousElementSibling;
        }
        let gameId = target.innerHTML;
        if (!isNaN(gameId)) {
            // console.log(gameId);
            loadHistoryFromGame(userId, gameId);
        }
        else
            console.log('not a number');
        // console.log(target);
    }

    const inputs = document.querySelectorAll('.history');
    inputs.forEach((input) => {
        input.addEventListener('click', click);
    });
    const addFriend = document.getElementById('addFriend');
    const message = document.getElementById('message');
    const duel = document.getElementById('duel');

    if (addFriend) {
        addFriend.addEventListener('click', function () {
            friendRequest(userId);
        });
    }
    if (message) {
        message.addEventListener('click', function () {
            // console.log('message');
        });
    }
    if (duel) {
        duel.addEventListener('click', function () {
            // console.log('duel');
        });
    }
}
// retirer sur pas finish

function graphique(stats) {
    const percent = document.getElementById('percent');
    const text = document.getElementById('text');
    const totalScore = document.getElementById('totalScore');

    console.log(stats);
    let nbrGame = stats.pong.games_played;
    let nbrWin = stats.pong.games_won;
    let nbrLoose = stats.pong.games_lost;
    // console.log(nbrWin + "/" + nbrGame);
    // console.log(text);
    const winPercent = (nbrWin / nbrGame) * 100;
    let tmp = winPercent + ", 100";
    text.innerHTML = nbrWin + "w/" + nbrLoose + "l";
    percent.setAttribute('stroke-dasharray', tmp);
    totalScore.innerHTML += stats.pong.total_score;
    // console.log(percent);
}