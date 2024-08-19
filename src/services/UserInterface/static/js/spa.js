/********************************* GESTION SPA *********************************/

function loadPage(page) {
	fetch('/' + page + '/')
		.then(response => response.text())
		.then(html => {
			document.getElementById('spa-content').innerHTML = html;
			window.history.pushState({}, '', '/' + page + '/');
		});
}

window.onpopstate = function () {
	location.reload();
};
