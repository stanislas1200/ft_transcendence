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
        const userNameFriend = document.getElementById('userName');
        if (!usernameSearching)
            return;
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
                    const friendButtons = document.getElementById('buttonFriendMessage');
                    const ownId = getCookie('userId');
                    if (friendButtons && ownId != response.users[numUser].id) {
                        friendButtons.style.display = 'block';
                    }
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
    let response;
    let url = "https://localhost:8001/game/hist?UserId={{UserId}}";
    url = url.replace("localhost", window.location.hostname);
    url = url.replace("{{UserId}}", id);
    console.log(url);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.withCredentials = true;
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 201) {
                response = JSON.parse(xhr.responseText);
                console.log(response);
                displayMetrics(response);
                displayHistorique(id, response);
            } else {
                alert('Error: ' + JSON.parse(xhr.responseText).error);
            }
        }
    };
    xhr.send();
}

function formatDateTime(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function displayHistoryFromOneGame(response) {
    const partyDetails = document.querySelector('.party-details');
    const partyState = partyDetails.querySelector('.party-state');
    const playerCardsContainer = partyDetails.querySelector('.player-cards');

    if (!partyDetails || !partyState || !playerCardsContainer)
        return;

    partyState.style.display = 'none';

    playerCardsContainer.innerHTML = '';

    const gameMode = partyState.querySelector('p:nth-child(1)');
    const status = partyState.querySelector('p:nth-child(2)');
    const startDate = partyState.querySelector('p:nth-child(3)');
    const endTime = partyState.querySelector('p:nth-child(4)');

    gameMode.innerHTML = `<strong>Game: </strong> ${response[0]}`;
    status.innerHTML = `<strong>Status:</strong> TODO`;
    startDate.innerHTML = `<strong>Start Date:</strong> ${formatDateTime(response[1])}`;
    endTime.innerHTML = `<strong>End Time:</strong> ${formatDateTime(response[2])}`;

    const players = response.slice(3);
    players.forEach(player => {
        const playerCard = document.createElement('div');
        playerCard.classList.add('player-card');

        const playerImg = document.createElement('img');
        loadPicture(player.id, playerImg);
        playerImg.alt = `${player.name} Avatar`;
        playerCard.appendChild(playerImg);

        const playerName = document.createElement('p');
        playerName.style.fontWeight = 'bold';
        playerName.textContent = player.name;
        playerCard.appendChild(playerName);

        const playerScore = document.createElement('p');
        playerScore.textContent = `Score: ${player.score}`;
        playerCard.appendChild(playerScore);

        playerCard.addEventListener('click', async () => {
            await loadPage('profile', 1, player.name);
            // searchUser(player.name);
        });
        playerCardsContainer.appendChild(playerCard);

    });

    partyState.style.display = 'flex';
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
                // console.log(response);
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
                displayStats(response);
                listRequest();
            } else {
                alert('Error: ' + JSON.parse(xhr.responseText).error);
            }
        }
    };
    xhr.send();
}

function friendRequest(id, text) {
    let url = "https://localhost:8000/send-request/";
    url = url.replace("localhost", window.location.hostname);
    url += id + '/';
    if (text == 'Remove friend') {
        url = url.replace("send-request", "remove_friend");
    }
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.withCredentials = true;
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            try {
                if (xhr.status === 200 || xhr.status === 201) {
                    const response = JSON.parse(xhr.responseText);
                    notifications(response.message, 'success');
                    const addFriend = document.getElementById('addFriend');
                    if (addFriend) {
                        if (text == 'Remove friend') {
                            addFriend.innerHTML = '+Add friend';
                        }
                        else {
                            addFriend.innerHTML = 'Request pending';
                            addFriend.classList.add('disabled');
                        }
                    }
                } else {
                    const errorResponse = JSON.parse(xhr.responseText);
                    notifications(errorResponse.error || 'An error occurred');
                }
            } catch (e) {
                notifications('Failed to process the response');
            }
        }
    };
    xhr.send();
}

function listBloquedUser() {
    return new Promise((resolve, reject) => {
        let url = "https://localhost:8000/list_blocked_user/";
        url = url.replace("localhost", window.location.hostname);
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.withCredentials = true;
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 201) {
                    const response = JSON.parse(xhr.responseText);
                    console.log(response);
                    resolve(response);
                } else {
                    reject('Failed to fetch blocked users');
                }
            }
        };
        xhr.send();
    });
}

