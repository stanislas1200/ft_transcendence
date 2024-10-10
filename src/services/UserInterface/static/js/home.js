// TO DO: pouvoir se connecter a une partie qui est en cour ou en attente

function loadHome() {
    let userId = getCookie('userId');
    loadHistoryForHomePage(userId);
    loadFriend(userId);
    loadAchivement(userId);
    loadGame();
    // loadTounament(userId);
}

function clickOnFriend() {
    const click = async ({ target }) => {
        let userName = target.innerHTML;
        userName = userName.substr(24, 5);
        let match = userName.match(/^(.*?)</);

        await loadPage('friendProfile', 1);
        searchUser(match[1]);
    }

    const inputs = document.querySelectorAll('#friendList');
    inputs.forEach((input) => {
        input.addEventListener('click', click);
    });
}

// function displayTournament(response) {
//     let tournamentList = document.getElementById('tournament-list');

//     if (!tournamentList)
//         return;

//     for (let i = 0; i < response.length; i++) {
//         if (response[i].status != 'finished') {
//             let newDiv = document.createElement('div');
//             newDiv.classList.add('list-element');
//             let newSpan = document.createElement('span');
//             newSpan.classList.add('list-span');
//             newSpan.innerHTML = response[i].name;
//             newDiv.append(newSpan);
//             let newButton = document.createElement('div');
//             newButton.classList.add('list-join-button');
//             if (response[i].status == 'waiting')
//                 newButton.innerHTML = 'Join ➞';
//             else
//                 newButton.innerHTML = 'Watch ➞';
//             newDiv.classList.add(response[i].id);
//             newDiv.append(newButton);
//             gameList.append(newDiv);
//         }
//     }
// }

// function loadTounament(userId) {
//     let url = "https://localhost:8001/game/get_tournament/{{UserId}}";
//     url = url.replace("localhost", window.location.hostname);
//     url = url.replace("{{UserId}}", userId);
//     var xhr = new XMLHttpRequest();
//     xhr.open('GET', url, true);
//     xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
//     xhr.withCredentials = true;
//     xhr.onreadystatechange = function () {
//         if (xhr.readyState === 4) {
//             if (xhr.status === 200 || xhr.status === 201) {
//                 response = JSON.parse(xhr.responseText);
//                 displayTournament(response);
//             } else {
//                 alert('Error: ' + JSON.parse(xhr.responseText).error);
//             }
//         }
//     };
//     xhr.send();
// }

function joinGameFromHome(gameId, gameStyle) {
    var xhr = new XMLHttpRequest();
    var url = "https://localhost:8001/game/join?gameId={{GameId}}&gameName={{gameStyle}}";
    url = url.replace("localhost", window.location.hostname);
    url = url.replace("{{GameId}}", gameId);
    url = url.replace("{{gameStyle}}", gameStyle);
    xhr.withCredentials = true;
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4)
            if (xhr.status === 200) {
                console.log('Game joined');
                var gameId = JSON.parse(xhr.responseText).game_id;
                console.log("game id :" + gameId);
                localStorage.setItem("gameId", gameId);
                loadPage('pong', 1)
            }
            else {
                console.log('Error joining game'); // TODO put a message
                console.log(xhr.responseText);
            }
    };
    xhr.send();
}

function clickOnGame() {
    const click = async ({ target }) => {
        if (target.classList[0] != 'list-element')
            target = target.parentElement;
        // console.log(target.childNodes[0].innerHTML);
        if (target.childNodes[0].innerHTML == 'pong') {
            if (target.classList[2] == 'watch') {
                localStorage.setItem("gameId", target.classList[1]);
                loadPage('pong', 1);
            }
            else
                joinGameFromHome(target.classList[1], 'pong');
        } else {
            if (target.classList[2] == 'watch') {
                localStorage.setItem("gameId", target.classList[1]);
                loadPage('tron', 1);
            }
            else
                joinGameFromHome(target.classList[1], 'tron');
        }
    }

    const inputs = document.querySelectorAll('#gameList');
    inputs.forEach((input) => {
        input.addEventListener('click', click);
    });
}

function displayGame(response) {
    let gameList = document.getElementById('game-list');

    if (!gameList)
        return;

    for (let i = 0; i < response.length; i++) {
        if (response[i].status != 'finished') {
            let newDiv = document.createElement('div');
            newDiv.classList.add('list-element');
            newDiv.classList.add(response[i].id);
            newDiv.id = 'gameList';
            let newSpan = document.createElement('span');
            newSpan.classList.add('list-span');
            newSpan.innerHTML = response[i].gameName;
            newDiv.append(newSpan);
            let newButton = document.createElement('div');
            newButton.classList.add('list-join-button');
            if (response[i].status == 'waiting') {
                newButton.innerHTML = 'Join ➞';
                newDiv.classList.add('join');
            }
            else {
                newButton.innerHTML = 'Watch ➞';
                newDiv.classList.add('watch');
            }
            newDiv.classList.add(response[i].id);
            newDiv.append(newButton);
            gameList.append(newDiv);
        }
    }
    clickOnGame();
}

