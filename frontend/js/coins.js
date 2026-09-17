async function fetchCoins(){
  // Placeholder URL - expects backend REST API at /api/coins
  try{
    const res = await fetch('/api/coins')
    const data = res.ok ? await res.json() : []
    renderCoins(data)
  }catch(e){
    console.error(e)
    // fallback: fetch top coins from CoinGecko
    try{
      const res2 = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false')
      const data2 = await res2.json()
      // normalize to expected fields
      const normalized = data2.map(c=>({ id: c.id, name: c.name, symbol: c.symbol.toUpperCase(), price: c.current_price ? `$${Number(c.current_price).toLocaleString()}` : '—' }))
      renderCoins(normalized)
    }catch(err){
      console.error(err)
      renderCoins([])
    }
  }
}
function renderCoins(coins){
  const container = document.getElementById('coins-table')
  if(!container) return
  const list = coins.length? coins : [{id:'bitcoin',name:'Bitcoin',symbol:'BTC',price: '—'}]
  const rows = list.map(c=>
    `<tr data-coin-id="${c.id}"><td><a class="coin-link" href="coin-details.html?id=${c.id}">${c.name}</a></td><td>${c.symbol}</td><td>${c.price}</td></tr>`
  ).join('')
  container.innerHTML = `<table class="table table-striped"><thead><tr><th>Name</th><th>Symbol</th><th>Price</th></tr></thead><tbody>${rows}</tbody></table>`

  // wire row clicks to update the market chart (if available)
  const rowsEls = container.querySelectorAll('tr[data-coin-id]')
  rowsEls.forEach(r=>{
    r.addEventListener('click', e=>{
      const id = r.getAttribute('data-coin-id')
      if(window.updateMarket) {
        // set selector if present
        const sel = document.getElementById('marketSelect')
        if(sel) sel.value = id
        window.updateMarket(id)
      } else {
        // fallback: navigate to details
        const link = r.querySelector('.coin-link')
        if(link) window.location.href = link.href
      }
    })
  })
}

fetchCoins()
