let loadingOverlay;
let loadingText;
let playerPositions;

function getElementGame() {
    console.log('game');
    loadingOverlay = document.getElementById('loading-overlay');
    loadingText = document.getElementById('loading-text');
    playerPositions = document.getElementById('player-positions');

    gameModeDisablerForRandom();
    gameModeDisablerForCreate();
    inputAnimation();
    randomJoinGameButton();
    createGameButton();
}

function gameModeDisablerForCreate() {
    const maxPlayersSelect = document.getElementById('max-players-create');
    const gameModeCreateTeam = document.getElementById('game-mode-create-team');
    const gameModeCreateFfa = document.getElementById('game-mode-create-ffa');
    const gameModeCreateSolo = document.getElementById('game-mode-create-solo');
    const gameStyle = document.getElementById('gameCreate');
    const gameModeSelect = document.getElementById('game-mode-create');
    const map = document.getElementById('map-choice');
    const gameModeDisable = document.getElementById('game-mode-disable');
    const numberOfPlayerDisable = document.getElementById('number-of-player-disable');
    const mapChoiceDisable = document.getElementById('map-choice-disable');
    const ballSpeedDisable = document.getElementById('ball-speed-disable');
    const paddleSpeedDisable = document.getElementById('paddle-speed-disable');

    gameModeSelect.value = "solo-ia";
    gameModeSelect.disabled = true;

    gameStyle.addEventListener('change', function () {
        if (this.value === 'tron' || this.value === 'gun_and_monsters' || this.value === 'local') {
            gameModeDisable.classList.add('hide');
            mapChoiceDisable.classList.add('hide');
            ballSpeedDisable.classList.add('hide');
            paddleSpeedDisable.classList.add('hide');
            numberOfPlayerDisable.classList.add('hide');
            map.value = '0';
            map.disabled = true;
        } else {
            gameModeDisable.classList.remove('hide');
            mapChoiceDisable.classList.remove('hide');
            ballSpeedDisable.classList.remove('hide');
            paddleSpeedDisable.classList.remove('hide');
            numberOfPlayerDisable.classList.remove('hide');
            maxPlayersSelect.disabled = false;
            map.disabled = false;
        }
    });

    maxPlayersSelect.addEventListener('change', function () {
        if (this.value === '1') {
            gameModeSelect.value = "solo-ia";
            gameModeSelect.disabled = true;
            map.disabled = false;
        } else if (this.value == '2') {
            gameModeSelect.value = 'ffa';
            gameModeSelect.disabled = false;
            gameModeCreateFfa.disabled = false;
            gameModeCreateSolo.disabled = true;
            gameModeCreateTeam.disabled = true;
        } else {
            gameModeSelect.value = 'ffa';
            gameModeSelect.disabled = false;
            gameModeCreateFfa.disabled = false;
            gameModeCreateSolo.disabled = true;
            gameModeCreateTeam.disabled = false;
        }
    });

}

function gameModeDisablerForRandom() {
    // Désactive le choix du mode de jeu si 2 joueurs sont sélectionnés
    const maxPlayersSelect = document.getElementById('max-players-random');
    const gameModeSelect = document.getElementById('game-mode');
    const gameStyle = document.getElementById('gameRandom');
    gameModeSelect.disabled = false;

    // console.log(gameStyle.value);

    gameStyle.addEventListener('change', function () {
        if (this.value === 'tron') {
            gameModeSelect.value = 'ffa';
            maxPlayersSelect.value = '2';
            gameModeSelect.disabled = true;
            maxPlayersSelect.disabled = true;
        } else {
            // gameModeSelect.disabled = false;
            maxPlayersSelect.disabled = false;
        }
    });

    maxPlayersSelect.addEventListener('change', function () {
        if (this.value === '2') {
            gameModeSelect.value = 'ffa';
            gameModeSelect.disabled = true;
        } else {
            gameModeSelect.disabled = false;
        }
    });
}

function randomJoinGameButton() {
    const randomGameButton = document.getElementById('random-game-button');

    randomGameButton.addEventListener('click', function () {
        randomGameButton.disabled = true;
        const gameModeSelect = document.getElementById('game-mode');
        const maxPlayersSelectRandom = document.getElementById('max-players-random');
        const gameStyle = document.getElementById('gameRandom').value;
        var xhr = new XMLHttpRequest();
        var url = "https://" + window.location.hostname + ":8001/game/join?gameName={{gameStyle}}&gameMode=" + gameModeSelect.value + "&nbPlayers=" + maxPlayersSelectRandom.value;
        url = url.replace("{{gameStyle}}", gameStyle);
        xhr.withCredentials = true;
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = async function () {
            if (xhr.readyState === 4)
                if (xhr.status === 200) {
                    console.log('Game joined');
                    var gameId = JSON.parse(xhr.responseText).game_id;
                    console.log("game id :" + gameId);
                    localStorage.setItem("gameId", gameId);
                    console.log(xhr.responseText);
                    if (gameStyle === 'tron')
                        await loadPage("tron", 1);
                    else if (gameStyle === 'gun_and_monsters')
                        await loadPage("gam", 1);
                    else
                        await loadPage("pong", 1);
                    randomGameButton.disabled = false;
                }
                else {
                    console.log('Error joining game'); // TODO put a message
                    console.log(xhr.responseText);
                }
        };
        xhr.send();
    });
}

