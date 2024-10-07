function showTournamentInfo() {
    getAllInfoTournament();
}

function getAllInfoTournament() {
    if (getCookie("tournament_id") == "") {
        alert("No tournament selected");
        return;
    }
    let url = "https://" + window.location.hostname + ":8001/game/get_tournament/" + getCookie("tournament_id");
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.withCredentials = true;
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 201) {
                response = JSON.parse(xhr.responseText);
                putBasicInfo(response);
                printAllUsername(response);
            } else {
                alert('Error: ' + JSON.parse(xhr.responseText).error);
            }
        }
    }
    xhr.send();
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
            selfCurrentGame(match);
        }
    });
}

function selfCurrentGame(match) { // Si l'utilisateur est dans un match current game permet de rejoindre le match
    let matchTitle = document.getElementById("match-title");
    matchTitle.innerHTML = match.player_one.username + " / " + match.player_two.username;
    let joinButton = document.getElementById("match-join-button");
    joinButton.onclick = function () {
        localStorage.setItem("gameId", match.game_id);
        loadPage("pong");
    }
}

function loadPicture(id, playerImg) {
    var response;
    let url = "https://localhost:8000/users/<int:user_id>/avatar";
    url = url.replace("localhost", window.location.hostname);
    url = url.replace("<int:user_id>", id);
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