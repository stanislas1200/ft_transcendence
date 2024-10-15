async function fetchLeaderboardData(game = 'all', time = 'all') {
	try {
		let url = "https://localhost:8001/game/leaderboard?game=" + game + "&time=" + time;
		url = url.replace("localhost", window.location.hostname);
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		const data = await response.json();

		renderLeaderboard(data);
	} catch (error) {
		console.error('There was a problem with the fetch operation:', error);
	}
}

async function fetchAvatarUrl(userId) {
	try {
		const response = await fetch(`https://localhost:8000/users/${userId}/avatar`);
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		const avatar = await response.text();
		return 'https://localhost:8000' + avatar;
	} catch (error) {
		console.error('There was a problem fetching the avatar:', error);
		return '';
	}
}

async function renderLeaderboard(data) {
	const leaderboardBody = document.getElementById('leaderboard-body');
	leaderboardBody.innerHTML = ""; // Clear previous rows

	// Update podium section
	document.querySelector('.player-card.rank-1 p.username').textContent = data[0].username;
	document.querySelector('.player-card.rank-1 p.username').dataset.username = data[0].username;
	document.querySelector('.player-card.rank-1 p:nth-of-type(2)').textContent = `${data[0].total_win} Wins / ${data[0].total_lost} Losses`;
	document.querySelector('.player-card.rank-1 img').src = await fetchAvatarUrl(data[0].id);

	document.querySelector('.player-card.rank-2 p.username').textContent = data[1].username;
	document.querySelector('.player-card.rank-2 p.username').dataset.username = data[1].username;
	document.querySelector('.player-card.rank-2 p:nth-of-type(2)').textContent = `${data[1].total_win} Wins / ${data[1].total_lost} Losses`;
	document.querySelector('.player-card.rank-2 img').src = await fetchAvatarUrl(data[1].id);

	document.querySelector('.player-card.rank-3 p.username').textContent = data[2].username;
	document.querySelector('.player-card.rank-3 p.username').dataset.username = data[2].username;
	document.querySelector('.player-card.rank-3 p:nth-of-type(2)').textContent = `${data[2].total_win} Wins / ${data[2].total_lost} Losses`;
	document.querySelector('.player-card.rank-3 img').src = await fetchAvatarUrl(data[2].id);

	document.querySelectorAll('.player-card').forEach(card => {
		card.addEventListener('click', async () => {
			const usernameElement = card.querySelector('.username');
			if (usernameElement) {
				await loadPage('friendProfile', 1);
				searchUser(usernameElement.dataset.username);
			}
		});
	});

	data.forEach((player, index) => {
		if (index >= 3) {
			const row = document.createElement('tr');
			row.innerHTML = `
				<td>${index + 1}</td>
				<td class="username">${player.username}</td>
				<td>${player.total_win}</td>
				<td>${player.total_lost}</td>
				`;
			row.addEventListener('click', async () => {
				await loadPage('friendProfile', 1);
				searchUser(player.username);
			});
			leaderboardBody.appendChild(row);
		}
	});
}

function filterLeaderboard() {
	const gameFilter = document.getElementById('game-filter').value;
	// const timeFilter = document.getElementById('time-filter').value;
	timeFilter = null;
	fetchLeaderboardData(gameFilter, timeFilter);
}

function loadLeaderboard() {
	fetchLeaderboardData();
}