// A photographic entrance layered inside the existing fluid card-to-dialog shell.
// Only compositor opacity/transform animate; the source image and layout stay native.
export function mountFilmReveal(viewer,{preference=matchMedia('(prefers-reduced-motion:reduce)')}={}){
  const image=viewer.querySelector('figure img'),caption=viewer.querySelector('figcaption');
  let animations=[],sequence=0,closing=false;
  function cancel(){for(const animation of animations)animation.cancel();animations=[];}
  function settle(){
    if(viewer.open&&Object.hasOwn(viewer.dataset,'filmRevealing'))viewer.dispatchEvent(new Event('portfolio:fluid-settle'));
    ++sequence;cancel();closing=false;delete viewer.dataset.filmRevealing;
  }
  function enter(){
    settle();
    if(preference.matches||document.hidden||!viewer.open)return;
    const life=++sequence;viewer.dataset.filmRevealing='';
    try{
      animations=[
        image.animate([{opacity:0,transform:'scale(1.03)'},{opacity:1,transform:'scale(1)'}],{duration:1150,delay:180,easing:'cubic-bezier(.22,.61,.36,1)',fill:'both'}),
        caption.animate([{opacity:0,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],{duration:480,delay:560,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'})
      ];
      Promise.allSettled(animations.map(animation=>animation.finished)).then(()=>{if(life===sequence&&!closing)settle();});
    }catch{settle();}
  }
  function exit(){
    if(!Object.hasOwn(viewer.dataset,'filmRevealing')||closing)return;
    // Capture before cancellation so an early Escape never flashes the full photo.
    const poses=[image,caption].map(element=>{const style=getComputedStyle(element);return {opacity:Number(style.opacity),transform:style.transform};});
    ++sequence;closing=true;cancel();
    try{
      animations=[image,caption].map((element,index)=>element.animate([poses[index],{...poses[index],opacity:0}],{duration:index?100:160,easing:'ease-out',fill:'both'}));
      // Keep the final transparent pose until the native close/return has committed.
      for(const animation of animations)animation.finished.catch(()=>{});
    }catch{settle();}
  }
  const close=()=>{if(!viewer.open)settle();};
  const visibility=()=>{if(document.hidden)settle();};
  const motion=()=>{if(preference.matches)settle();};
  viewer.addEventListener('portfolio:fluid-enter-start',enter);
  viewer.addEventListener('portfolio:fluid-close-start',exit);
  viewer.addEventListener('close',close);
  document.addEventListener('visibilitychange',visibility);
  preference.addEventListener('change',motion);
  addEventListener('resize',settle,{passive:true});
  return {settle,destroy(){settle();viewer.removeEventListener('portfolio:fluid-enter-start',enter);viewer.removeEventListener('portfolio:fluid-close-start',exit);viewer.removeEventListener('close',close);document.removeEventListener('visibilitychange',visibility);preference.removeEventListener('change',motion);removeEventListener('resize',settle);}};
}
