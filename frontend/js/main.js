document.addEventListener('DOMContentLoaded', ()=>{
  // simple form handlers (placeholders)
  const login = document.getElementById('loginForm')
  if(login) login.addEventListener('submit', e=>{ e.preventDefault(); alert('Login wired to backend API'); })
  const reg = document.getElementById('registerForm')
  if(reg) reg.addEventListener('submit', e=>{ e.preventDefault(); alert('Register wired to backend API'); })
})
