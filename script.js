const API_KEY = "20e19274-c3b7-4efe-98b1-75b9ff461fa4";

const gamesGrid = document.getElementById("gamesGrid");
const featuredContent = document.getElementById("featuredContent");
const featuredCard = document.getElementById("featuredCard");
const teamSearch = document.getElementById("teamSearch");
const resetBtn = document.getElementById("resetBtn");

let allGames = [];

// Change this if you want a different season
const SEASON = 2024;

async function loadGames() {
  try {
    gamesGrid.innerHTML = `<div class="no-results">Loading games...</div>`;
    featuredContent.innerHTML = `<p>Loading featured game...</p>`;

    const response = await fetch(
      `https://api.balldontlie.io/v1/games?seasons[]=${SEASON}&per_page=12`,
      {
        headers: {
          Authorization: API_KEY
        }
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    allGames = data.data || [];

    if (allGames.length === 0) {
      featuredContent.innerHTML = "<p>No games found.</p>";
      gamesGrid.innerHTML = `<div class="no-results">No games available right now.</div>`;
      return;
    }

    renderFeatured(allGames[0]);
    renderGames(allGames);
    animateFeatured();
  } catch (error) {
    console.error("Error loading games:", error);
    featuredContent.innerHTML = `<p class="error-text">Failed to load featured game.</p>`;
    gamesGrid.innerHTML = `<div class="error-text">Could not load NBA data. Check your API key or endpoint.</div>`;
  }
}

function renderFeatured(game) {
  featuredContent.innerHTML = `
    <h3>${game.home_team.full_name} vs ${game.visitor_team.full_name}</h3>
    <p><strong>Date:</strong> ${formatGameDate(game.date)}</p>
    <p><strong>Home Score:</strong> ${game.home_team_score}</p>
    <p><strong>Visitor Score:</strong> ${game.visitor_team_score}</p>
    <p><strong>Season:</strong> ${game.season}</p>
    <span class="status">${game.status}</span>
  `;
}

function renderGames(games) {
  gamesGrid.innerHTML = "";

  if (games.length === 0) {
    gamesGrid.innerHTML = `<div class="no-results">No teams matched your search.</div>`;
    return;
  }

  games.forEach((game) => {
    const homeWon = game.home_team_score > game.visitor_team_score;
    const visitorWon = game.visitor_team_score > game.home_team_score;

    const card = document.createElement("div");
    card.className = "game-card";

    card.innerHTML = `
      <h3>${game.home_team.full_name} vs ${game.visitor_team.full_name}</h3>
      <p><strong>Date:</strong> ${formatGameDate(game.date)}</p>
      <p>
        <strong>Home:</strong> ${game.home_team_score}
        ${homeWon ? "🏆" : ""}
      </p>
      <p>
        <strong>Visitor:</strong> ${game.visitor_team_score}
        ${visitorWon ? "🏆" : ""}
      </p>
      <p><strong>Season:</strong> ${game.season}</p>
      <span class="status">${game.status}</span>
    `;

    gamesGrid.appendChild(card);
  });
}

function formatGameDate(dateString) {
  if (!dateString) {
    return "Unknown";
  }

  const date = new Date(dateString);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function animateFeatured() {
  featuredCard.style.opacity = "0";
  featuredCard.style.transform = "translateY(-50px)";

  popmotion.spring({
    from: 0,
    to: 1,
    stiffness: 140,
    damping: 12
  }).start((value) => {
    featuredCard.style.opacity = value;
    featuredCard.style.transform = `translateY(${(-50 + 50 * value)}px)`;
  });
}

teamSearch.addEventListener("input", function () {
  const searchValue = teamSearch.value.toLowerCase().trim();

  const filteredGames = allGames.filter((game) => {
    const homeTeam = game.home_team.full_name.toLowerCase();
    const visitorTeam = game.visitor_team.full_name.toLowerCase();

    return homeTeam.includes(searchValue) || visitorTeam.includes(searchValue);
  });

  renderGames(filteredGames);

  if (filteredGames.length > 0) {
    renderFeatured(filteredGames[0]);
    animateFeatured();
  } else {
    featuredContent.innerHTML = `<p>No featured game found for that team.</p>`;
  }
});

resetBtn.addEventListener("click", function () {
  teamSearch.value = "";
  renderGames(allGames);

  if (allGames.length > 0) {
    renderFeatured(allGames[0]);
    animateFeatured();
  }
});

loadGames();