function displayHistorique(userId, response) {
    const historySpace = document.getElementById('history');
    if (!historySpace)
        return;
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

    skel = document.getElementById('skeleton-loader-hist')
    if (skel)
        skel.style.display = 'None';

    const inputs = document.querySelectorAll('.history');
    inputs.forEach((input) => {
        input.addEventListener('click', click);
    });
    const addFriend = document.getElementById('addFriend');
    const message = document.getElementById('message');
    const duel = document.getElementById('duel');
    const block = document.getElementById('block');

    if (!addFriend || !message || !duel || !block)
        return;

    // Check if user is friend to edit friend button
    getFriendList().then(response => {
        if (response) {
            for (let i = 0; i < response.friends.length; i++) {
                if (parseInt(response.friends[i].id) == userId) {
                    addFriend.innerHTML = 'Remove friend';
                    break;
                }
            }
        }
    }).catch(error => {
        console.error(error);
    });

    // Check if user is blocked to edit block button
    listBloquedUser().then(response => {
        if (response) {
            for (let i = 0; i < response.blocked_user.length; i++) {
                if (parseInt(response.blocked_user[i].id) == userId) {
                    block.innerHTML = 'Unblock user';
                    break;
                }
            }
        }
    }).catch(error => {
        console.error(error);
    });


    addFriend.addEventListener('click', function () {
        text = addFriend.textContent.trim();
        friendRequest(userId, text);
        if (text == 'Remove friend') {
            addFriend.textContent = '+Add friend';
        }
    });
    message.addEventListener('click', function () {
        console.log('message');
    });
    duel.addEventListener('click', function () {
        console.log('duel');
    });
    block.addEventListener('click', function () {
        text = block.textContent.trim();
        console.log(text);
        const confirmation = confirm(`Are you sure you want to ${text}?`);
        if (confirmation) {
            answerdRequest(text, userId);
            if (text == 'Block user') {
                block.textContent = 'Unblock user';
            } else {
                block.textContent = 'Block user';
            }
        }
    });
}
// retirer sur pas finish

function generateRatioGraph(game, stats) {
    const percent = document.getElementById('percent' + game);
    const text = document.getElementById('text' + game);
    const totalScore = document.getElementById('totalScore' + game);

    if (!percent || !text || !totalScore)
        return;

    let nbrGame = stats.total_game;
    let nbrWin = stats.total_win;
    let nbrLoose = stats.total_lost;
    const winPercent = (nbrWin / nbrGame) * 100;
    let tmp = winPercent + ", 100";
    if (nbrWin > 10 || nbrLoose > 10) {
        text.classList.add("smaller");
        if (nbrWin > 10 && nbrLoose > 10)
            text.classList.add("realySmall");
    }
    text.innerHTML = nbrWin + "w/" + nbrLoose + "l";
    percent.setAttribute('stroke-dasharray', tmp);
    totalScore.innerHTML = `Total of points scored: ${stats.total_score}`;

}

function graphique(stats) {
    if (!stats)
        return;
    generateRatioGraph('Tot', stats);
    if (stats.pong)
        generateRatioGraph('Pong', stats.pong);
    if (stats.tron)
        generateRatioGraph('Tron', stats.tron);
    if (stats.gam)
        generateRatioGraph('Gam', stats.gam);
}


let gamePlaysChart, pongPlaysChart, tronPlaysChart, gamPlaysChart, winLossChart, pongWinLossChart, tronWinLossChart, gameWinLossChart;

function createChart(chartVariable, ctx, type, data, options) {
    const existingChart = Chart.getChart(ctx);
    console.log(existingChart)
    if (existingChart) {
        existingChart.destroy();
    }
    // if (chartVariable && chartVariable instanceof Chart) {
    //     chartVariable.destroy(); // TODO : fix disapear
    // }

    
    ctx.canvas.width = ctx.canvas.parentNode.clientWidth;
    ctx.canvas.height = ctx.canvas.parentNode.clientHeight;

    return new Chart(ctx, {
        type: type,
        data: data,
        options: options
    });
}

