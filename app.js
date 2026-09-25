const screens=[...document.querySelectorAll('.screen')];let step=1,drawing=false,hasSignature=false;const canvas=document.getElementById('signaturePad'),ctx=canvas.getContext('2d');
function showStep(n){step=n;screens.forEach(s=>s.classList.toggle('active',+s.dataset.step===n));document.getElementById('progressText').textContent=`${n} / 6`;if(n===4)resizeCanvas();window.scrollTo(0,0)}
function clearErrors(){document.querySelectorAll('.error').forEach(e=>e.textContent='')}
function validStep(n){clearErrors();if(n===2&&!document.getElementById('prenom').value.trim()||n===2&&!document.getElementById('nom').value.trim()){document.getElementById('identityError').textContent='Veuillez remplir le prénom et le nom.';return false}if(n===3&&(!regles.checked||!risques.checked)){rulesError.textContent='Veuillez cocher les deux cases.';return false}if(n===4&&!hasSignature){signatureError.textContent='Veuillez signer avant de continuer.';return false}if(n===5&&!finalAccept.checked){finalError.textContent='Veuillez confirmer votre inscription.';return false}return true}
document.querySelectorAll('[data-next]').forEach(b=>b.onclick=()=>{if(validStep(step))showStep(Math.min(6,step+1))});document.querySelectorAll('[data-prev]').forEach(b=>b.onclick=()=>showStep(Math.max(1,step-1)));
function resizeCanvas(){const r=canvas.getBoundingClientRect(),ratio=devicePixelRatio||1;canvas.width=r.width*ratio;canvas.height=r.height*ratio;ctx.setTransform(ratio,0,0,ratio,0,0);ctx.lineWidth=2;ctx.lineCap='round'}
function p(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
canvas.onpointerdown=e=>{drawing=true;canvas.setPointerCapture(e.pointerId);const q=p(e);ctx.beginPath();ctx.moveTo(q.x,q.y)}
canvas.onpointermove=e=>{if(!drawing)return;const q=p(e);ctx.lineTo(q.x,q.y);ctx.stroke();hasSignature=true}
canvas.onpointerup=()=>drawing=false;canvas.onpointercancel=()=>drawing=false;
function clearSignature(){ctx.clearRect(0,0,canvas.width,canvas.height);hasSignature=false;clearErrors()}clearSignature.onclick=clearSignature;
document.getElementById('clearSignature').onclick=clearSignature;
document.getElementById('restart').onclick=()=>location.reload();