let inTheTournament = false;

function showTournamentInfo() {
    getAllInfoTournament();
}

function getAllInfoTournament() {
    console.log(localStorage);
    let tournament_id = localStorage.tournament_id;
    if (tournament_id == "" || tournament_id == null || tournament_id == undefined) {
        alert("No tournament selected");
        return;
    }
    let url = "https://" + window.location.hostname + ":8001/game/get_tournament/" + tournament_id;
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.withCredentials = true;
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 201) {
                response = JSON.parse(xhr.responseText);
                putBasicInfo(response);
                printAllUsername(response);
                ifCurrentOrNot(response);
                const organizedMatches = organizeMatches(response, currentUserId);
                updateMatchDisplay(organizedMatches);
            } else {
                alert('Error: ' + JSON.parse(xhr.responseText).error);
            }
        }
    }
    xhr.send();
}

function ifCurrentOrNot(tournament) {
    const joinButton = document.getElementById("join-tournament-button");
    if (tournament.max_player_number == tournament.player_number || inTheTournament == true) {
        // TODO : mettre en le join button en disabled
    }
    else {
        joinButton.onclick = function () {
            let url = "https://" + window.location.hostname + ":8001/game/join_tournament/" + getCookie("tournament_id");
            let xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);
            xhr.withCredentials = true;
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    let response = JSON.parse(xhr.responseText);
                    if (xhr.status === 200 || xhr.status === 201) {
                        loadPage("tournament", 1);
                    } else {
                        if (response.success == false)
                            alert('Error: ' + response.message);
                        else
                            alert('Error: ' + response.error);
                    }
                }
            }
            xhr.send();
        }
    }
}

function putBasicInfo(response) {
    document.getElementById("tournament-name").innerHTML = response.name;
    document.getElementById("tournament-date").innerHTML = response.start_date;
    document.getElementById("tournament-nb-player").innerHTML = "Players: " + response.player_number + "/" + response.max_player_number;
}

function printAllUsername(tournament) {
    tournament.matches.forEach((match) => {
        // Player 1
        const playerOneSpan = document.querySelector(`.username[data-match="${match.id}"][data-player="one"]`);
        const playerOneImg = playerOneSpan?.previousElementSibling; // Trouver l'élément image précédent le span

        if (playerOneSpan && match.player_one) {
            playerOneSpan.textContent = match.player_one.username || "TBD"; // Si pas de nom, afficher "TBD"
            if (playerOneImg && match.player_one.id) {
                playerOneImg.textContent = ''; // Efface le texte "IMG"
                const imgElement = document.createElement('img');
                loadPicture(match.player_one.id, imgElement); // Charger l'image du joueur
                // imgElement.alt = `Profile picture of ${match.player_one.username}`;
                playerOneImg.appendChild(imgElement);
            }
        }

        // Player 2
        const playerTwoSpan = document.querySelector(`.username[data-match="${match.id}"][data-player="two"]`);
        const playerTwoImg = playerTwoSpan?.previousElementSibling; // Trouver l'élément image précédent le span

        if (playerTwoSpan && match.player_two) {
            playerTwoSpan.textContent = match.player_two.username || "TBD"; // Si pas de nom, afficher "TBD"
            if (playerTwoImg && match.player_two.id) {
                playerTwoImg.textContent = ''; // Efface le texte "IMG"
                const imgElement = document.createElement('img');
                loadPicture(match.player_two.id, imgElement); // Charger l'image du joueur
                // imgElement.alt = `Profile picture of ${match.player_two.username}`;
                playerTwoImg.appendChild(imgElement);
            }
        }

        let user_id = getCookie("userId");
        if (user_id == match.player_one.id || user_id == match.player_two.id) {
            inTheTournament = true;
            selfCurrentGame(match);
        }
    });
}

function selfCurrentGame(match) { // Si l'utilisateur est dans un match current game permet de rejoindre le match
    let matchTitle = document.getElementById("match-title");
    matchTitle.innerHTML = match.player_one.username + " / " + match.player_two.username;
    let joinButton = document.getElementById("match-join-button");
    joinButton.innerHTML = "Join My Game";
    joinButton.onclick = function () {
        localStorage.setItem("gameId", match.game_id);
        loadPage("pong", 1);
    }
}

