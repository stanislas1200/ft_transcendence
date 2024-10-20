/********************************* GESTION SPA *********************************/

const CACHE_EXPIRATION_TIME = 60 * 60 * 1000; // 1 hour in milliseconds
const CACHE_VERSION = 'v1';

async function fetchPage(page, prevent, username, cacheKey) {
    await fetch('/' + page + '/', {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'  // Add this header to indicate an AJAX request
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    }).then(html => {
        console.log(page);
        document.getElementById('spa-content').innerHTML = html;
        try {
            sessionStorage.setItem(cacheKey, html);
            sessionStorage.setItem(`${cacheKey}-timestamp`, Date.now());
        }
        catch (e) {
            console.error('Unable to save to sessionStorage:', e);
        }
        if (prevent == 1)
            window.history.pushState({}, '', `/${page}/${username ? `?${username}` : ''}`);
        if (username)
            searchUser(username);
    }).catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}

async function loadPage(page, prevent, username) {

    cancelAllAnimationFrames()
    // destroyCharts()
    isGameLoopRunning = false
    stopTournamentInfo()

    const cacheKey = `${CACHE_VERSION}-${page}`;
    const cachedContent = sessionStorage.getItem(cacheKey);
    const cacheTimestamp = sessionStorage.getItem(`${cacheKey}-timestamp`);

    if (cachedContent && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_EXPIRATION_TIME)) {
        console.log('Cached content loaded');
        document.getElementById('spa-content').innerHTML = cachedContent;
        if (prevent == 1)
            window.history.pushState({}, '', `/${page}/${username ? `?${username}` : ''}`);
        if (username)
            searchUser(username);
    }
    else {
        await fetchPage(page, prevent, username, cacheKey);
    }
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
            if (!username)
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