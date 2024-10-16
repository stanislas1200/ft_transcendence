/********************************* GESTION SPA *********************************/

async function loadPage(page, prevent, username) {

	cancelAllAnimationFrames()
    isGameLoopRunning = false
    await fetch('/' + page + '/', {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'  // Add this header to indicate an AJAX request
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            console.log(page);
            document.getElementById('spa-content').innerHTML = html;
            if (prevent == 1)
                window.history.pushState({}, '', `/${page}/${username ? `?${username}` : ''}`);
            if (username)
				searchUser(username);
            // If there are any specific scripts or functions to run for the page, you can call them here.
            // Example: if(page === 'page2') { initializePage2(); }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            // Optionally load an error page or show an error message
        });
    // console.log('page ' + page);
    testIfLoggedIn()
    switch (page) {
        case 'friend':
            getElementFriend();
            break;
        case 'game':
            getElementGame();
            break;
        case 'settings':
            loadSettings();
            break;
        case 'profile':
            loadProfile();
            break;
        case 'achievements':
            loadArchievements();
            break;
        case 'pong':
            loadPong();
            break;
        case 'localpong':
            loadLocalPong();
            break;
        case 'tournament':
            showTournamentInfo();
            break;
        case 'index':
            loadHome();
            break;
        case 'tron':
            loadTron();
            break;
        case 'gam':
            loadGam();
            break;
        case 'leaderboard':
            loadLeaderboard();
            break;
        default:
            break;
    }
}

window.onpopstate = function () {
    // // Handle the back/forward buttons properly
    const path = window.location.pathname.replace(/^\/+|\/+$/g, ''); // Trim leading/trailing slashes
    const queryString = window.location.search;
    const queryWithoutQuestionMark = queryString.substring(1); // get username ~.~
    loadPage(path || 'index', 2, queryWithoutQuestionMark); // Default to 'page1' if no path
    // loadPage();
};