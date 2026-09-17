document.addEventListener('DOMContentLoaded', ()=>{
  const ctx = document.getElementById('priceChart')
  if(!ctx) return
  const labels = ['Jan','Feb','Mar','Apr','May','Jun']
  const data = { labels, datasets: [{ label: 'Price', backgroundColor: 'rgba(54,162,235,0.2)', borderColor: 'rgb(54,162,235)', data: [30000, 32000, 28000, 35000, 33000, 36000] }] }
  new Chart(ctx,{ type: 'line', data, options: { responsive: true } })
})
