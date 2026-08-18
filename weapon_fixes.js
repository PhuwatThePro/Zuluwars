/* Zulu Wars weapon fixes - loaded after index.html game code. */
(function(){
  'use strict';
  function resetReload(){
    if(typeof STATE==='undefined') return;
    STATE.reloading=false;
    STATE.lastAttackTime=0;
    var c=document.getElementById('reload-bar-container');
    var b=document.getElementById('reload-bar');
    if(c)c.style.display='none';
    if(b)b.style.width='0%';
    if(typeof weaponNode!=='undefined'&&weaponNode){weaponNode.position.z=-0.5;weaponNode.rotation.x=0;}
  }
  window.addEventListener('keydown',function(e){
    if(e.code!=='KeyQ'&&e.code!=='KeyE') return;
    if(typeof STATE==='undefined'||STATE.isDead||STATE.gameOver||!STATE.gameStarted)return;
    resetReload();
    STATE.weapon=STATE.weapon==='musket'?'sword':'musket';
    if(typeof musketGroup!=='undefined')musketGroup.visible=STATE.weapon==='musket';
    if(typeof swordGroup!=='undefined')swordGroup.visible=STATE.weapon==='sword';
    var w=document.getElementById('weapon-val');
    if(w)w.innerText=STATE.weapon==='musket'?'MUSKET':'SWORD';
    if(typeof updateMusketCrosshair==='function')updateMusketCrosshair();
  },true);
  function patchTP(){
    if(typeof window.pModel==='undefined') return false;
    return true;
  }
  // Runtime safety patch: any visible third-person musket is aimed forward.
  setInterval(function(){
    if(typeof STATE==='undefined')return;
    if(typeof playerModel!=='undefined'&&playerModel){
      playerModel.traverse(function(o){
        if(o.name&&/musket/i.test(o.name)){o.rotation.x=-Math.PI/2;o.rotation.z=-0.10;}
      });
    }
  },250);
  window.ZuluWeaponFixes={resetReload:resetReload,patchTP:patchTP};
})();
