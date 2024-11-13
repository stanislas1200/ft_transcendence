let friendList;
let chatArea;
let messageInput;
let sendButton;
let chatSocket;
let isChatLoading = false;

async function getElementFriend() {
    friendList = document.getElementById('friend-list');
    chatArea = document.getElementById('chat-area');
    messageInput = document.getElementById('message-input');
    sendButton = document.getElementById('send-button');
    await chat();
}

function joinGameFromChat(gameId, gameStyle) {
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
                loadPage(gameStyle, 1)
            }
            else {
                console.log('Error joining game'); // TODO put a message
                console.log(xhr.responseText);
            }
    };
    xhr.send();
}

async function chat() {
    // let friendsJson;
    await getFriendList()
        .then(response => {
            // console.log("Liste des amis :", response);  // Utilisation de la réponse ici
            let friendsJson = response;

            // console.log(friendsJson);

            // Fonction pour ajouter un message à la zone de chat
            function addMessage(message, type, history = true) {
                // console.log('addMessage', message, type);
                const messageElement = document.createElement('div');
                messageElement.classList.add('message', type);
                if (message.split(' ')[0] === '/invite') { // lorsque le message est /invite {gameId} je voudrais que le message soit un bouton 'join the duel'et que je puisse recuperer le gameId
                    messageElement.innerHTML = '<button class="join-duel">Join the duel</button>';
                    const gameId = message.split(' ')[1];
                    if (!gameId)
                        return;
                    const click = ({ target }) => {
                        joinGameFromChat(gameId, 'pong');
                    }
                    messageElement.addEventListener('click', click);
                } else {
                    messageElement.textContent = message;
                }
                chatArea.appendChild(messageElement);

                // Faire défiler vers le bas pour afficher le dernier message
                chatArea.scrollTop = chatArea.scrollHeight;
                if (type === 'sent' && history) {
                    // console.log('message envoyé');
                    chatSocket.send(JSON.stringify({
                        'message': message
                    }));
                }
            }

            // Fonction pour charger le chat d'un ami
            async function loadChat(chatusername) {
                if (isChatLoading == true)
                    return;
                isChatLoading = true;
                // Effacer le contenu actuel du chat
                chatArea.innerHTML = '';
                data = null;

                if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
                    chatSocket.close();
                    console.log('socket closed');
                }

                // close l'ancienne websocket si elle existe
                // if (chatSocket !== undefined && chatSocket.readyState === WebSocket.OPEN) {
                //     chatSocket.close();
                // }

                // Demarrer une websocket avec le username de l'ami
                chatSocket = new WebSocket(
                    'wss://' + window.location.hostname + ':8002/ws/chat/' + chatusername + '/'
                );
                if (!chatSocket.hasSetListener) {
                    chatSocket.onopen = function (e) {
                        // const data = JSON.parse(e.data);
                        console.log('message socket on open ', e);
                        console.log('socket open with ', chatusername);
                        isChatLoading = false;
                    };

                    chatSocket.onmessage = function (e) {
                        console.log('on message event');
                        data = JSON.parse(e.data);
                        if (data.history != undefined) {
                            userid = getCookie("userId")
                            if (userid == data.userId) {
                                data.history.forEach(message => 
                                    {
                                        if (userid == message.user)
                                        addMessage(message.content, 'sent', false)
                                        else
                                        addMessage(message.content, 'received', false)
                                    }
                                )
                            }
                        }
                        if (data.sender === chatusername)
                            addMessage(data.message, 'received');
                    };

                    chatSocket.onclose = function (e) {
                        console.log('Chat socket closed unexpectedly');
                    };
                    chatSocket.hasSetListener = true;
                }

                // Ajouter les messages de l'ami sélectionné
                /*if (messages[chatId]) {
                    messages[chatId].forEach(msg => {
                        addMessage(msg, 'received');
                    });
        
                    // Ajouter un message d'exemple
                } else {
                    addMessage('This is a new message.', 'sent');
                } */
                let chatUsernameDisplay = document.createElement('p');
                chatUsernameDisplay.innerHTML = chatusername;
                chatUsernameDisplay.classList.add('chat-username');
                const click = async ({ target }) => {
                    await loadPage('profile', 1, target.innerHTML);
                    // searchUser(target.innerHTML);
                }

                chatUsernameDisplay.addEventListener('click', click);
                chatArea.appendChild(chatUsernameDisplay);
                // chatArea.innerHTML = '<p>Sélectionnez un ami ou ajoutez en un pour commencer à discuter.</p>';
            }

            const friendList = document.getElementById('friend-list');

            // Add the "System" item to the list
            const systemItem = document.createElement('li');
            systemItem.dataset.chat = 'system';

            const systemNameSpan = document.createElement('span');
            systemNameSpan.classList.add('friend-name');
            systemNameSpan.textContent = 'System';

            systemItem.appendChild(systemNameSpan);
            systemItem.addEventListener('click', async () => await loadChat('AI'));
            if (!friendList) return;
            friendList.appendChild(systemItem);

            // Ajouter les amis à la liste
            friendsJson.friends.forEach(friends => {
                const listItem = document.createElement('li');
                listItem.dataset.chat = friends.id;

                const nameSpan = document.createElement('span');
                nameSpan.classList.add('friend-name');
                nameSpan.textContent = friends.username;

                // const previewSpan = document.createElement('span');
                // previewSpan.classList.add('last-message-preview');
                // previewSpan.textContent = friend.lastMessage;

                listItem.appendChild(nameSpan);

                listItem.addEventListener('click', async () => await loadChat(friends.username));
                friendList.appendChild(listItem);
            });

            // Charger le chat du premier ami par défaut
            if (friendsJson.length > 0) {
                loadChat(friends[0].username);
            }

            // Fonction pour envoyer un nouveau message
            function sendMessage() {
                const message = messageInput.value.trim();
                if (message) {
                    if (message.split(' ')[0] == '/invite') { // faire une requete api pour creer une game, recupere le gameId et l'envoyer
                        createGameChat().then(gameId => {
                            // console.log('gameId', gameId);
                            addMessage(`/invite ${gameId}`, 'sent');
                        }).catch(error => {
                            console.error(error);
                        });

                    }
                    else
                        addMessage(message, 'sent');
                    messageInput.value = ''; // Efface le champ de saisie

                    // Optionnel : Ajouter le message au chat de l'ami sélectionné
                    const selectedFriendId = document.querySelector('#friend-list li.selected')?.dataset.chat;
                    if (selectedFriendId) {
                        messages[selectedFriendId] = messages[selectedFriendId] || [];
                        messages[selectedFriendId].push(message);
                    }
                }
            }

            // Ajouter un gestionnaire d'événements pour le bouton d'envoi
            sendButton.addEventListener('click', sendMessage);

            // Optionnel : Ajouter un gestionnaire d'événements pour appuyer sur Entrée pour envoyer un message
            messageInput.addEventListener('keypress', function (event) {
                if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault(); // Évite de sauter une ligne
                    sendMessage();
                }
            });
        })
        .catch(error => {
            console.error(error);  // Gérer les erreurs
        });
}

