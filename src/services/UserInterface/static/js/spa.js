function loadPage(page) {
    fetch('/' + page + '/', {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'  // Add this header to indicate an AJAX request
        }
    })
        .then(response => response.text())
        .then(html => {
            document.getElementById('spa-content').innerHTML = html;
            window.history.pushState({}, '', '/' + page + '/');
        });
}

// window.onpopstate = function () {
//     fetch(window.location.pathname)
//         .then(response => response.text())
//         .then(html => {
//             document.getElementById('spa-content').innerHTML = html;
//         });
// };
