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
                    numUser = findGoodUser(usernameSearching, response);
                    var tmp = userNameFriend.textContent;
                    userNameFriend.innerHTML = response.users[numUser].username;
                    // userNameFriend.textContent = tmp.replace("test", response.users[numUser].username);
                    loadProfilePicture(response.users[numUser].id);
                    loadHistoryFromUser(response.users[numUser].id);
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
                displayHistorique(id, response);
            } else {
                alert('Error: ' + JSON.parse(xhr.responseText).error);
            }
        }
    };
    xhr.send();
}

function displayHistoryFromOneGame(response) {
    const player1 = document.getElementById('player1');
    const player2 = document.getElementById('player2');
    const score = document.getElementById('score');
    const gameMode = document.getElementById('gameModeHistory');
    const namePlayer = document.getElementById('nameOfPlayer');

    for (var i = 1; i < response.length; i++) {
        const newElement = document.createElement('p');
        newElement.innerHTML = response[i].name;
        newElement.classList.add('nameOfOnePlayer');
        namePlayer.append(newElement);
    }
    gameMode.innerHTML = "Game mode: " + response[0];


    // console.log(player1);
    loadPicture(response[1].id, player1);
    player1.classList.remove('player');
    player1.classList.add('noPadding');
    loadPicture(response[2].id, player2);
    player2.classList.remove('player');
    player2.classList.add('noPadding');

    // console.log(score.innerHTML);
    score.innerHTML = response[1].score + " : " + response[2].score;
}

function loadHistoryFromGame(id, gameId) {
    let url = "https://localhost:8001/game/hist?UserId={{UserId}}&GameId={{gameId}}";
    url = url.replace("localhost", window.location.hostname);
    url = url.replace("{{UserId}}", id);
    url = url.replace("{{gameId}}", gameId);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.withCredentials = true;
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 201) {
                response = JSON.parse(xhr.responseText);
                console.log(response);
                displayHistoryFromOneGame(response);
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
        historySpace.innerHTML = "<p class=\"game\">no history for the moment<\/p>";
    } else {
        let nbrWin = 0;
        let totalGauche = 0;
        let totalDroite = 0;
        for (let i = 0; i < response.length; i++) {
            let date = response[i].start_date.substr(0, 10);
            let tmp = "<p class=\"game\">";
            tmp += "<a class=\"id\" style=\"visibility: collapse;\">" + response[i].id + "<\/a>"
            if (response[i].status == 'finished') {
                if (response[i].win == true) {
                    tmp += "<a class=\"victory\" style=\"color: green;\">" + "Win" + "<\/a>"
                    nbrWin++;
                }
                else
                    tmp += "<a class=\"victory\" style=\"color: red;\">" + "Loose" + "<\/a>"
                tmp += "<a class=\"mode\">" + response[i].gameName + "<\/a>"
                tmp += "<a class=\"score\">" + response[i].scores + "<\/a>"
                tmp += "<a class=\"dateHistory\">" + date + "<\/a>"
                tmp += "<a class=\"status\">" + response[i].status + "<\/a>"
                tmp += "<\/p>";
                historySpace.innerHTML += tmp;
            }
        }
        getStats(userId);
    }
    const click = async ({ target }) => {
        while (target.previousElementSibling) {
            target = target.previousElementSibling;
        }
        let gameId = target.innerHTML;
        if (!isNaN(gameId)) {
            loadHistoryFromGame(userId, gameId);
        }
        else
            console.log('not a number');
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
            console.log('message');
        });
    }
    if (duel) {
        duel.addEventListener('click', function () {
            console.log('duel');
        });
    }
}
// retirer sur pas finish

function graphique(stats) {
    const percent = document.getElementById('percent');
    const text = document.getElementById('text');
    const totalScore = document.getElementById('totalScore');

    let nbrGame = stats.pong.games_played;
    let nbrWin = stats.pong.games_won;
    let nbrLoose = stats.pong.games_lost;
    const winPercent = (nbrWin / nbrGame) * 100;
    let tmp = winPercent + ", 100";
    if (nbrWin > 10 || nbrLoose > 10) {
        text.classList.add("smaller");
        if (nbrWin > 10 && nbrLoose > 10)
            text.classList.add("realySmall");
    }
    text.innerHTML = nbrWin + "w/" + nbrLoose + "l";
    percent.setAttribute('stroke-dasharray', tmp);
    totalScore.innerHTML += stats.pong.total_score;
    // console.log(percent);
}