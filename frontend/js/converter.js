document.addEventListener('DOMContentLoaded', ()=>{
  const btn = document.getElementById('conv-calc')
  const swap = document.getElementById('conv-swap')
  const amountEl = document.getElementById('conv-amount')
  const fromEl = document.getElementById('conv-from')
  const toEl = document.getElementById('conv-to')
  const resultEl = document.getElementById('conv-result')

  async function convert(){
    const amount = Number(amountEl.value) || 0
    const from = fromEl.value
    const to = toEl.value
    if(!amount || !from || !to) { resultEl.textContent = 'Invalid input'; return }

    try{
      // CoinGecko simple/price supports crypto -> fiat directly
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(from)}&vs_currencies=${encodeURIComponent(to)}`
      const res = await fetch(url)
      if(!res.ok) throw new Error('Price fetch failed')
      const data = await res.json()
      const rate = data[from] && data[from][to]
      if(typeof rate === 'undefined') { resultEl.textContent = 'Rate unavailable'; return }
      const converted = amount * rate
      // format
      const formatted = (to === 'usd' || to === 'eur' || to === 'gbp') ? new Intl.NumberFormat(undefined,{style:'currency',currency:to.toUpperCase()}).format(converted) : Number(converted).toLocaleString()
      resultEl.textContent = `${formatted} (${to.toUpperCase()})`;
    }catch(e){
      console.error(e)
      resultEl.textContent = 'Error fetching rate';
    }
  }

  if(btn) btn.addEventListener('click', e=>{ e.preventDefault(); convert(); })
  if(swap) swap.addEventListener('click', e=>{ e.preventDefault(); const a = fromEl.value; fromEl.value = toEl.value; toEl.value = a; })
})
