// Suits and Ranks
const suits = ["C", "D", "H", "S"]; 
const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

// Generate Card Deck
function generateDeck() {
    let deck = [];
    for (let suit of suits) {
        for (let rank of ranks) {
            let cardName = `${rank}${suit}.svg`;
            deck.push({
                name: `${rank}${suit}`,
                img: `./cards/${cardName}`
            });
        }
    }
    return deck;
}

// Render Deck
function renderDeck() {
    const container = document.getElementById("cardsContainer");
    const deck = generateDeck();
    container.innerHTML = "";

    deck.forEach(card => {
        const img = document.createElement("img");
        img.src = card.img;
        img.alt = card.name;
        img.className = "card";
        container.appendChild(img);
    });
}

// Run
window.onload = renderDeck;
