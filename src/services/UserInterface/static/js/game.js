document.addEventListener('DOMContentLoaded', function () {
    const maxPlayersSelect = document.getElementById('max-players');
    const gameModeSelect = document.getElementById('game-mode');

    // Désactive le choix du mode de jeu si 2 joueurs sont sélectionnés
    maxPlayersSelect.addEventListener('change', function () {
        if (this.value === '2') {
            gameModeSelect.value = 'ffa';
            gameModeSelect.disabled = true;
        } else {
            gameModeSelect.disabled = false;
        }
    });



    // Gestion de la jonction de partie
    document.getElementById('join-game-button').addEventListener('click', function () {
        const gameName = document.getElementById('join-game-name').value;

        if (!gameName) {
            alert("Veuillez entrer le nom de la partie à rejoindre.");
            return;
        }

        console.log("Tentative de rejoindre la partie:", gameName);

        // Simulez la jonction de la partie (intégration backend nécessaire)
        alert("Vous avez rejoint la partie !");
    });

    // Gestion de la recherche d'une partie aléatoire
    document.getElementById('random-game-button').addEventListener('click', function () {
        console.log("Recherche d'une partie aléatoire...");
        // Simulez la recherche d'une partie (intégration backend nécessaire)
        alert("Partie aléatoire trouvée !");
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');
    const playerPositions = document.getElementById('player-positions');

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
    document.getElementById('random-game-button').addEventListener('click', function () {
        const players = ['Alice', 'Bob', 'Charlie', 'David'];
        const maxPlayers = 4;
        const gameMode = 'ffa'; // Ou 'team'

        showLoadingOverlay(players, maxPlayers, gameMode);
    });

    // Gestion de la création de partie
    document.getElementById('create-game-button').addEventListener('click', function () {
        const gameName = document.getElementById('game-name').value;
        const maxPlayers = document.getElementById('max-players').value;
        const gameMode = document.getElementById('game-mode').value;
        const mapChoice = document.getElementById('map-choice').value;
        const ballSpeed = parseInt(document.getElementById('ball-speed').value);
        const paddleSpeed = parseInt(document.getElementById('paddle-speed').value);

        if (!gameName) {
            alert("Veuillez entrer un nom pour la partie.");
            return;
        }

        // Validation des valeurs pour ballSpeed et paddleSpeed
        if (isNaN(ballSpeed) || ballSpeed < 1 || ballSpeed > 50) {
            alert("La vitesse de la balle doit être un nombre entre 1 et 50.");
            return;
        }

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
});
