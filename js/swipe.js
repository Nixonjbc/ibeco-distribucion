/* Navigation-only enhancement. Does not read or write financial records. */
(() => {
  const tabs = ['home', 'clients', 'movements', 'stock', 'supplier'];
  let gesture = null;
  const ignored = 'input,textarea,select,button,a,[contenteditable="true"],[role="slider"],.custom-picker,.calendar-grid,.picker-options,.ibeco-history-scroll,.ledger-scroll,.stock-ledger,.ibeco-history-panel';
  function isHorizontalScrollable(target) {
    for (let node=target; node && node!==document.body; node=node.parentElement) {
      if (node.scrollWidth > node.clientWidth + 12) {
        const overflow=getComputedStyle(node).overflowX;
        if (overflow==='scroll'||overflow==='auto') return true;
      }
    }
    return false;
  }
  document.addEventListener('touchstart', (ev) => {
    gesture=null;
    if (ev.touches.length!==1 || document.querySelector('dialog[open]')) return;
    if (!tabs.includes(page) || ev.target.closest(ignored) || isHorizontalScrollable(ev.target)) return;
    const touch=ev.touches[0];
    // Keep iOS edge-swipe/back navigation unobstructed.
    if (touch.clientX < 24 || touch.clientX > innerWidth - 24) return;
    gesture={x:touch.clientX,y:touch.clientY,time:Date.now()};
  }, {passive:true});
  document.addEventListener('touchcancel',()=>{gesture=null},{passive:true});
  document.addEventListener('touchend',(ev)=>{
    if (!gesture || ev.changedTouches.length!==1) {gesture=null;return}
    const start=gesture; gesture=null;
    if (document.querySelector('dialog[open]') || !tabs.includes(page)) return;
    const touch=ev.changedTouches[0],dx=touch.clientX-start.x,dy=touch.clientY-start.y;
    if (Date.now()-start.time>850 || Math.abs(dx)<85 || Math.abs(dx)<Math.abs(dy)*1.6) return;
    const current=tabs.indexOf(page),next=current+(dx<0?1:-1);
    if (next<0||next>=tabs.length) return;
    page=tabs[next];selected=null;query='';filter='';
    render();
    window.scrollTo({top:0,behavior:'instant'});
  },{passive:true});
})();
