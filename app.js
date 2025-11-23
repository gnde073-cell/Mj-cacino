// --- Basic Blackjack + Wong Halves counter (3D site ready) ---

// card images expected in: assets/cards/ e.g. "A_S.svg" or "A-S.png"
// we'll use labels like "A♠" internally, but images path will be "assets/cards/{rank}{suitCode}.svg"
// suit codes: S,H,D,C

const valuesWongHalves = {
  "A": -0.5, "2": 0.5, "3": 1, "4": 1, "5": 1.5, "6": 1,
  "7": 0.5, "8": 0, "9": -0.5, "10": -1, "J": -1, "Q": -1, "K": -1
};

let deck = [], player = [], dealer = [];
let RC = 0; // running count
let historyCards = [];

const suits = ["S","H","D","C"];
const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

function buildDeck(decks=6){
  deck = [];
  for(let d=0; d<decks; d++){
    for(let s of suits){
      for(let r of ranks){
        deck.push({r,s,code: r + s});
      }
    }
  }
  shuffle(deck);
}

function shuffle(a){ for(let i=a.length-1;i>0;i--){ let j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } }

function draw(){
  if(deck.length===0) { buildDeck(parseFloat(document.getElementById('decks').value||6)); }
  return deck.pop();
}

function cardDisplayName(c){ return c.r + (c.s==='S'?'♠': c.s==='H'?'♥': c.s==='D'?'♦':'♣'); }

function startGame(){
  buildDeck(parseFloat(document.getElementById('decks').value||6));
  player = [draw(), draw()];
  dealer = [draw(), draw()];
  updateButtons(true);
  updateUI("جولة جديدة بدأت");
  // update cards images
  renderHands();
}

function hit(){
  player.push(draw());
  renderHands();
  if(handValue(player) > 21) {
    updateUI("خسرت — مجموعك فوق 21");
    updateButtons(false);
  } else updateUI("سحبت بطاقة");
}

function stand(){
  while(handValue(dealer) < 17) dealer.push(draw());
  const p = handValue(player), d = handValue(dealer);
  if(d>21 || p>d) updateUI("ربحت 🎉");
  else if(p<d) updateUI("خسرت ❌");
  else updateUI("تعادل");
  updateButtons(false); renderHands();
}

function handValue(hand){
  let total=0, aces=0;
  for(let c of hand){
    let n=c.r;
    if(["J","Q","K"].includes(n)) total += 10;
    else if(n==="A"){ total += 11; aces++; }
    else total += parseInt(n);
  }
  while(total>21 && aces>0){ total -= 10; aces--; }
  return total;
}

function updateButtons(inPlay){
  document.getElementById('btnHit').disabled = !inPlay;
  document.getElementById('btnStand').disabled = !inPlay;
}

function renderHands(){
  const pDiv = document.getElementById('playerCards');
  const dDiv = document.getElementById('dealerCards');
  pDiv.innerHTML = ''; dDiv.innerHTML = '';
  for(let c of player){
    pDiv.appendChild(makeCardElement(c));
  }
  for(let c of dealer){
    dDiv.appendChild(makeCardElement(c));
  }
}

// make card DOM (image). clicking it will register it in the count too (for manual tracking)
function makeCardElement(c){
  const img = document.createElement('img');
  // path attempts: assets/cards/A_S.svg or A-S.png ; we choose format: rank + suit + .svg (e.g. A S => A_S.svg)
  const suitMap = {S:'S',H:'H',D:'D',C:'C'};
  const fname = `${c.r}${suitMap[c.s]}.svg`; // ensure your assets name like "A S" -> "AS.svg" or "A_S.svg"
  img.src = `assets/cards/${fname}`;
  img.alt = cardDisplayName(c);
  img.className = 'cardImg';
  img.onclick = ()=> { addCardToCount(c); playClick(); };
  img.onerror = ()=>{ // fallback: generate small label element if image missing
    const label = document.createElement('div');
    label.className='card cardLabel';
    label.innerText = cardDisplayName(c);
    return label;
  };
  return img;
}

/* ----- Counting functions ----- */

function addCardToCount(card){
  // card is object {r,s}
  historyCards.push(card.r + card.s);
  RC += (valuesWongHalves[card.r] || 0);
  updateCountUI();
}

function updateCountUI(){
  document.getElementById('RC').innerText = RC.toFixed(2);
  let decksRem = parseFloat(document.getElementById('decks').value||6);
  if(decksRem<=0) decksRem = 1;
  const TC = RC / decksRem;
  document.getElementById('TC').innerText = TC.toFixed(2);
  document.getElementById('history').innerText = historyCards.join(' ');
  // bet suggestion: proportional to TC * bankroll
  const bank = parseFloat(document.getElementById('bank').value||1000);
  let bet = 0;
  if(TC <= 0) bet = Math.round(bank * 0.01);
  else if(TC < 1) bet = Math.round(bank * 0.02);
  else if(TC < 2) bet = Math.round(bank * 0.04);
  else bet = Math.round(bank * 0.08);
  document.getElementById('bet').innerText = bet + " (₪)";
}

function resetCount(){
  RC = 0; historyCards = [];
  updateCountUI();
}

/* create clickable card grid for manual counting (so user can click any card from deck) */
function buildCardsGrid(){
  const grid = document.getElementById('cardsGrid');
  grid.innerHTML = '';
  // show ranks simplified: A..K for suits S,H,D,C -> small thumbnails (expect files AS.svg AH.svg ...)
  for(let r of ranks){
    for(let s of suits){
      const img = document.createElement('img');
      img.src = `assets/cards/${r}${s}.svg`;
      img.alt = r+s;
      img.title = r + (s==='S'?'♠':s==='H'?'♥':s==='D'?'♦':'♣');
      img.onclick = ()=>{ addCardToCount({r,s}); playClick(); };
      grid.appendChild(img);
    }
  }
}

/* download history CSV */
function downloadCSV(){
  const csv = "card\n" + historyCards.join("\n");
  const blob = new Blob([csv], {type:'text/csv'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'history.csv';
  a.click();
}

/* sounds */
function playClick(){ const s=document.getElementById('clickSound'); if(s){ s.currentTime=0; s.play().catch(()=>{}); } }

/* splash handling */
window.onload = function(){
  // play money sound quickly when splash shown
  const ms = document.getElementById('moneySound');
  if(ms){ ms.play().catch(()=>{}); }
  // after 5s remove splash
  setTimeout(()=> {
    const sp = document.getElementById('splash');
    if(sp) sp.style.display='none';
  },5000);

  buildCardsGrid();
  updateCountUI();
};
