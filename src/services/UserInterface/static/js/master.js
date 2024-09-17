function setActive(element, pageName) {
    // Retirer la classe 'active' de tous les liens
    const links = document.querySelectorAll('ul li a');
    links.forEach(link => {
        link.classList.remove('active');
    });

    // Ajouter la classe 'active' au lien cliqué
    element.classList.add('active');

    // Charger la page correspondante
    loadPage(pageName);
}

