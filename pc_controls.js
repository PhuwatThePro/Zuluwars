/* Zulu Wars PC controls + instant reload-cancel weapon switching. */
(function () {
  'use strict';

  function install(frame) {
    try {
      const d = frame.contentDocument;
      if (!d || !d.defaultView) return;
      if (d.__ZULU_PC_CONTROLS) return;
      d.__ZULU_PC_CONTROLS = true;

      const patch = d.createElement('script');
      patch.textContent = `
(function(){
  'use strict';

  function resetReload(){
    if(typeof STATE === 'undefined') return;
    STATE.reloading = false;
    STATE.lastAttackTime = 0;
    var barWrap = document.getElementById('reload-bar-container');
    var bar = document.getElementById('reload-bar');
    if(barWrap) barWrap.style.display = 'none';
    if(bar) bar.style.width = '0%';
    if(typeof weaponNode !== 'undefined' && weaponNode){
      weaponNode.position.z = -0.5;
      weaponNode.rotation.x = 0;
    }
  }

  // Allow weapon switching immediately, even while the musket is reloading.
  window.switchWeapon = function(){
    if(typeof STATE === 'undefined') return;
    if(STATE.isDead || STATE.gameOver || !STATE.gameStarted) return;

    resetReload();

    STATE.weapon = STATE.weapon === 'musket' ? 'sword' : 'musket';

    if(typeof musketGroup !== 'undefined' && musketGroup){
      musketGroup.visible = STATE.weapon === 'musket';
    }
    if(typeof swordGroup !== 'undefined' && swordGroup){
      swordGroup.visible = STATE.weapon === 'sword';
    }

    var weaponText = document.getElementById('weapon-val');
    if(weaponText){
      weaponText.innerText = STATE.weapon === 'musket' ? 'MUSKET' : 'SWORD';
    }
  };

  // PC left click: fire immediately. The game's existing mousemove and
  // Q/E handlers are left untouched so camera sensitivity and switching
  // are not duplicated.
  var canvas = document.querySelector('#canvas-container canvas');
  if(canvas){
    canvas.addEventListener('mousedown', function(e){
      if(e.button !== 0) return;
      if(typeof STATE === 'undefined') return;
      if(!STATE.gameStarted || STATE.settingsOpen || STATE.gameOver || STATE.isDead) return;

      if(document.pointerLockElement !== canvas && canvas.requestPointerLock){
        canvas.requestPointerLock();
      }

      if(typeof performAttack === 'function'){
        performAttack();
      }
    });
  }

  // Warband-style separated crosshair.
  var style = document.createElement('style');
  style.textContent = `
#crosshair{width:46px!important;height:46px!important;--gap:7px!important}
#crosshair .pc-ch{position:absolute;display:block;background:rgba(238,232,216,.92);box-shadow:0 1px 3px rgba(0,0,0,.65);border-radius:1px}
#crosshair .pc-top,#crosshair .pc-bottom{width:2px;height:9px;left:22px}
#crosshair .pc-left,#crosshair .pc-right{width:9px;height:2px;top:22px}
#crosshair .pc-top{top:calc(1px - var(--gap))}
#crosshair .pc-bottom{bottom:calc(1px - var(--gap))}
#crosshair .pc-left{left:calc(1px - var(--gap))}
#crosshair .pc-right{right:calc(1px - var(--gap))}
`;
  document.head.appendChild(style);

  var cross = document.getElementById('crosshair');
  if(cross && !cross.querySelector('.pc-ch')){
    cross.innerHTML = '<span class="pc-ch pc-top"></span><span class="pc-ch pc-right"></span><span class="pc-ch pc-bottom"></span><span class="pc-ch pc-left"></span>';
  }

  function updateCrosshair(){
    var c = document.getElementById('crosshair');
    if(!c || typeof STATE === 'undefined') return;
    c.style.setProperty('--gap', STATE.isMoving ? '12px' : '6px');
  }

  setInterval(updateCrosshair, 100);
  updateCrosshair();
})();`;

      d.documentElement.appendChild(patch);
    } catch (err) {
      console.error('Zulu Wars PC controls install failed:', err);
    }
  }

  function boot(){
    const frame = document.getElementById('game');
    if(!frame) return;
    frame.addEventListener('load', function(){
      setTimeout(function(){ install(frame); }, 250);
    });
    setTimeout(function(){ install(frame); }, 800);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  }else{
    boot();
  }
})();