function createGameButton() {
    const createGameButton = document.getElementById('create-game-button');

    createGameButton.addEventListener('click', function () {
        // const partyName = document.getElementById('partyName').value;
        const playerNumber = document.getElementById('max-players-create').value;
        const gameMode = document.getElementById('game-mode-create').value;
        const mapChoice = document.getElementById('map-choice').value;
        const ballSpeed = document.getElementById('ball-speed').value;
        const paddleSpeed = document.getElementById('paddle-speed').value;
        const gameStyle = document.getElementById('gameCreate').value;

        if (gameStyle == 'local')
            return loadPage("localpong", 1)
        else if (gameMode == 'tournament') {
            var xhr = new XMLHttpRequest();
            let url = "https://localhost:8001/game/create_tournament";
            url = url.replace("localhost", window.location.hostname);
            xhr.withCredentials = true;
            xhr.open("POST", url, true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4)
                    if (xhr.status === 200) {
                        var response = JSON.parse(xhr.responseText);
                        document.cookie = 'tournament_id=' + response.tournament_id;
                        loadPage('tournament', 1);
                    }
                    else {
                        console.log('Error creating game'); // TODO put a message
                        console.log(xhr.responseText);
                    }
            }
            xhr.send("name=tounament&game=pong&start_date=2023-04-01T12:00:00Z");
        } else {
            createGameButton.disabled = true;
            var xhr = new XMLHttpRequest();
            let url = "https://localhost:8001/game/create";
            url = url.replace("localhost", window.location.hostname);
            xhr.withCredentials = true;
            xhr.open("POST", url, true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.onreadystatechange = async function () {
                if (xhr.readyState === 4)
                    if (xhr.status === 200) {
                        console.log('Game created');
                        var gameId = JSON.parse(xhr.responseText).game_id;
                        console.log("game id :" + gameId);
                        localStorage.setItem("gameId", gameId);
                        console.log(xhr.responseText);
                        if (gameStyle === 'tron')
                            loadPage("tron", 1);
                        else
                            loadPage("pong", 1);
                        createGameButton.disabled = false;
                    }
                    else {
                        console.log('Error creating game'); // TODO put a message
                        console.log(xhr.responseText);
                    }
            }
            xhr.send("partyName=tmp&game=" + gameStyle + "&gameType=custom&playerNumber=" + playerNumber + "&gameMode=" + gameMode + "&map=" + mapChoice + "&ballSpeed=" + ballSpeed + "&paddleSpeed=" + paddleSpeed);
        }
    });
}

// function waitingRoom() {
//     // Gestion de la création de partie
//     createGameButton.addEventListener('click', function () {
//         // console.log('je suis occupe de creer une game!');
//         const maxPlayers = maxPlayersSelectCreate.value;
//         gameName = document.getElementById('game-name').value;
//         if (!gameName) {
//             alert("Veuillez entrer un nom pour la partie.");
//             return;
//         }

//         ballSpeed = document.getElementById('ball-speed').value;
//         // Validation des valeurs pour ballSpeed et paddleSpeed
//         if (isNaN(ballSpeed) || ballSpeed < 1 || ballSpeed > 50) {
//             alert("La vitesse de la balle doit être un nombre entre 1 et 50.");
//             return;
//         }

//         paddleSpeed = document.getElementById('paddle-speed').value;
//         if (isNaN(paddleSpeed) || paddleSpeed < 10 || paddleSpeed > 100) {
//             alert("La vitesse des raquettes doit être un nombre entre 10 et 100.");
//             return;
//         }

//         // Créez un objet de configuration de jeu avec les valeurs saisies
//         const gameConfig = {
//             gameName: gameName,
//             maxPlayers: parseInt(maxPlayers),
//             gameMode: gameMode,
//             map: parseInt(mapChoice),
//             ballSpeed: ballSpeed,
//             paddleSpeed: paddleSpeed
//         };

//         console.log("Création d'une partie avec les paramètres suivants:", gameConfig);

//         // Simulez la création de la partie (intégration backend nécessaire)
//         alert("Partie créée avec succès !");
//     });
// }

function inputAnimation() {
    const inputs = document.querySelectorAll('.input');
    const button = document.querySelector('.login__button');
    const loginButton = document.getElementById("loginButton");

    const handleFocus = ({ target }) => {
        const span = target.previousElementSibling;
        if (span) {
            span.classList.add('span-active');
        }
    }

    const handleFocusOut = ({ target }) => {
        if (target.value === '') {
            const span = target.previousElementSibling;
            if (span) {
                span.classList.remove('span-active');
            }
        }
    }

    inputs.forEach((input) => {
        const span = input.previousElementSibling;
        if (input.value !== '' && span) {
            span.classList.add('span-active'); // Ajoute la classe si l'input a déjà du texte
        }

        input.addEventListener('focus', handleFocus);
        input.addEventListener('blur', handleFocusOut);
    });
}