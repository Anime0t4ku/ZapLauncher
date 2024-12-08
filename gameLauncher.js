let misterIP = localStorage.getItem("misterIP") || "";
document.getElementById("ip-input").value = misterIP;
let zaparooSocket;

function updateMisterIP() {
  const ipInput = document.getElementById("ip-input").value.trim();
  if (ipInput) {
    misterIP = ipInput;
    localStorage.setItem("misterIP", misterIP);
    console.log(`MiSTer FPGA IP updated to: ${misterIP}`);
    connectToWebSocket();
  } else {
    alert("Please enter a valid IP address.");
  }
}

function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (
      +c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
    ).toString(16)
  );
}

function newApiPayload(method, params) {
  return {
    jsonrpc: "2.0",
    method: method,
    params: params,
    id: uuidv4(),
  };
}

function mediaSearchPayload(query, systems) {
  return newApiPayload("media.search", {
    query: query,
    systems: systems,
  });
}

function connectToWebSocket() {
  if (zaparooSocket) zaparooSocket.close();
  const ZAPAROO_WS_URL = `ws://${misterIP}:7497`;
  zaparooSocket = new WebSocket(ZAPAROO_WS_URL);

  zaparooSocket.onopen = () => {
    console.log("Connected to Zaparoo WebSocket");
    zaparooSocket.send(JSON.stringify(mediaSearchPayload("", ["SNES"])));
  };

  zaparooSocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("Received data:", data);

    if (data.type === "game_update") addGameToUI(data.system, data.game);
    else if (data.type === "game_list")
      populateGamesGrid(data.system, data.games);
  };

  zaparooSocket.onclose = () =>
    console.error("Disconnected from Zaparoo WebSocket");
  zaparooSocket.onerror = (error) => console.error("WebSocket error:", error);
}

function fetchGames(system) {
  console.log(`Fetching games for system: ${system}`);
}

function populateGamesGrid(system, games) {
  const gamesGrid = document.getElementById("games-grid");
  const systemsGrid = document.getElementById("systems-grid");

  systemsGrid.style.display = "none";
  gamesGrid.innerHTML = "";
  gamesGrid.style.display = "grid";

  games.forEach((game) => addGameToUI(system, game));
}

function addGameToUI(system, game) {
  const gamesGrid = document.getElementById("games-grid");

  const gameDiv = document.createElement("div");
  gameDiv.className = "game";
  gameDiv.onclick = () => displayGameDetails(game);

  const img = document.createElement("img");
  img.src = game.boxArtUrl || "placeholder.png";
  img.alt = game.title;

  const title = document.createElement("p");
  title.textContent = game.title;

  gameDiv.appendChild(img);
  gameDiv.appendChild(title);
  gamesGrid.appendChild(gameDiv);
}

function displayGameDetails(game) {
  const gameDetails = document.getElementById("game-details");
  const gamesGrid = document.getElementById("games-grid");

  gamesGrid.style.display = "none";
  document.getElementById("game-cover").src =
    game.boxArtUrl || "placeholder.png";
  document.getElementById("game-title").textContent = game.title;
  document.getElementById("game-description").textContent =
    game.description || "No description available.";

  const launchButton = document.getElementById("launch-button");
  launchButton.onclick = () => (window.location.href = game.launchUrl);

  gameDetails.style.display = "block";
}

function returnToGamesGrid() {
  const gamesGrid = document.getElementById("games-grid");
  const gameDetails = document.getElementById("game-details");
  gameDetails.style.display = "none";
  gamesGrid.style.display = "grid";
}

connectToWebSocket();
