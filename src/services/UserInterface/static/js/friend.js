document.addEventListener('DOMContentLoaded', function () {
    // Données d'exemple pour les amis
    const friends = [
        { id: 'chat1', name: 'Alice', lastMessage: 'Hello Alice!' },
        { id: 'chat2', name: 'Bob', lastMessage: 'What’s up?' },
        { id: 'chat3', name: 'Charlie', lastMessage: 'Long time no see!' }
    ];

    const messages = {
        chat1: ['Hello Alice!', 'How are you?'],
        chat2: ['Hi Bob!', 'What’s up?'],
        chat3: ['Hey Charlie!', 'Long time no see!']
    };

    const friendList = document.getElementById('friend-list');
    const chatArea = document.getElementById('chat-area');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');

    // Fonction pour ajouter un message à la zone de chat
    function addMessage(message, type) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', type);
        messageElement.textContent = message;
        chatArea.appendChild(messageElement);

        // Faire défiler vers le bas pour afficher le dernier message
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    // Fonction pour charger le chat d'un ami
    function loadChat(chatId) {
        // Effacer le contenu actuel du chat
        chatArea.innerHTML = '';

        // Ajouter les messages de l'ami sélectionné
        if (messages[chatId]) {
            messages[chatId].forEach(msg => {
                addMessage(msg, 'received');
            });

            // Ajouter un message d'exemple
            addMessage('This is a new message.', 'sent');
        } else {
            chatArea.innerHTML = '<p>Sélectionnez un ami pour commencer à discuter.</p>';
        }
    }

    // Ajouter les amis à la liste
    friends.forEach(friend => {
        const listItem = document.createElement('li');
        listItem.dataset.chat = friend.id;

        const nameSpan = document.createElement('span');
        nameSpan.classList.add('friend-name');
        nameSpan.textContent = friend.name;

        const previewSpan = document.createElement('span');
        previewSpan.classList.add('last-message-preview');
        previewSpan.textContent = friend.lastMessage;

        listItem.appendChild(nameSpan);
        listItem.appendChild(previewSpan);

        listItem.addEventListener('click', () => loadChat(friend.id));
        friendList.appendChild(listItem);
    });

    // Charger le chat du premier ami par défaut
    if (friends.length > 0) {
        loadChat(friends[0].id);
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
});
