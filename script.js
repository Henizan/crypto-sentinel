// ===== NAVIGATION =====
document.querySelectorAll(".menu").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".menu").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById(btn.dataset.page).classList.add("active");
  };
});

// ===== CONFIG =====
const COINS = [
  { name:"BTC / USDT", symbol:"BTCUSDT" },
  { name:"ETH / USDT", symbol:"ETHUSDT" },
  { name:"SOL / USDT", symbol:"SOLUSDT" },
  { name:"XRP / USDT", symbol:"XRPUSDT" }
];

const INTERVAL = "1h";
const LIMIT = 60;

// ===== API =====
async function fetchCloses(symbol) {
  const r = await fetch(
    `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${INTERVAL}&limit=${LIMIT}`
  );
  const d = await r.json();
  return d.map(c => parseFloat(c[4]));
}

// ===== INDICATORS =====
function RSI(v,p=14){
  if(v.length<=p) return 50;
  let g=0,l=0;
  for(let i=1;i<=p;i++){
    const d=v[i]-v[i-1];
    d>=0?g+=d:l-=d;
  }
  const rs=(g/p)/(l/p||1);
  return 100-(100/(1+rs));
}

function EMA(v,p){
  const k=2/(p+1); let e=v[0];
  return v.map(x=>e=x*k+e*(1-k));
}

function MACD(v){
  const ema12=EMA(v,12);
  const ema26=EMA(v,26);
  const m=ema12.map((x,i)=>x-ema26[i]);
  const s=EMA(m.slice(26),9);
  return {macd:m.at(-1), signal:s.at(-1)};
}

function signal(rsi,macd){
  if(rsi<45 && macd.macd>macd.signal) return ["SIGNAL LONG","buy"];
  if(rsi>55 && macd.macd<macd.signal) return ["VENTE","sell"];
  return ["AUCUN SIGNAL","neutral"];
}

// ===== DRAW CHART =====
function drawChart(canvas, prices, cls){
  const ctx=canvas.getContext("2d");
  const w=canvas.width=canvas.offsetWidth;
  const h=canvas.height=canvas.offsetHeight;

  const min=Math.min(...prices);
  const max=Math.max(...prices);

  ctx.clearRect(0,0,w,h);

  // Price line
  ctx.beginPath();
  prices.forEach((p,i)=>{
    const x=i*(w/(prices.length-1));
    const y=h-((p-min)/(max-min))*h;
    i?ctx.lineTo(x,y):ctx.moveTo(x,y);
  });
  ctx.strokeStyle="#e5e7eb";
  ctx.lineWidth=2;
  ctx.stroke();

  // Signal line
  if(cls!=="neutral"){
    ctx.beginPath();
    ctx.moveTo(w-30,0);
    ctx.lineTo(w-30,h);
    ctx.strokeStyle=cls==="buy"?"#4ade80":"#f87171";
    ctx.lineWidth=3;
    ctx.stroke();
  }
}

// ===== UPDATE MARKET =====
async function updateMarket(){
  market.innerHTML="";

  for(const c of COINS){
    const prices=await fetchCloses(c.symbol);
    const last=prices.at(-1).toFixed(2);
    const rsi=RSI(prices);
    const macd=MACD(prices);
    const [sig,cls]=signal(rsi,macd);

    if(c.symbol==="BTCUSDT")
      btcStat.innerHTML=`PRIX BTC<br><b>$${last}</b>`;

    const card=document.createElement("div");
    card.className="card";
    card.innerHTML=`
      <header><b>${c.name}</b><span>$${last}</span></header>
      <canvas></canvas>
      <div class="badges">
        <span class="badge ${cls}">RSI ${rsi.toFixed(1)}</span>
        <span class="badge ${cls}">
          ${macd.macd>macd.signal?"MACD ACHAT":"MACD VENTE"}
        </span>
      </div>
      <div class="signal ${cls}">${sig}</div>
    `;
    market.appendChild(card);

    drawChart(card.querySelector("canvas"), prices, cls);
  }
}

updateMarket();
setInterval(updateMarket,60000);

// ===== PROFIL =====
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const strategySelect = document.getElementById("strategy");
const saveBtn = document.getElementById("saveProfile");
const statusText = document.getElementById("profileStatus");

// Charger profil
function loadProfile(){
  const data = JSON.parse(localStorage.getItem("profile"));
  if(!data) return;

  nameInput.value = data.name;
  emailInput.value = data.email;
  strategySelect.value = data.strategy;
}

// Sauvegarder profil
saveBtn.onclick = () => {
  const profile = {
    name: nameInput.value,
    email: emailInput.value,
    strategy: strategySelect.value
  };

  localStorage.setItem("profile", JSON.stringify(profile));
  statusText.textContent = "Profil sauvegardé ✔️";
};

// Init profil
loadProfile();
