// API base
const API_BASE = 'https://api.coingecko.com/api/v3';

// Frontend app state
const state = {
  coins: [],
  currency: localStorage.getItem('currency') || 'usd',
  watchlist: JSON.parse(localStorage.getItem('watchlist') || '[]'),
  portfolio: JSON.parse(localStorage.getItem('portfolio') || '[]')
};

// Elements/selectors
const selectors = {
  tableBody: document.querySelector('#coins-table tbody'),
  search: document.getElementById('search'),
  currencySelect: document.getElementById('currency-select'),
  gainersList: document.getElementById('gainers-list'),
  losersList: document.getElementById('losers-list'),
  marketCards: document.getElementById('market-cards'),
  newsList: document.getElementById('news-list'),
  convertAmount: document.getElementById('convert-amount'),
  convertFrom: document.getElementById('convert-from'),
  convertTo: document.getElementById('convert-to'),
  convertResult: document.getElementById('convert-result'),
  themeToggle: document.getElementById('theme-toggle')
};

// Legacy aliases used across the file
const searchInput = selectors.search;
const currencySelect = selectors.currencySelect;
const coinsTbody = selectors.tableBody;
const gainersList = selectors.gainersList;
const losersList = selectors.losersList;
const marketCards = selectors.marketCards;
const newsList = selectors.newsList;
const convertAmount = selectors.convertAmount;
const convertFrom = selectors.convertFrom;
const convertTo = selectors.convertTo;
const convertResult = selectors.convertResult;
const themeToggle = selectors.themeToggle;

let currentChart = null;


function fmt(n, currency = 'usd'){
  if(n===null || n===undefined) return '-';
  const opts = {maximumFractionDigits:2};
  return (currency==='usd' ? '$' : '') + Number(n).toLocaleString(undefined, opts);
}

function saveState(){
  localStorage.setItem('watchlist', JSON.stringify(state.watchlist));
  localStorage.setItem('portfolio', JSON.stringify(state.portfolio));
  localStorage.setItem('currency', state.currency);
}

// Fetch global market data
async function fetchGlobal(){
  try{
    const res = await fetch('https://api.coingecko.com/api/v3/global');
    const json = await res.json();
    const d = json.data;
    marketCards.innerHTML = `
      <div class="col-6 col-md-3 stat"><strong>Total Market Cap</strong><div>${fmt(d.total_market_cap[state.currency], state.currency)}</div></div>
      <div class="col-6 col-md-3 stat"><strong>24h Volume</strong><div>${fmt(d.total_volume[state.currency], state.currency)}</div></div>
      <div class="col-6 col-md-3 stat"><strong>BTC Dominance</strong><div>${(d.market_cap_percentage.btc||0).toFixed(2)}%</div></div>
      <div class="col-6 col-md-3 stat"><strong>Market Cap Change (24h)</strong><div>${(d.market_cap_change_percentage_24h_usd||0).toFixed(2)}%</div></div>
    `;
  }catch(e){console.warn('global fetch',e)}
}

