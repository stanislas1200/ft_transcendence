function loadPage(page) {
    fetch('/' + page + '/', {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'  // Add this header to indicate an AJAX request
        }
    })
<<<<<<< HEAD
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
=======
        .then(response => response.text())
>>>>>>> 77a33aadd7b66de681c2d3c5fb0fd342e05c6d37
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