function displayMetrics(data) {
    const lineChart = document.getElementById('line-charts')
    const barChart = document.getElementById('bar-charts')
    const skel = document.getElementById('skeleton-loader-graph1')
    const skel2 = document.getElementById('skeleton-loader-graph2')
    if (!skel || !skel2 || !lineChart || !data) return;

    skel.style.display = 'flex';
    skel2.style.display = 'flex';

    // Format date to 'YYYY-MM-DD'
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    }

    const stats = {};

    data.forEach(game => {
        const date = formatDate(game.start_date);
        if (!stats[date]) {
            stats[date] = {
                daily: { wins: 0, losses: 0, gamesPlayed: 0 },
                pong: { wins: 0, losses: 0, gamesPlayed: 0 },
                tron: { wins: 0, losses: 0, gamesPlayed: 0 },
                gam: { wins: 0, losses: 0, gamesPlayed: 0 }
            };
        }

        stats[date].daily.gamesPlayed += 1;
        if (game.gameName === 'pong') {
            stats[date].pong.gamesPlayed += 1;
            if (game.win) {
                stats[date].pong.wins += 1;
            } else {
                stats[date].pong.losses += 1;
            }
        } else if (game.gameName === 'tron') {
            stats[date].tron.gamesPlayed += 1;
            if (game.win) {
                stats[date].tron.wins += 1;
            } else {
                stats[date].tron.losses += 1;
            }
        } else if (game.gameName === 'gun_and_monsters') {
            stats[date].gam.gamesPlayed += 1;
            if (game.win) {
                stats[date].gam.wins += 1;
            } else {
                stats[date].gam.losses += 1;
            }
        }

        if (game.win) {
            stats[date].daily.wins += 1;
        } else {
            stats[date].daily.losses += 1;
        }
    });

    const labels = Object.keys(stats).sort();
    const gamesPlayedData = labels.map(date => stats[date].daily.gamesPlayed);
    const winsData = labels.map(date => stats[date].daily.wins);
    const lossesData = labels.map(date => -stats[date].daily.losses);

    const pongGamesPlayedData = labels.map(date => stats[date].pong.gamesPlayed);
    const pongWinsData = labels.map(date => stats[date].pong.wins);
    const pongLossesData = labels.map(date => -stats[date].pong.losses);

    const tronGamesPlayedData = labels.map(date => stats[date].tron.gamesPlayed);
    const tronWinsData = labels.map(date => stats[date].tron.wins);
    const tronLossesData = labels.map(date => -stats[date].tron.losses);

    const gamGamesPlayedData = labels.map(date => stats[date].gam.gamesPlayed);
    const gamWinsData = labels.map(date => stats[date].gam.wins);
    const gamLossesData = labels.map(date => -stats[date].gam.losses);

    const lineChartData = {
        labels: labels,
        datasets: [{
            label: 'Games Played',
            data: gamesPlayedData,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    };

    const pongLineChartData = {
        labels: labels,
        datasets: [{
            label: 'Pong Games Played',
            data: pongGamesPlayedData,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    };

    const tronLineChartData = {
        labels: labels,
        datasets: [{
            label: 'Tron Games Played',
            data: tronGamesPlayedData,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    };

    const gamLineChartData = {
        labels: labels,
        datasets: [{
            label: 'Gun and Monsters Games Played',
            data: gamGamesPlayedData,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    };

    const winLossData = {
        labels: labels,
        datasets: [{
            label: 'Wins',
            data: winsData,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }, {
            label: 'Losses',
            data: lossesData,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
        }]
    };

    const pongWinLossData = {
        labels: labels,
        datasets: [{
            label: 'Pong Wins',
            data: pongWinsData,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }, {
            label: 'Pong Losses',
            data: pongLossesData,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
        }]
    };

    const tronWinLossData = {
        labels: labels,
        datasets: [{
            label: 'Tron Wins',
            data: tronWinsData,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }, {
            label: 'Tron Losses',
            data: tronLossesData,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
        }]
    };

    const gamWinLossData = {
        labels: labels,
        datasets: [{
            label: 'Gun and Monsters Wins',
            data: gamWinsData,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }, {
            label: 'Gun and Monsters Losses',
            data: gamLossesData,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
        }]
    };

    const winLossOptions = {
        scales: {
            y: {
                beginAtZero: true,
                stacked: true
            },
            x: {
                stacked: true
            }
        },
        responsive: true,
        maintainAspectRatio: true
    };

    gamePlaysChart = createChart(gamePlaysChart, document.getElementById('gamePlaysChart').getContext('2d'), 'line', lineChartData, winLossOptions);
    pongPlaysChart = createChart(pongPlaysChart, document.getElementById('pongPlaysChart').getContext('2d'), 'line', pongLineChartData, winLossOptions);
    tronPlaysChart = createChart(tronPlaysChart, document.getElementById('tronPlaysChart').getContext('2d'), 'line', tronLineChartData, winLossOptions);
    gamPlaysChart = createChart(gamPlaysChart, document.getElementById('gamPlaysChart').getContext('2d'), 'line', gamLineChartData, winLossOptions);

    winLossChart = createChart(winLossChart, document.getElementById('winLossChart').getContext('2d'), 'bar', winLossData, winLossOptions);
    pongWinLossChart = createChart(pongWinLossChart, document.getElementById('pongWinLossChart').getContext('2d'), 'bar', pongWinLossData, winLossOptions);
    tronWinLossChart = createChart(tronWinLossChart, document.getElementById('tronWinLossChart').getContext('2d'), 'bar', tronWinLossData, winLossOptions);
    gamWinLossChart = createChart(gameWinLossChart, document.getElementById('gamWinLossChart').getContext('2d'), 'bar', gamWinLossData, winLossOptions);

    lineChart.style.display = 'flex';
    barChart.style.display = 'flex';
    skel.style.display = 'none';
    skel2.style.display = 'none';
}

function formatDuration(isoDuration) {
    if (!isoDuration) return '0 seconds';

    // Use a regular expression to parse the ISO 8601 duration string
    const regex = /P(?:([0-9,.]+)D)?T(?:([0-9,.]+)H)?(?:([0-9,.]+)M)?(?:([0-9,.]+)S)?/;
    const matches = isoDuration.match(regex);

    // Extract the values or set them to 0 if they are undefined
    const days = matches[1] ? parseFloat(matches[1]) : 0;
    const hours = matches[2] ? parseFloat(matches[2]) : 0;
    const minutes = matches[3] ? parseFloat(matches[3]) : 0;
    const seconds = matches[4] ? parseFloat(matches[4]) : 0;

    // Construct the output string
    let result = '';
    if (days > 0) result += `${days} day${days > 1 ? 's' : ''}, `;
    if (hours > 0) result += `${hours} hour${hours > 1 ? 's' : ''}, `;
    if (minutes > 0) result += `${minutes} minute${minutes > 1 ? 's' : ''}, `;
    result += `${seconds.toFixed(0)} second${seconds.toFixed(0) != 1 ? 's' : ''}`;

    return result;
}


function displayStats(data) {
    try {
        if (!data) return;

        document.getElementById('totalWins').textContent = data.total_win;
        document.getElementById('totalLosses').textContent = data.total_lost;
        document.getElementById('totalGames').textContent = data.total_game;
        document.getElementById('winStreak').textContent = data.win_streak;
        document.getElementById('tournamentWins').textContent = data.tournament_win;
        document.getElementById('tournamentPlayed').textContent = data.tournament_played;

        if (!data.pong) return;

        document.getElementById('pongTotalWins').textContent = data.pong.total_win;
        document.getElementById('pongTotalLosses').textContent = data.pong.total_lost;
        document.getElementById('pongTotalGames').textContent = data.pong.total_game;
        document.getElementById('pongTotalScore').textContent = data.pong.total_score;
        document.getElementById('pongPlayTime').textContent = formatDuration(data.pong.play_time);
        document.getElementById('pongFastestWin').textContent = formatDuration(data.pong.fastest_win);
        document.getElementById('pongLongestGame').textContent = formatDuration(data.pong.longest_game);

        if (!data.tron) return;

        document.getElementById('tronTotalWins').textContent = data.tron.total_win;
        document.getElementById('tronTotalLosses').textContent = data.tron.total_lost;
        document.getElementById('tronTotalGames').textContent = data.tron.total_game;
        document.getElementById('tronTotalScore').textContent = data.tron.total_score;
        document.getElementById('tronPlayTime').textContent = formatDuration(data.tron.play_time);
        document.getElementById('tronFastestWin').textContent = formatDuration(data.tron.fastest_win);
        document.getElementById('tronLongestGame').textContent = formatDuration(data.tron.longest_game);

        if (!data.gam) return;

        document.getElementById('gamTotalWins').textContent = data.gam.total_win;
        document.getElementById('gamTotalLosses').textContent = data.gam.total_lost;
        document.getElementById('gamTotalGames').textContent = data.gam.total_game;
        document.getElementById('gamTotalScore').textContent = data.gam.total_score;
        document.getElementById('gamPlayTime').textContent = formatDuration(data.gam.play_time);
        document.getElementById('gamFastestWin').textContent = formatDuration(data.gam.fastest_win);
        document.getElementById('gamLongestGame').textContent = formatDuration(data.gam.longest_game);

    } catch (error) {
        return
    }
}