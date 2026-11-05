/* Local physical sleeves and film focus; wayfinding-127 owns navigation. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  let frame = 0;
  function paint() {
    frame = 0;
    document.querySelectorAll('.personal-chapter .frame').forEach((picture, i) => {
      const box = picture.getBoundingClientRect();
      const active = !reduced.matches && fine.matches && innerWidth > 700 && box.bottom > -50 && box.top < innerHeight + 50;
      const drift = active ? Math.max(-10, Math.min(10, (innerHeight / 2 - box.top - box.height / 2) * .024)) * (i === 1 ? -.6 : 1) : 0;
      picture.style.setProperty('--film-drift', `${drift.toFixed(2)}px`);
    });
  }
  function requestPaint() { if (!frame) frame = requestAnimationFrame(paint); }
  document.querySelectorAll('a[href="#selected-work"],a[href="#about"],a[href="#contact"],a[href="#index"],a[data-page-jump]').forEach(link => link.addEventListener('click', event => {
    const target = document.querySelector(link.hash);
    if (!target) return;
    event.preventDefault();
    if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    target.scrollIntoView({ block: 'start', behavior: reduced.matches ? 'instant' : 'smooth' });
    target.tabIndex = -1;
    target.focus({ preventScroll:true });
    requestPaint();
  }));
  // Only the selected sleeve reacts, with native pointer/keyboard actions unchanged.
  document.querySelectorAll('.v-track').forEach(button => {
    const sleeve = button.querySelector('.sleeve');
    button.addEventListener('pointermove', event => {
      if (!fine.matches || reduced.matches || !button.classList.contains('selected')) return;
      const box = sleeve.getBoundingClientRect();
      sleeve.style.setProperty('--sleeve-x', `${(event.clientY - box.top - box.height / 2) / box.height * -7}deg`);
      sleeve.style.setProperty('--sleeve-y', `${(event.clientX - box.left - box.width / 2) / box.width * 7}deg`);
    });
    const reset = () => { sleeve.style.removeProperty('--sleeve-x'); sleeve.style.removeProperty('--sleeve-y'); };
    button.addEventListener('pointerleave', reset);
    button.addEventListener('click', reset);
  });
  addEventListener('scroll', requestPaint, { passive:true });
  addEventListener('resize', requestPaint, { passive:true });
  reduced.addEventListener('change', requestPaint);
  fine.addEventListener('change', requestPaint);
  document.fonts.ready.then(requestPaint);
  requestPaint();
})();

/* Original, dependency-free glass-light shader. No premium component source is used. */
(() => {
  document.querySelectorAll('#prismLight,#heroPrism').forEach(canvas => {
  const hero = canvas.id === 'heroPrism';
  const surface = canvas.closest(hero ? '.hero-light' : '.colophon');
  if (!surface) return;
  // Warm the footer's optics shortly before they enter, without competing with
  // the signature reveal for a WebGL context and synchronous shader work.
  let initialized=false;
  function initialize() {
  if(initialized)return;
  initialized=true;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const gl = canvas.getContext('webgl', { alpha:false, antialias:false, powerPreference:'low-power' });
  if (!gl) { canvas.hidden = true; return; }
  const vertex = 'attribute vec2 position;void main(){gl_Position=vec4(position,0.0,1.0);}';
  const fragment = `precision mediump float;
    uniform vec2 resolution;uniform vec2 pointer;uniform float time;uniform float paper;
    uniform vec3 paperBase;uniform float paperSign;
    float bloom(vec2 p,vec2 center,vec2 shape){vec2 q=(p-center)*shape;return exp(-dot(q,q));}
    void main(){
      vec2 uv=gl_FragCoord.xy/resolution;
      float aspect=resolution.x/resolution.y;
      vec2 p=vec2((uv.x-.5)*aspect,uv.y-.5);
      float angle=.36;mat2 rot=mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
      vec2 glass=rot*p;float rib=fract(glass.x*7.5);
      float bend=sin((rib-.5)*3.14159);
      vec2 q=uv+vec2(bend*.045,bend*.025);
      float drift=sin(time*.16)*.07;
      float green=bloom(q,vec2(.27+drift,.32),vec2(2.2,2.8));
      float amber=bloom(q,vec2(.73-drift,.18),vec2(2.7,3.7));
      float light=bloom(q,pointer,vec2(3.2,3.8))*.35;
      float seam=pow(max(0.,1.-abs(rib-.08)*10.),5.);
      float lens=.48+.52*cos((rib-.5)*2.8);
      vec3 base=vec3(.0627,.1059,.0824);
      vec3 glow=vec3(.10,.21,.13)*(green+light)+vec3(.29,.15,.055)*amber;
      vec3 col=base+glow*lens+seam*vec3(.036,.050,.033)*(green+amber);
      vec3 paperTint=vec3(.16,.23,.17)*green+vec3(.13,.09,.035)*amber;
      vec3 paperColor=paperBase+paperSign*paperTint*lens*.72+seam*vec3(.045,.04,.025);
      gl_FragColor=vec4(mix(min(col,vec3(.26,.32,.24)),paperColor,paper),1.);
    }`;
  function shader(type, source) {
    const item = gl.createShader(type); gl.shaderSource(item,source); gl.compileShader(item);
    if (!gl.getShaderParameter(item,gl.COMPILE_STATUS)) { gl.deleteShader(item); return null; }
    return item;
  }
  const vs=shader(gl.VERTEX_SHADER,vertex), fs=shader(gl.FRAGMENT_SHADER,fragment);
  if (!vs || !fs) { canvas.hidden=true; return; }
  const program=gl.createProgram(); gl.attachShader(program,vs); gl.attachShader(program,fs); gl.linkProgram(program);
  if (!gl.getProgramParameter(program,gl.LINK_STATUS)) { canvas.hidden=true; return; }
  gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  const uniforms={ resolution:gl.getUniformLocation(program,'resolution'), pointer:gl.getUniformLocation(program,'pointer'), time:gl.getUniformLocation(program,'time'), paper:gl.getUniformLocation(program,'paper'), paperBase:gl.getUniformLocation(program,'paperBase'), paperSign:gl.getUniformLocation(program,'paperSign') };
  let active=false, frame=0, until=0, previous=0, clock=16;
  let pointer={x:.55,y:.3}, target={x:.55,y:.3};
  function size() {
    const box=surface.getBoundingClientRect(),ratio=Math.min(1.25,devicePixelRatio||1);
    canvas.width=Math.max(1,Math.round(box.width*ratio));canvas.height=Math.max(1,Math.round(box.height*ratio));
    gl.viewport(0,0,canvas.width,canvas.height);cancelAnimationFrame(frame);frame=0;paint(performance.now());
  }
  function paint(now) {
    frame=0;
    const dt=Math.min(.05,Math.max(0,(now-previous)/1000));previous=now;
    if (!reduced.matches) { clock+=dt;pointer.x+=(target.x-pointer.x)*.09;pointer.y+=(target.y-pointer.y)*.09; }
    gl.uniform1f(uniforms.paper,hero?1:0);
    if(hero) {
      const base=(getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g)||[243,241,233]).slice(0,3).map(Number);
      gl.uniform3f(uniforms.paperBase,base[0]/255,base[1]/255,base[2]/255);
      gl.uniform1f(uniforms.paperSign,base[0]+base[1]+base[2]>382?-1:1);
    }
    gl.uniform2f(uniforms.resolution,canvas.width,canvas.height);
    gl.uniform2f(uniforms.pointer,pointer.x,pointer.y);gl.uniform1f(uniforms.time,clock);gl.drawArrays(gl.TRIANGLES,0,6);
    if(active&&!document.hidden&&!reduced.matches&&now<until) frame=requestAnimationFrame(paint);
  }
  function wake(duration=2200) {
    if (!active||document.hidden) return;
    until=performance.now()+duration;
    if(!frame) { previous=performance.now();frame=requestAnimationFrame(paint); }
  }
  new IntersectionObserver(([entry])=>{active=entry.isIntersecting;if(active)wake(hero?0:6500);else{cancelAnimationFrame(frame);frame=0;}},{threshold:.05}).observe(surface);
  surface.addEventListener('pointermove',event=>{
    if(reduced.matches||event.pointerType==='touch')return;
    const box=surface.getBoundingClientRect();target={x:(event.clientX-box.left)/box.width,y:1-(event.clientY-box.top)/box.height};wake();
  },{passive:true});
  new ResizeObserver(size).observe(surface);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else wake();});
  reduced.addEventListener('change',()=>{cancelAnimationFrame(frame);frame=0;paint(performance.now());});
  if(hero) new MutationObserver(()=>{paint(performance.now());if(!reduced.matches)wake(650);}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(frame);frame=0;canvas.hidden=true;});
  size();
  }
  if(hero)initialize();
  else {
    const approach=new IntersectionObserver(([entry])=>{
      if(!entry.isIntersecting)return;
      approach.disconnect();
      initialize();
    },{rootMargin:'400px 0px'});
    approach.observe(surface);
  }
  });
})();
