let RC = 0;

// قيم Wong Halves
const VALUES_WONG = {
  "A": -0.5, "2": 0.5, "3": 1, "4": 1, "5": 1.5, "6": 1,
  "7": 0.5, "8": 0, "9": -0.5, "10": -1, "J": -1, "Q": -1, "K": -1
};

const RANKS = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
const SUITS = ["S","H","D","C"];

// صوت الضغط
const clickSound = new Audio("assets/sounds/click.mp3");

window.onload = () => {
  buildCardsGrid();
};

// بناء شبكة الأوراق
function buildCardsGrid() {
  const grid = document.getElementById("cardsGrid");
  grid.innerHTML = "";

  for (let r of RANKS) {
    for (let s of SUITS) {

      let img = document.createElement("img");
      img.src = `assets/cards/${r}${s}.png`;
      img.alt = r + s;

      img.onclick = () => {
        addToCount(r);
        clickSound.play();
      };

      grid.appendChild(img);
    }
  }
}

// إضافة للعداد
function addToCount(rank) {
  RC += VALUES_WONG[rank] || 0;
  document.getElementById("RC").innerText = RC.toFixed(2);
}
