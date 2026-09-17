document.addEventListener('DOMContentLoaded', ()=>{
  const select = document.getElementById('marketSelect');
  const ctx = document.getElementById('marketChart');
  let chart = null;

  async function fetchMarketChart(id='bitcoin'){
    const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=30`;
    const res = await fetch(url);
    if(!res.ok) throw new Error('Chart fetch failed');
    return res.json();
  }
  async function fetchMarketInfo(id='bitcoin'){
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${id}`;
    const res = await fetch(url);
    if(!res.ok) throw new Error('Info fetch failed');
    const arr = await res.json();
    return arr[0];
  }

  function renderInfo(info){
    if(!info) return;
    document.getElementById('ci-price').textContent = info.current_price ? `$${Number(info.current_price).toLocaleString()}` : '—';
    document.getElementById('ci-marketcap').textContent = info.market_cap ? `$${Number(info.market_cap).toLocaleString()}` : '—';
    document.getElementById('ci-change').textContent = info.price_change_percentage_24h ? `${info.price_change_percentage_24h.toFixed(2)}%` : '—';
    document.getElementById('ci-change').style.color = (info.price_change_percentage_24h||0) >=0 ? '#2ecc71' : '#ff4d4f';
  }

  async function update(id){
    try{
      const [chartData, info] = await Promise.all([fetchMarketChart(id), fetchMarketInfo(id)]);
      const labels = chartData.prices.map(p=>{
        const d = new Date(p[0]);
        return `${d.getMonth()+1}/${d.getDate()}`;
      });
      const values = chartData.prices.map(p=>p[1]);

      if(chart) { chart.data.labels = labels; chart.data.datasets[0].data = values; chart.options.plugins.title.text = id.toUpperCase(); chart.update(); }
      else {
        chart = new Chart(ctx,{ type:'line', data: { labels, datasets:[{ label: id+' price (USD)', data: values, borderColor: 'rgba(54,162,235,1)', backgroundColor:'rgba(54,162,235,0.15)', tension:0.15 }] }, options: { responsive:true, scales:{ x:{ ticks:{ color: getComputedStyle(document.documentElement).getPropertyValue('--text') } }, y:{ ticks:{ color: getComputedStyle(document.documentElement).getPropertyValue('--text') } } }, plugins:{ title:{ display:true, text: id.toUpperCase(), color: getComputedStyle(document.documentElement).getPropertyValue('--text') }, legend:{ labels:{ color: getComputedStyle(document.documentElement).getPropertyValue('--text') } } } } });
      }
      renderInfo(info);
    }catch(e){
      console.error(e);
    }
  }

  if(select){
    select.addEventListener('change', ()=> update(select.value));
    update(select.value);
  }
  // expose global updater so other scripts (coins table) can update the chart
  window.updateMarket = update;
});
