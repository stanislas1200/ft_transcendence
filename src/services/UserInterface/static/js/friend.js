let friendList;
let chatArea;
let messageInput;
let sendButton;

function getElementFriend() {
    friendList = document.getElementById('friend-list');
    chatArea = document.getElementById('chat-area');
    messageInput = document.getElementById('message-input');
    sendButton = document.getElementById('send-button');
    chat();
}

function chat() {
    // let friendsJson;
    getFriendList()
        .then(response => {
            console.log("Liste des amis :", response);  // Utilisation de la réponse ici
            let friendsJson = response;

            console.log(friendsJson);

            // Fonction pour ajouter un message à la zone de chat
            function addMessage(message, type) {
                const messageElement = document.createElement('div');
                messageElement.classList.add('message', type);
                messageElement.textContent = message;
                chatArea.appendChild(messageElement);

                // Faire défiler vers le bas pour afficher le dernier message
                chatArea.scrollTop = chatArea.scrollHeight;
                if (type === 'sent') {
                    chatSocket.send(JSON.stringify({
                        'message': message
                    }));
                }
            }

            // Fonction pour charger le chat d'un ami
            function loadChat(chatusername) {
                // Effacer le contenu actuel du chat
                chatArea.innerHTML = '';

                // Demarrer une websocket avec le username de l'ami
                chatSocket = new WebSocket(
                    'wss://' + window.location.hostname + ':8002/ws/chat/' + getCookie("userId") + '/' + chatusername + '/' + getCookie("token") + '/'
                );

                chatSocket.onopen = function (e) {
                    console.log('socket open');
                };

                chatSocket.onmessage = function (e) {
                    const data = JSON.parse(e.data);
                    console.log('message socket ', data);
                    if (data.sender === chatusername)
                        addMessage(data.message, 'received');
                };


                // Ajouter les messages de l'ami sélectionné
                /*if (messages[chatId]) {
                    messages[chatId].forEach(msg => {
                        addMessage(msg, 'received');
                    });
        
                    // Ajouter un message d'exemple
                } else {
                    addMessage('This is a new message.', 'sent');
                } */
                chatArea.innerHTML = '<p>Sélectionnez un ami ou ajoutez en un pour commencer à discuter.</p>';
            }

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
                // listItem.appendChild(previewSpan);

                listItem.addEventListener('click', () => loadChat(friends.username));
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
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 201) {
                    let response = JSON.parse(xhr.responseText);
                    console.log(response);  // La réponse est ici
                    resolve(response);      // Résoudre la promesse avec la réponse
                } else {
                    reject('Error: ' + xhr.responseText);  // Rejeter la promesse en cas d'erreur
                }
            }
        };
        xhr.send();
    });
}
