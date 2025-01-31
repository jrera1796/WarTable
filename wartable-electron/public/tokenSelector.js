// Elements
const tokenSelectorPopup = document.getElementById("token-selector-popup");
const folderList = document.getElementById("folder-list");
const tokenGrid = document.getElementById("token-grid");
const searchInput = document.getElementById("searchInput");
const openTokenSelectorButton = document.getElementById("openTokenSelector");
const closeTokenSelectorButton = document.getElementById("closeTokenSelector");

let allTokens = [];
let currentFolder = "/tokens"; // Default folder

// Open Token Selector when clicking Players button
openTokenSelectorButton.addEventListener("click", () => {
    tokenSelectorPopup.classList.add("visible");
    fetchTokens();
});

// Close Token Selector
closeTokenSelectorButton.addEventListener("click", () => {
    tokenSelectorPopup.classList.remove("visible");
});

// Fetch Tokens from API
async function fetchTokens() {
    try {
        const response = await fetch("http://localhost:3000/api/tokens");
        allTokens = await response.json();
        displayFolders();
    } catch (error) {
        console.error("Error fetching tokens:", error);
        folderList.innerHTML = "<p>Failed to load tokens.</p>";
    }
}

// Display Folders in Sidebar
function displayFolders() {
    folderList.innerHTML = ""; // Clear previous folders
    const uniqueFolders = new Set();

    allTokens.forEach((item) => {
        if (item.type === "folder") {
            uniqueFolders.add(item.path);
        }
    });

    uniqueFolders.forEach((folder) => {
        const folderBtn = document.createElement("button");
        folderBtn.textContent = folder.split("/").pop(); // Get last part of path
        folderBtn.classList.add("folder-btn");

        folderBtn.addEventListener("dblclick", () => {
            currentFolder = folder;
            displayTokens();
        });

        folderList.appendChild(folderBtn);
    });
}

// Display Tokens in Grid
function displayTokens(searchTerm = "") {
    tokenGrid.innerHTML = ""; // Clear previous tokens

    const filteredTokens = allTokens.filter(
        (token) =>
            token.type === "token" &&
            token.folder === currentFolder &&
            token.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filteredTokens.forEach((token) => {
        const img = document.createElement("img");
        img.src = `http://localhost:3000${token.src}`;
        img.alt = token.name;
        img.className = "token";
        img.title = token.name;

        // Click to place token
        img.addEventListener("click", () => placeTokenOnMap(token));
        img.addEventListener("dragstart", (e) => startDragToken(e, token));

        tokenGrid.appendChild(img);
    });
}

// Search Functionality
searchInput.addEventListener("input", () => {
    displayTokens(searchInput.value);
});

// Placeholder: Drag and Drop Token
function startDragToken(event, token) {
    event.dataTransfer.setData("token", JSON.stringify(token));
}

// Placeholder: Click to Place Token
function placeTokenOnMap(token) {
    alert(`Placing token: ${token.name}`);
}
