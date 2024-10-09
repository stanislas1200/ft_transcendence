// let maxPlayersSelectRandom;
// let maxPlayersSelectCreate;
// let gameModeSelect;
// let gameModeSelectCreate;
// let joinGameButton;
// let joinGameName;
// let randomGameButton;
let loadingOverlay;
let loadingText;
let playerPositions;
// let createGameButton;
// let gameName;
// let gameMode;
// let mapChoice;
// let ballSpeed;
// let paddleSpeed;

function getElementGame() {
    console.log('game');
    // maxPlayersSelectRandom = document.getElementById('max-players-random');
    // maxPlayersSelectCreate = document.getElementById('max-players-create');
    // gameModeSelect = document.getElementById('game-mode');
    // gameModeSelect.disabled = true;
    // gameModeSelectCreate = document.getElementById('game-mode-create');
    // joinGameButton = document.getElementById('join-game-button');
    // joinGameName = document.getElementById('join-game-name').value;
    // randomGameButton = document.getElementById('random-game-button');
    loadingOverlay = document.getElementById('loading-overlay');
    loadingText = document.getElementById('loading-text');
    playerPositions = document.getElementById('player-positions');
    // createGameButton = document.getElementById('create-game-button');

    // gameName = document.getElementById('game-name').value;
    // gameMode = document.getElementById('game-mode').value;
    // mapChoice = document.getElementById('map-choice').value;
    // ballSpeed = parseInt(document.getElementById('ball-speed').value);
    // paddleSpeed = parseInt(document.getElementById('paddle-speed').value);

    gameModeDisabler();
    inputAnimation();
    randomJoinGameButton();
    createGameButton();
    // waitingRoom();
}

function gameModeDisabler() {
    // Désactive le choix du mode de jeu si 2 joueurs sont sélectionnés
    const maxPlayersSelectRandom = document.getElementById('max-players-random');
    const gameModeSelect = document.getElementById('game-mode');
    gameModeSelect.disabled = true;
    maxPlayersSelectRandom.addEventListener('change', function () {
        if (this.value === '2') {
            gameModeSelect.value = 'ffa';
            gameModeSelect.disabled = true;
        } else {
            gameModeSelect.disabled = false;
        }
    });

    const maxPlayersSelectCreate = document.getElementById('max-players-create');
    const gameModeCreateTeam = document.getElementById('game-mode-create-team');
    const gameModeCreateFfa = document.getElementById('game-mode-create-ffa');
    const gameModeCreateSolo = document.getElementById('game-mode-create-solo');
    gameModeCreateFfa.disabled = true;
    gameModeCreateTeam.disabled = true;

    maxPlayersSelectCreate.addEventListener('change', function () {
        if (this.value === '1') {
            gameModeCreateSolo.value = 'solo-ia';
            gameModeCreateFfa.disabled = true;
            gameModeCreateTeam.disabled = true;
            gameModeCreateSolo.disabled = false;
        } else if (this.value === '2') {
            gameModeCreateSolo.value = 'ffa';
            gameModeCreateSolo.disabled = true;
            gameModeCreateTeam.disabled = true;
            gameModeCreateFfa.disabled = false;
        } else {
            gameModeCreateSolo.disabled = true;
            gameModeCreateFfa.disabled = false;
            gameModeCreateTeam.disabled = false;
        }
    });

}

function randomJoinGameButton() {
    const randomGameButton = document.getElementById('random-game-button');

    randomGameButton.addEventListener('click', function () {
        const gameModeSelect = document.getElementById('game-mode');
        const maxPlayersSelectRandom = document.getElementById('max-players-random');
        const gameStyle = document.getElementById('gameRandom').value;
        var xhr = new XMLHttpRequest();
        var url = "https://" + window.location.hostname + ":8001/game/join?gameName={{gameStyle}}&gameMode=" + gameModeSelect.value + "&nbPlayers=" + maxPlayersSelectRandom.value;
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
                    console.log(xhr.responseText);
                    if (gameStyle === 'tron')
                        loadPage("tron", 1);
                    else
                        loadPage("pong", 1);
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

        if (gameMode == 'local')
            return loadPage("localpong", 1)

        var xhr = new XMLHttpRequest();
        let url = "https://localhost:8001/game/join?gameName={{gameStyle}}&gameMode={{gameMode}}&nbPlayers={{nbPlayer}}";
        url = url.replace("localhost", window.location.hostname);
        url = url.replace("{{gameStyle}}", gameStyle);
        url = url.replace("{{gameMode}}", gameMode);
        url = url.replace("{{nbPlayer}}", playerNumber);
        xhr.withCredentials = true;
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function () {
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
                }
                else {
                    console.log('Error creating game'); // TODO put a message
                    console.log(xhr.responseText);
                }
        }
        xhr.send("partyName=tmp&game=pong&gameType=custom&playerNumber=" + playerNumber + "&gameMode=" + gameMode + "&map=" + mapChoice + "&ballSpeed=" + ballSpeed + "&paddleSpeed=" + paddleSpeed);
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