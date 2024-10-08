function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}

function loadArchievements() { // /game/list_achievements?UserId={{UserId}}
    if (getCookie('userId') === null) {
        console.log('User not logged in');
        return;
    }
    var xhr = new XMLHttpRequest();
    var url = "https://" + window.location.hostname + ":8001/game/list_achievements?UserId=" + getCookie('userId');
    xhr.withCredentials = true;
    xhr.open("GET", url, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4)
            if (xhr.status === 200) {
                var archievements = JSON.parse(xhr.responseText);
                console.log(xhr.responseText);
                listAchievements(archievements);
            }
            else {
                console.log('Error loading archievements');
                console.log(xhr.responseText);
            }
    };
    xhr.send();
}

function listAchievements(achievements) { // this is a exemple of json {"unlocked": [{"id": 1, "name": "list achievements", "description": "list all achievements", "points": 0}], "locked": []}
    var achiveList = document.getElementById('achivements-table');
    if (!achiveList)
        return;
    for (var i = 0; i < achievements.unlocked.length; i++) {
        var newAchive = document.createElement('div');
        newAchive.className = 'achievement';
        newAchive.innerHTML = '<div class="icon-box"><i class="fa fa-trophy fa-2x achievement-trophy"></i></div><div class="achievement-info"><div class="achievement-name"><span>' + achievements.unlocked[i].name + '</span></div><div class="achievement-desc"><span>' + achievements.unlocked[i].description + '</span></div></div>';
        achiveList.appendChild(newAchive);
    }
    for (var i = 0; i < achievements.locked.length; i++) {
        var newAchive = document.createElement('div');
        newAchive.className = 'achievement';
        newAchive.className = 'disabled';
        newAchive.innerHTML = '<div class="icon-box"><i class="fa fa-trophy fa-2x achievement-trophy"></i></div><div class="achievement-info"><div class="achievement-name"><span>' + achievements.locked[i].name + '</span></div><div class="achievement-desc"><span>' + achievements.locked[i].description + '</span></div></div>';
        achiveList.appendChild(newAchive);
    }
}