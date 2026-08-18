/* Zulu Wars PC controls: user-gesture pointer lock, instant reload cancel, Warband-style dynamic crosshair. */
(function () {
  'use strict';

  function install(frame) {
    try {
      const d = frame.contentDocument;
      if (!d || !d.defaultView || d.__ZULU_PC_CONTROLS) return;
      d.__ZULU_PC_CONTROLS = true;

      const patch = d.createElement('script');
      patch.textContent = `
(function(){
  'use strict';

  function resetReload(){
    if(typeof STATE === 'undefined') return;
    STATE.reloading = false;
    STATE.lastAttackTime = 0;
    var wrap = document.getElementById('reload-bar-container');
    var bar = document.getElementById('reload-bar');
    if(wrap) wrap.style.display = 'none';
    if(bar) bar.style.width = '0%';
    if(typeof weaponNode !== 'undefined' && weaponNode){
      weaponNode.position.z = -0.5;
      weaponNode.rotation.x = 0;
    }
  }

  // Instant switching: reloading never blocks Q/E or SWAP.
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

  function requestLock(){
    var canvas = document.querySelector('#canvas-container canvas');
    if(!canvas || !canvas.requestPointerLock) return;
    try{
      if(document.pointerLockElement !== canvas){
        var p = canvas.requestPointerLock();
        if(p && typeof p.catch === 'function') p.catch(function(){});
      }
    }catch(e){}
  }

  // Browser-safe automatic lock: Create/Join is itself a user gesture.
  // Capture mousedown before the inline onclick starts PeerJS/network work.
  ['createRoom','joinRoom'].forEach(function(fn){
    var selector = fn === 'createRoom'
      ? 'button[onclick="createRoom()"]'
      : 'button[onclick="joinRoom()"]';

    var button = document.querySelector(selector);
    if(button){
      button.addEventListener('mousedown', function(){
        requestLock();
      }, true);
      button.addEventListener('click', function(){
        requestLock();
      }, true);
    }
  });

  // Also lock as soon as the player first interacts with the game canvas.
  var canvas = document.querySelector('#canvas-container canvas');
  if(canvas){
    canvas.addEventListener('mousedown', function(e){
      if(e.button !== 0) return;
      if(typeof STATE === 'undefined') return;
      if(!STATE.gameStarted || STATE.settingsOpen || STATE.gameOver || STATE.isDead) return;

      requestLock();

      if(typeof performAttack === 'function'){
        performAttack();
      }
    });
  }

  // ESC exits pointer lock normally. Clicking the canvas re-locks it.
  if(canvas){
    canvas.addEventListener('click', function(){
      if(typeof STATE === 'undefined') return;
      if(!STATE.gameStarted || STATE.settingsOpen || STATE.gameOver || STATE.isDead) return;
      requestLock();
    });
  }

  // Warband-style four-segment crosshair with a dynamic spread.
  var style = document.createElement('style');
  style.textContent = `
#crosshair{width:42px!important;height:42px!important;--ch-gap:7px!important;--ch-alpha:.92!important}
#crosshair:before,#crosshair:after{display:none!important}
#crosshair .pc-ch{position:absolute;display:block;background:rgba(238,232,216,var(--ch-alpha));box-shadow:0 1px 3px rgba(0,0,0,.8);border-radius:1px}
#crosshair .pc-top,#crosshair .pc-bottom{width:2px;height:9px;left:20px}
#crosshair .pc-left,#crosshair .pc-right{width:9px;height:2px;top:20px}
#crosshair .pc-top{top:calc(0px - var(--ch-gap))}
#crosshair .pc-bottom{bottom:calc(0px - var(--ch-gap))}
#crosshair .pc-left{left:calc(0px - var(--ch-gap))}
#crosshair .pc-right{right:calc(0px - var(--ch-gap))}
`;
  document.head.appendChild(style);

  var cross = document.getElementById('crosshair');
  if(cross){
    cross.innerHTML = '<span class="pc-ch pc-top"></span>' +
                      '<span class="pc-ch pc-right"></span>' +
                      '<span class="pc-ch pc-bottom"></span>' +
                      '<span class="pc-ch pc-left"></span>';
  }

  var currentGap = 7;

  function updateCrosshair(){
    var c = document.getElementById('crosshair');
    if(!c || typeof STATE === 'undefined') return;

    var moving = !!STATE.isMoving;
    var targetGap = moving ? 13 : 7;

    // Extra spread from movement input, making sprinting/turning feel less accurate.
    if(typeof input !== 'undefined'){
      var inputStrength = Math.min(1, Math.sqrt(
        (input.forward || 0) * (input.forward || 0) +
        (input.right || 0) * (input.right || 0)
      ));
      targetGap += inputStrength * 4;
    }

    currentGap += (targetGap - currentGap) * 0.18;

    c.style.setProperty('--ch-gap', currentGap.toFixed(1) + 'px');

    if(STATE.weapon === 'musket'){
      c.style.setProperty('--ch-alpha', '0.92');
    }else{
      c.style.setProperty('--ch-alpha', '0.45');
    }
  }

  function animateCrosshair(){
    updateCrosshair();
    requestAnimationFrame(animateCrosshair);
  }

  animateCrosshair();
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
      setTimeout(function(){ install(frame); }, 200);
    });

    setTimeout(function(){ install(frame); }, 500);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  }else{
    boot();
  }
})();
