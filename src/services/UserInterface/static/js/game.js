let maxPlayersSelectRandom;
let maxPlayersSelectCreate;
let gameModeSelect;
let gameModeSelectCreate;
let joinGameButton;
let joinGameName;
let randomGameButton;
let loadingOverlay;
let loadingText;
let playerPositions;
let createGameButton;
let gameName;
let gameMode;
let mapChoice;
let ballSpeed;
let paddleSpeed;

function getElementGame() {
    console.log('game');
    maxPlayersSelectRandom = document.getElementById('max-players-random');
    maxPlayersSelectCreate = document.getElementById('max-players-create');
    gameModeSelect = document.getElementById('game-mode');
    gameModeSelect.disabled = true;
    gameModeSelectCreate = document.getElementById('game-mode-create');
    gameModeSelectCreate.disabled = true;
    joinGameButton = document.getElementById('join-game-button');
    joinGameName = document.getElementById('join-game-name').value;
    randomGameButton = document.getElementById('random-game-button');
    loadingOverlay = document.getElementById('loading-overlay');
    loadingText = document.getElementById('loading-text');
    playerPositions = document.getElementById('player-positions');
    createGameButton = document.getElementById('create-game-button');

    gameName = document.getElementById('game-name').value;
    gameMode = document.getElementById('game-mode').value;
    mapChoice = document.getElementById('map-choice').value;
    ballSpeed = parseInt(document.getElementById('ball-speed').value);
    paddleSpeed = parseInt(document.getElementById('paddle-speed').value);

    twoPlayer();
    waitingRoom();
}

function twoPlayer() {
    // Désactive le choix du mode de jeu si 2 joueurs sont sélectionnés
    maxPlayersSelectRandom.addEventListener('change', function () {
        if (this.value === '2') {
            gameModeSelect.value = 'ffa';
            gameModeSelect.disabled = true;
        } else {
            gameModeSelect.disabled = false;
        }
    });

    maxPlayersSelectCreate.addEventListener('change', function () {
        if (this.value === '2') {
            gameModeSelectCreate.value = 'ffa';
            gameModeSelectCreate.disabled = true;
        } else {
            gameModeSelectCreate.disabled = false;
        }
    });


    // Gestion de la jonction de partie
    joinGameButton.addEventListener('click', function () {

        if (!joinGameName) {
            alert("Veuillez entrer le nom de la partie à rejoindre.");
            return;
        }

        console.log("Tentative de rejoindre la partie:", joinGameName);

        // Simulez la jonction de la partie (intégration backend nécessaire)
    });

    // Gestion de la recherche d'une partie aléatoire
    randomGameButton.addEventListener('click', function () {
        console.log("Recherche d'une partie aléatoire...");
        // Simulez la recherche d'une partie (intégration backend nécessaire)
        alert("Partie aléatoire trouvée !");
    });
}

function waitingRoom() {

    // Simuler la recherche d'une partie
    function showLoadingOverlay(players, maxPlayers, gameMode) {
        loadingOverlay.style.display = 'flex';

        // Mettre à jour le texte avec le nombre de joueurs
        loadingText.textContent = `Chargement... ${players.length}/${maxPlayers}`;

        // Vider les positions des joueurs
        playerPositions.innerHTML = '';

        if (gameMode === 'ffa') {
            // Répartir les joueurs dans les 4 positions (haut, bas, gauche, droite)
            const positions = ['top', 'right', 'bottom', 'left'];
            players.forEach((player, index) => {
                const position = positions[index % positions.length];
                const div = document.createElement('div');
                div.className = `player-position ${position}`;
                div.innerHTML = `<span>${player}</span>`;
                playerPositions.appendChild(div);
            });
        } else if (gameMode === 'team') {
            // Répartir les joueurs en deux équipes (gauche et droite)
            const team1 = players.slice(0, Math.ceil(players.length / 2));
            const team2 = players.slice(Math.ceil(players.length / 2));

            team1.forEach(player => {
                const div = document.createElement('div');
                div.className = 'player-position left';
                div.innerHTML = `<span>${player}</span>`;
                playerPositions.appendChild(div);
            });

            team2.forEach(player => {
                const div = document.createElement('div');
                div.className = 'player-position right';
                div.innerHTML = `<span>${player}</span>`;
                playerPositions.appendChild(div);
            });
        }
    }

    // Simuler la recherche d'une partie avec des données d'exemple
    randomGameButton.addEventListener('click', function () {
        const a = ['Alice', 'Bob', 'Charlie', 'David'];
        const maxa = 4;
        const b = 'ffa'; // Ou 'team'

        showLoadingOverlay(a, maxa, b);
    });

    // Gestion de la création de partie
    createGameButton.addEventListener('click', function () {
        // console.log('je suis occupe de creer une game!');
        const maxPlayers = maxPlayersSelectCreate.value;
        gameName = document.getElementById('game-name').value;
        if (!gameName) {
            alert("Veuillez entrer un nom pour la partie.");
            return;
        }

        ballSpeed = document.getElementById('ball-speed').value;
        // Validation des valeurs pour ballSpeed et paddleSpeed
        if (isNaN(ballSpeed) || ballSpeed < 1 || ballSpeed > 50) {
            alert("La vitesse de la balle doit être un nombre entre 1 et 50.");
            return;
        }

        paddleSpeed = document.getElementById('paddle-speed').value;
        if (isNaN(paddleSpeed) || paddleSpeed < 10 || paddleSpeed > 100) {
            alert("La vitesse des raquettes doit être un nombre entre 10 et 100.");
            return;
        }

        // Créez un objet de configuration de jeu avec les valeurs saisies
        const gameConfig = {
            gameName: gameName,
            maxPlayers: parseInt(maxPlayers),
            gameMode: gameMode,
            map: parseInt(mapChoice),
            ballSpeed: ballSpeed,
            paddleSpeed: paddleSpeed
        };

        console.log("Création d'une partie avec les paramètres suivants:", gameConfig);

        // Simulez la création de la partie (intégration backend nécessaire)
        alert("Partie créée avec succès !");
        showLoadingOverlay(["Alice", "BOB"], maxPlayers, gameMode);
    });

    // Cacher l'écran de chargement lorsque la partie est prête
    function hideLoadingOverlay() {
        loadingOverlay.style.display = 'none';
    }

    // Simuler la fin du chargement de la partie
    // Appelez hideLoadingOverlay() quand la partie est prête
}
