/* Gestos entre pestañas: toque abre ficha; desplazamiento horizontal cambia pestaña.
   Solo interfaz. No lee ni modifica localStorage ni datos financieros. */
(() => {
  const tabs=['home','clients','movements','stock','supplier'];
  const cardSelector='.client-card,.product-open,.stock-product,.ledger-row,.stock-entry,.ibeco-history-entry';
  const controls='input,textarea,select,button,a,[contenteditable="true"],[role="slider"],.custom-picker,.calendar-grid,.picker-options,.ibeco-history-scroll,.ledger-scroll,.stock-ledger,.ibeco-history-panel,nav,aside,dialog';
  let tracking=null, suppressUntil=0;

  function horizontalScrollArea(element) {
    for(let n=element;n&&n!==document.body;n=n.parentElement){
      const style=getComputedStyle(n);
      if(n.scrollWidth>n.clientWidth+12 && /auto|scroll/.test(style.overflowX))return true;
    }
    return false;
  }
  function eligible(target){
    if(!(target instanceof Element))return false;
    const card=target.closest(cardSelector);
    // Las tarjetas son zonas de toque Y deslizamiento; los otros botones no.
    const control=target.closest(controls);
    if(control && control!==card)return false;
    if(target.closest('dialog,.custom-picker,nav,aside'))return false;
    return !horizontalScrollArea(target);
  }
  document.addEventListener('touchstart',ev=>{
    tracking=null;
    if(ev.touches.length!==1 || document.querySelector('dialog[open]') ||
       !tabs.includes(page) || !eligible(ev.target))return;
    const t=ev.touches[0];
    if(t.clientX<24 || t.clientX>innerWidth-24)return;
    tracking={x:t.clientX,y:t.clientY,start:Date.now(),axis:null};
  },{passive:true});

  document.addEventListener('touchmove',ev=>{
    if(!tracking || ev.touches.length!==1)return;
    const t=ev.touches[0],dx=t.clientX-tracking.x,dy=t.clientY-tracking.y;
    if(!tracking.axis && Math.hypot(dx,dy)>13)
      tracking.axis=Math.abs(dx)>Math.abs(dy)*1.45?'x':'y';
    // Evita selección y desplazamiento accidental cuando el gesto es horizontal.
    if(tracking.axis==='x' && ev.cancelable)ev.preventDefault();
  },{passive:false});

  document.addEventListener('touchcancel',()=>{tracking=null},{passive:true});
  document.addEventListener('touchend',ev=>{
    const g=tracking;tracking=null;
    if(!g || ev.changedTouches.length!==1 || document.querySelector('dialog[open]'))return;
    const t=ev.changedTouches[0],dx=t.clientX-g.x,dy=t.clientY-g.y;
    if(Date.now()-g.start>1100 || Math.abs(dx)<70 ||
       Math.abs(dx)<Math.abs(dy)*1.45 || g.axis==='y')return;
    // Suprime el click sintético tras un swipe sobre una tarjeta.
    suppressUntil=Date.now()+500;
    if(ev.cancelable)ev.preventDefault();
    const current=tabs.indexOf(page),next=current+(dx<0?1:-1);
    if(current<0 || next<0 || next>=tabs.length)return;
    page=tabs[next];selected=null;query='';filter='';
    render();
    window.scrollTo({top:0,behavior:'instant'});
  },{passive:false});

  document.addEventListener('click',ev=>{
    if(Date.now()<suppressUntil && ev.detail!==0){
      ev.preventDefault();ev.stopImmediatePropagation();
      suppressUntil=0;
    }
  },true);
})();