// Fetch coins list
async function fetchCoins(){
  try{
    const perPage = 250;
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${state.currency}&order=market_cap_desc&per_page=${perPage}&page=1&sparkline=false`;
    const res = await fetch(url);
    const data = await res.json();
    state.coins = data;
    renderTable(data);
    renderGainersLosers(data);
  }catch(e){console.error(e)}
}

function renderGainersLosers(coins){
  const sorted = [...coins].sort((a,b)=>b.price_change_percentage_24h - a.price_change_percentage_24h);
  gainersList.innerHTML = '';
  losersList.innerHTML = '';
  sorted.slice(0,5).forEach(c=>{
    const li=document.createElement('li'); li.className='list-group-item bg-transparent border-0 text-white';
    li.innerHTML = `<span>${c.name}</span><strong class="${c.price_change_percentage_24h>=0?'positive':'negative'}">${c.price_change_percentage_24h?.toFixed(2)||0}%</strong>`;
    gainersList.appendChild(li);
  });
  sorted.slice(-5).reverse().forEach(c=>{
    const li=document.createElement('li'); li.className='list-group-item bg-transparent border-0 text-white';
    li.innerHTML = `<span>${c.name}</span><strong class="${c.price_change_percentage_24h>=0?'positive':'negative'}">${c.price_change_percentage_24h?.toFixed(2)||0}%</strong>`;
    losersList.appendChild(li);
  });
}

function renderTable(coins){
  coinsTbody.innerHTML = '';
  coins.forEach(coin=>{
    const tr = document.createElement('tr');
    tr.className='align-middle';
    tr.innerHTML = `
      <td>${coin.market_cap_rank}</td>
      <td><img src="${coin.image}" class="me-2"/> <strong>${coin.name}</strong><div class="small text-muted">${coin.symbol.toUpperCase()}</div></td>
      <td>${coin.symbol.toUpperCase()}</td>
      <td>${fmt(coin.current_price,state.currency)}</td>
      <td>${fmt(coin.market_cap,state.currency)}</td>
      <td class="${coin.price_change_percentage_24h>=0?'positive':'negative'}">${coin.price_change_percentage_24h?.toFixed(2)||0}%</td>
      <td>${fmt(coin.total_volume,state.currency)}</td>
      <td>${Number(coin.circulating_supply).toLocaleString()}</td>
    `;
    tr.addEventListener('click',()=>openCoinModal(coin.id));
    coinsTbody.appendChild(tr);
  });
}

// Sorting
document.querySelectorAll('#coins-table th[data-key]').forEach(th=>{
  th.style.cursor='pointer';
  th.addEventListener('click',()=>{
    const key = th.getAttribute('data-key');
    const sorted = [...state.coins].sort((a,b)=> (b[key]||0) - (a[key]||0));
    renderTable(sorted);
  });
});

// Search
searchInput.addEventListener('input',()=>{
  const q = searchInput.value.toLowerCase().trim();
  if(!q) return renderTable(state.coins);
  renderTable(state.coins.filter(c=>c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)));
});

// Currency change
currencySelect.addEventListener('change',async e=>{
  state.currency = e.target.value;
  saveState();
  await fetchGlobal();
  await fetchCoins();
});

// Theme toggle
themeToggle.addEventListener('click',()=>{
  document.body.classList.toggle('light');
  themeToggle.textContent = document.body.classList.contains('light')? 'Light' : 'Dark';
});

// Converter
async function convert(){
  const amount = Number(convertAmount.value)||1;
  const from = convertFrom.value;
  const to = convertTo.value;
  try{
    // If from is crypto symbol (btc/eth), use coin price; else use simple/price
    if(['btc','eth'].includes(from)){
      const coin = from==='btc'? 'bitcoin':'ethereum';
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=${to}`);
      const j = await res.json();
      const price = j[coin][to]||0;
      convertResult.textContent = `${amount} ${from.toUpperCase()} ≈ ${ (price*amount).toLocaleString() } ${to.toUpperCase()}`;
    }else{
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${to},${from}`);
      const j = await res.json();
      // fallback: treat 'from' as fiat
      convertResult.textContent = `${amount} ${from.toUpperCase()} ≈ ${amount} ${to.toUpperCase()} (use crypto->fiat conversion for precision)`;
    }
  }catch(e){console.warn(e)}
}
convertAmount.addEventListener('input',convert);
convertFrom.addEventListener('change',convert);
convertTo.addEventListener('change',convert);

// Coin modal and chart
const coinModalEl = document.getElementById('coinModal');
const coinModal = new bootstrap.Modal(coinModalEl);
const coinTitle = document.getElementById('coin-title');
const coinInfo = document.getElementById('coin-info');
const coinDesc = document.getElementById('coin-description');
const timeframeButtons = document.getElementById('timeframe-buttons');

const timeframes = [
  {label:'1H', days:0.0416667},
  {label:'24H', days:1},
  {label:'7D', days:7},
  {label:'30D', days:30},
  {label:'90D', days:90},
  {label:'1Y', days:365},
  {label:'ALL', days:'max'}
];

timeframes.forEach(tf=>{
  const btn = document.createElement('button'); btn.className='btn btn-sm btn-outline-light me-1'; btn.textContent=tf.label;
  btn.addEventListener('click',()=>loadChart(currentCoinId, tf.days));
  timeframeButtons.appendChild(btn);
});

let currentCoinId = null;

async function openCoinModal(id){
  currentCoinId = id;
  coinTitle.textContent = 'Loading...';
  coinInfo.innerHTML = '';
  coinDesc.innerHTML = '';
  coinModal.show();
  await loadCoinDetails(id);
  await loadChart(id,1);
}

async function loadCoinDetails(id){
  try{
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`);
    const j = await res.json();
    coinTitle.innerHTML = `<img src="${j.image.small}" class="me-2"/> ${j.name} <small class="text-muted">(${j.symbol.toUpperCase()})</small>`;
    coinInfo.innerHTML = `
      <div class="row">
        <div class="col-md-4"><strong>Rank</strong><div>${j.market_cap_rank||'-'}</div></div>
        <div class="col-md-4"><strong>Price</strong><div>${fmt(j.market_data.current_price[state.currency])}</div></div>
        <div class="col-md-4"><strong>Market Cap</strong><div>${fmt(j.market_data.market_cap[state.currency])}</div></div>
        <div class="col-md-4 mt-2"><strong>Fully Diluted Valuation</strong><div>${fmt(j.market_data.fully_diluted_valuation?.[state.currency])}</div></div>
        <div class="col-md-4 mt-2"><strong>Total Supply</strong><div>${j.market_data.total_supply||'-'}</div></div>
        <div class="col-md-4 mt-2"><strong>Circulating Supply</strong><div>${j.market_data.circulating_supply||'-'}</div></div>
        <div class="col-md-4 mt-2"><strong>All-Time High</strong><div>${fmt(j.market_data.ath?.[state.currency])}</div></div>
        <div class="col-md-4 mt-2"><strong>All-Time Low</strong><div>${fmt(j.market_data.atl?.[state.currency])}</div></div>
      </div>
      <div class="mt-3">
        <a href="${j.links.homepage[0]}" target="_blank" class="btn btn-sm btn-outline-light me-2">Website</a>
        ${j.links.repos_url?.homepage?.length? `<a href="${j.links.repos_url.homepage[0]}" target="_blank" class="btn btn-sm btn-outline-light">Code</a>`:''}
      </div>
    `;
    coinDesc.innerHTML = j.description.en ? j.description.en.split('\n')[0] : '';
  }catch(e){console.warn(e)}
}

