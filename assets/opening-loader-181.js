// The name and essential hero controls have their own small entries. Keep shader
// compilation and navigation map construction out of the finite name reveal.
export function afterHeroReveal(start,{doc=document,schedule=setTimeout,unschedule=clearTimeout,nextFrame=requestAnimationFrame}={}) {
 let admitted=false,timer;
 function admit(){
  if(admitted)return;admitted=true;unschedule(timer);
  doc.removeEventListener('portfolio:signaturesettled',admit);
  // Let the final name frame reach the compositor before running decoration.
  nextFrame(()=>nextFrame(start));
 }
 doc.addEventListener('portfolio:signaturesettled',admit,{once:true});
 // A failed/blocked signature module must never strand native navigation.
 timer=schedule(admit,3500);
 if(doc.documentElement.dataset.signatureSettled==='true'||!doc.documentElement.classList.contains('signature-pending')&&!doc.querySelector('.name-prism'))admit();
 return admit;
}

if(typeof document!=='undefined')afterHeroReveal(()=>{
 import('../design/footer-basecamp-175/portfolio-preview.bundle.js?v=181').catch(()=>document.documentElement.classList.remove('navigation-pending'));
});