function loadPicture(id, playerImg) {
    if (id == null || playerImg == null) return;
    var response;
    let url = "https://" + window.location.hostname + ":8000/users/" + id + "/avatar";
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.withCredentials = true;
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 3) {
            if (xhr.status === 200 || xhr.status === 201) {
                response = xhr.responseText;
            } else {
                alert('Error: ' + JSON.parse(xhr.responseText).error);
            }
        }
        var newProfilePicture = url.replace("/users/<int:user_id>/avatar".replace("<int:user_id>", id), response);
        playerImg.src = newProfilePicture;
    };
    xhr.send();
}

// ========================================== current game =================================================

let currentUserId = getCookie("userId");

function organizeMatches(tournamentData, currentUserId) {
    const myMatches = [];
    const playingMatches = [];
    const waitingMatches = [];

    tournamentData.matches.forEach(match => {
        // Vérifier si je suis dans le match
        const isMyGame = match.player_one?.id === currentUserId || match.player_two?.id === currentUserId;
        if (match.status === 'finished')
            isMyGame = false;
        if (isMyGame) {
            myMatches.push(match);
        } else if (match.status === 'playing') {
            playingMatches.push(match);
        } else if (match.status === 'waiting' && (match.player_one.id || match.player_two.id)) {
            waitingMatches.push(match);
        }
    });
    // Retourner les matchs triés dans l'ordre : ma game, playing, waiting
    return [...myMatches, ...playingMatches, ...waitingMatches];
}

function updateMatchDisplay(matches) {
    let currentIndex = 0;

    // Fonction pour afficher un match donné par son index
    function displayMatch(index) {
        const match = matches[index];
        if (!match) return;

        const matchTitle = `${match.player_one?.username || 'TBD'} / ${match.player_two?.username || 'TBD'}`;
        document.getElementById('match-title').textContent = matchTitle;

        // Mettre à jour les joueurs et le score
        const playerElems = document.querySelectorAll('.player');

        // condition pour supprimer les images si il y en a une avant de les remplacer
        if (playerElems[0].firstChild) {
            playerElems[0].removeChild(playerElems[0].firstChild);
        }
        if (playerElems[1].firstChild) {
            playerElems[1].removeChild(playerElems[1].firstChild);
        }

        if (match.player_one?.id) {
            playerElems[0].textContent = ''; // Efface le texte "IMG"
            const imgElement = document.createElement('img');
            loadPicture(match.player_two.id, imgElement); // Charger l'image du joueur
            playerElems[0].appendChild(imgElement);
        }
        else
            playerElems[0].textContent = 'TBD';
        if (match.player_two?.id) {
            playerElems[1].textContent = ''; // Efface le texte "IMG"
            const imgElement2 = document.createElement('img');
            loadPicture(match.player_one.id, imgElement2); // Charger l'image du joueur
            playerElems[1].appendChild(imgElement2);
        }
        else
            playerElems[1].textContent = 'TBD';

        // Mettre à jour le bouton Spectate
        const spectateButton = document.getElementById('match-join-button');
        if (match.player_one?.id === currentUserId || match.player_two?.id === currentUserId)
            spectateButton.textContent = 'Join game';
        else
            spectateButton.textContent = 'Spectate game';
        spectateButton.onclick = () => joinGame(match.game_id);
    }

    // Affichage initial
    displayMatch(currentIndex);
    console.log('matches length', matches.length);
    // Navigation avec les boutons "<" et ">"
    document.querySelector('.left-right-button:first-child').onclick = () => {
        if (currentIndex > 0) {
            currentIndex--;
            displayMatch(currentIndex);
            document.querySelector('.left-right-button:last-child').classList.remove('disabled');
        }
        else
            document.querySelector('.left-right-button:first-child').classList.add('disabled');

    };

    document.querySelector('.left-right-button:last-child').onclick = () => {
        if (currentIndex < matches.length - 1) {
            currentIndex++;
            displayMatch(currentIndex);
            document.querySelector('.left-right-button:first-child').classList.remove('disabled');
        }
        else
            document.querySelector('.left-right-button:last-child').classList.add('disabled');
    };
}

function joinGame(gameId) {
    localStorage.setItem('gameId', gameId);
    loadPage('pong', 1);
}