async function loadChart(id, days){
  try{
    const p = days==='max'? 'max': days;
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=${state.currency}&days=${p}&interval=hourly`);
    const j = await res.json();
    const prices = j.prices || [];
    const volumes = j.total_volumes || [];
    const labels = prices.map(p=> new Date(p[0]).toLocaleString());
    const dataPrices = prices.map(p=>p[1]);
    const dataVolumes = volumes.map(v=>v[1]);

    const ctx = document.getElementById('priceChart').getContext('2d');
    if(currentChart) currentChart.destroy();
    currentChart = new Chart(ctx, {
      data:{
        labels,
        datasets:[
          {type:'line',label:'Price',data:dataPrices,borderColor:'#38bdf8',yAxisID:'y'},
          {type:'bar',label:'Volume',data:dataVolumes,backgroundColor:'rgba(255,255,255,0.08)',yAxisID:'y1'}
        ]
      },
      options:{
        scales:{
          y:{position:'left',ticks:{color:'#cfe8ff'}},
          y1:{position:'right',grid:{display:false},ticks:{color:'#cfe8ff'},beginAtZero:true}
        },
        plugins:{legend:{labels:{color:'#e6eef8'}}}
      }
    });
  }catch(e){console.warn(e)}
}

// News (using CoinGecko status updates as fallback)
async function fetchNews(){
  try{
    const res = await fetch('https://api.coingecko.com/api/v3/status_updates');
    const j = await res.json();
    const items = j.status_updates || [];
    newsList.innerHTML = '';
    items.slice(0,8).forEach(it=>{
      const li = document.createElement('li'); li.className='list-group-item bg-transparent border-0 text-white';
      li.innerHTML = `<div><strong>${it.project?.name||it.category}</strong> <div class="small text-muted">${new Date(it.created_at).toLocaleString()}</div><div>${it.description?.slice(0,180)}... <a href="${it.link}" target="_blank">read</a></div></div>`;
      newsList.appendChild(li);
    });
  }catch(e){console.warn(e)}
}

// Initial load
async function init(){
  await fetchGlobal();
  await fetchCoins();
  await fetchNews();
  convert();
}

init();
setInterval(()=>{ fetchGlobal(); fetchCoins(); fetchNews(); }, 60000);