function loadGame() {
    let url = "https://localhost:8001/game/party";
    url = url.replace("localhost", window.location.hostname);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.withCredentials = true;
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 201) {
                response = JSON.parse(xhr.responseText);
                displayGame(response);
            } else {
                alert('Error: ' + JSON.parse(xhr.responseText).error);
            }
        }
    };
    xhr.send();
}

function displayAchivement(response) {
    let achivementList = document.getElementById('achivement-list');

    if (!achivementList)
        return;

    if (response.unlocked.length == 0)
        console.log('no achivement unlock for the moment');
    else {
        for (let i = 0; i < response.unlocked.length; i++) {
            let newDiv = document.createElement('div');
            newDiv.classList.add('list-element');
            newDiv.classList.add('index-achievement');
            let newSpan = document.createElement('span');
            newSpan.classList.add('list-span');
            newSpan.innerHTML = response.unlocked[i].name;
            newDiv.append(newSpan);
            achivementList.append(newDiv);
        }
    }
}

function loadAchivement(userId) {
    let url = "https://localhost:8001/game/list_achievements?UserId={{UserId}}";
    url = url.replace("localhost", window.location.hostname);
    url = url.replace("{{UserId}}", userId);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.withCredentials = true;
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 201) {
                response = JSON.parse(xhr.responseText);
                displayAchivement(response);
            } else {
                alert('Error: ' + JSON.parse(xhr.responseText).error);
            }
        }
    };
    xhr.send();
}

function displayFriendList(response) {
    // console.log(response);
    let friendList = document.getElementById('friend-list-home-page');

    if (!friendList)
        return;

    if (response.friends.length == 0) {
        friendList.innerHTML = 'no friend 😢';
        console.log('no friend');
    } else {
        for (let i = 0; i < response.friends.length; i++) {
            let newDiv = document.createElement('div');
            newDiv.classList.add('list-element');
            newDiv.classList.add(response.friends[i].id);
            newDiv.id = 'friendList';
            // console.log(newDiv);
            let newSpan = document.createElement('span');
            newSpan.classList.add('list-span');
            newSpan.innerHTML = response.friends[i].username;
            if (response.friends[i].is_online)
                newSpan.innerHTML += '(online)';
            else
                newSpan.innerHTML += '(offline)';
            newDiv.append(newSpan);
            let newButton = document.createElement('div');
            newButton.classList.add('list-join-button');
            newButton.innerHTML = 'Send message ➞';
            newDiv.append(newButton);
            friendList.append(newDiv);
        }
    }
    clickOnFriend();
}

function loadFriend(userId) {
    let url = "https://localhost:8000/friends/{{UserId}}/";
    url = url.replace("localhost", window.location.hostname);
    url = url.replace("{{UserId}}", userId);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.withCredentials = true;
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 201) {
                response = JSON.parse(xhr.responseText);
                displayFriendList(response);
            } else {
                alert('Error: ' + JSON.parse(xhr.responseText).error);
            }
        }
    };
    xhr.send();
}

function clickOnbackToGame() {
    const click = async ({ target }) => {
        // let userName = target.innerHTML;
        // userName = userName.substr(24, 5);
        // let match = userName.match(/^(.*?)</);

        // await loadPage('friendProfile', 1);
        // searchUser(match[1]);
        // console.log(target.classList[2]);
        // localStorage.setItem("gameId", target.classList[2]);
        loadPage('pong', 1);
    }

    const inputs = document.querySelectorAll('#BackToGameButton');
    // console.log(inputs);
    inputs.forEach((input) => {
        input.addEventListener('click', click);
    });
}

function showLastGame(response) {
    let result = document.getElementById('status');
    let title = document.getElementById('index-title');
    let score = document.getElementById('index-final-score');
    let date = document.getElementById('index-date');

    if (response.length == 0)
        return (title.innerHTML += ' lets play!');
    var lastGame = response[response.length - 1];

    /******************************** Check element ********************************/
    if (!result || !title || !score || !date)
        return;

    /******************************** Win/Lose ********************************/
    let newStatus;
    if (lastGame.status == 'playing') {
        newStatus = document.createElement('div');
        newStatus.classList.add('index-button');
        newStatus.classList.add('backToGame');
        newStatus.classList.add(lastGame.id);
        newStatus.id = 'BackToGameButton';
        // console.log(newStatus.classList);
        newStatus.innerHTML = 'Go to game';
    } else {
        newStatus = document.createElement('span');
        if (lastGame.win == false)
            newStatus.dataset.status = 'lose';
        else if (lastGame.win == true)
            newStatus.dataset.status = 'win';
        else
            result.dataset.status = 'wi';
    }
    result.append(newStatus);

    /******************************** Game Name ********************************/
    title.innerHTML += " " + lastGame.gameName;

    /******************************** Date ********************************/
    date.innerHTML = lastGame.start_date.substr(0, 10);

    /******************************** Score ********************************/
    if (lastGame.status == 'playing')
        score.innerHTML = 'Game in progress';
    else
        score.innerHTML = lastGame.scores;
    clickOnbackToGame();
}

function loadHistoryForHomePage(id) {
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
                showLastGame(response);
            } else {
                alert('Error: ' + JSON.parse(xhr.responseText).error);
            }
        }
    };
    xhr.send();
}