function getFriendList() {
    return new Promise((resolve, reject) => {
        let url = "https://" + window.location.hostname + ":8000/friends/" + getCookie("userId") + "/";
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.withCredentials = true;
        xhr.onreadystatechange = async function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 201) {
                    let response = JSON.parse(xhr.responseText);
                    // console.log(response);  // La réponse est ici
                    resolve(response);      // Résoudre la promesse avec la réponse
                } else {
                    reject('Error: ' + xhr.responseText);  // Rejeter la promesse en cas d'erreur
                }
            }
        };
        xhr.send();
    });
}

function createGameChat() {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        let url = "https://localhost:8001/game/create";
        url = url.replace("localhost", window.location.hostname);
        xhr.withCredentials = true;
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {  // Requête terminée
                if (xhr.status === 200) {  // Succès de la requête
                    console.log('Game created');
                    var gameId = JSON.parse(xhr.responseText).game_id;
                    console.log("game id :" + gameId);
                    localStorage.setItem("gameId", gameId);
                    resolve(gameId);  // Résoudre la promesse avec l'ID de la partie
                } else {
                    console.log('Error creating game');
                    console.log(xhr.responseText);
                    reject(new Error('Failed to create game'));  // Rejeter la promesse
                }
            }
        };

        xhr.send("partyName=tmp&game=pong&gameType=custom&playerNumber=2&gameMode=ffa&map=0&ballSpeed=15&paddleSpeed=20");
    });
}
