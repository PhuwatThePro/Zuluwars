/* Zulu Wars modular weapon fixes. */
(function(){
'use strict';
function install(frame){
 try{
  var w=frame.contentWindow,d=frame.contentDocument;
  if(!w||!d||!w.STATE)return false;
  if(w.__ZULU_WEAPON_FIXES)return true;
  w.__ZULU_WEAPON_FIXES=true;
  function resetReload(){
   w.STATE.reloading=false;w.STATE.lastAttackTime=0;
   var c=d.getElementById('reload-bar-container'),b=d.getElementById('reload-bar');
   if(c)c.style.display='none';if(b)b.style.width='0%';
   if(w.weaponNode){w.weaponNode.position.z=-0.5;w.weaponNode.rotation.x=0;}
  }
  w.switchWeapon=function(){
   if(w.STATE.isDead||w.STATE.gameOver||!w.STATE.gameStarted)return;
   resetReload();
   w.STATE.weapon=w.STATE.weapon==='musket'?'sword':'musket';
   if(w.musketGroup)w.musketGroup.visible=w.STATE.weapon==='musket';
   if(w.swordGroup)w.swordGroup.visible=w.STATE.weapon==='sword';
   var el=d.getElementById('weapon-val');if(el)el.innerText=w.STATE.weapon==='musket'?'MUSKET':'SWORD';
   if(typeof w.updateMusketCrosshair==='function')w.updateMusketCrosshair();
  };
  var btn=d.getElementById('btn-switch');
  if(btn){btn.onclick=null;btn.addEventListener('click',function(e){e.preventDefault();w.switchWeapon();});}
  w.addEventListener('keydown',function(e){if(e.code==='KeyQ'||e.code==='KeyE')w.switchWeapon();},true);
  setInterval(function(){
   if(!w.remotePlayerMesh)return;
   w.remotePlayerMesh.traverse(function(o){if(o.name&&/musket/i.test(o.name))o.rotation.set(-Math.PI/2,0,-0.10);});
  },300);
  return true;
 }catch(e){return false;}
}
function boot(){var f=document.querySelector('iframe');if(!f)return;f.addEventListener('load',function(){setTimeout(function(){install(f);},150);});setTimeout(function(){install(f);},500);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
