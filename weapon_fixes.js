/* Zulu Wars modular weapon fixes. Runs inside the preserved game-core iframe. */
(function(){
'use strict';
function install(frame){
 try{
  var d=frame.contentDocument;
  if(!d||d.__ZULU_WEAPON_FIXES)return;
  var s=d.createElement('script');
  s.textContent=`
(function(){
  if(window.__ZULU_WEAPON_FIXES)return;
  window.__ZULU_WEAPON_FIXES=true;

  function resetReload(){
    STATE.reloading=false;
    STATE.lastAttackTime=0;
    var c=document.getElementById('reload-bar-container');
    var b=document.getElementById('reload-bar');
    if(c)c.style.display='none';
    if(b)b.style.width='0%';
    if(typeof weaponNode!=='undefined'&&weaponNode){weaponNode.position.z=-0.5;weaponNode.rotation.x=0;}
  }

  // Allow sword/musket switching at any time while alive, including during reload.
  window.switchWeapon=function(){
    if(STATE.isDead||STATE.gameOver||!STATE.gameStarted)return;
    resetReload();
    STATE.weapon=STATE.weapon==='musket'?'sword':'musket';
    if(typeof musketGroup!=='undefined')musketGroup.visible=STATE.weapon==='musket';
    if(typeof swordGroup!=='undefined')swordGroup.visible=STATE.weapon==='sword';
    var el=document.getElementById('weapon-val');
    if(el)el.innerText=STATE.weapon==='musket'?'MUSKET':'SWORD';
    if(typeof updateMusketCrosshair==='function')updateMusketCrosshair();
  };

  var swap=document.getElementById('btn-switch');
  if(swap){swap.onclick=null;swap.addEventListener('click',function(e){e.preventDefault();window.switchWeapon();});}
  window.addEventListener('keydown',function(e){
    if(e.code==='KeyQ'||e.code==='KeyE')window.switchWeapon();
  },true);

  // Improve the existing third-person model without rebuilding the game.
  function improveModel(model){
    if(!model||!model.userData)return;
    var musket=model.userData.musket;
    var sword=model.userData.sword;

    if(musket){
      // Existing musket geometry is built vertically; rotate it so the barrel aims forward (-Z).
      musket.position.set(0.02,1.02,-0.38);
      musket.rotation.set(-Math.PI/2,0,-0.10);
    }

    // Correct the two-handed infantry pose.
    if(musket&&model.userData.rightArm&&model.userData.leftArm&&typeof pointArmAt==='function'){
      pointArmAt(model.userData.rightArm,new THREE.Vector3(0.16,1.04,-0.58));
      pointArmAt(model.userData.leftArm,new THREE.Vector3(-0.02,1.28,-0.64));
      model.userData.rightArm.rotation.z+=0.05;
      model.userData.leftArm.rotation.z-=0.04;
    }

    // Replace the stick sword once with a real tapered blade, guard, grip and pommel.
    if(sword&&!sword.userData.improved){
      sword.clear();
      var bladeShape=new THREE.Shape();
      bladeShape.moveTo(-0.055,0);bladeShape.lineTo(0.055,0);bladeShape.lineTo(0.045,0.68);bladeShape.lineTo(0,0.90);bladeShape.lineTo(-0.045,0.68);bladeShape.closePath();
      var bg=new THREE.ExtrudeGeometry(bladeShape,{depth:0.025,bevelEnabled:true,bevelThickness:0.006,bevelSize:0.006,bevelSegments:1});
      bg.center();
      var blade=new THREE.Mesh(bg,new THREE.MeshStandardMaterial({color:0xbfc7cc,metalness:0.85,roughness:0.25}));
      blade.position.set(0,0.48,0);
      var guard=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,0.30,8),new THREE.MeshStandardMaterial({color:0x777777,metalness:0.8,roughness:0.3}));
      guard.rotation.z=Math.PI/2;guard.position.y=0.025;
      var grip=new THREE.Mesh(new THREE.CylinderGeometry(0.035,0.035,0.25,8),new THREE.MeshStandardMaterial({color:0x3a2418,roughness:0.8}));
      grip.position.y=-0.12;
      var pommel=new THREE.Mesh(new THREE.SphereGeometry(0.055,8,6),new THREE.MeshStandardMaterial({color:0x777777,metalness:0.8,roughness:0.3}));
      pommel.position.y=-0.27;
      sword.add(blade,guard,grip,pommel);
      sword.position.set(0.38,0.78,-0.12);sword.rotation.z=0.10;sword.userData.improved=true;
    }
  }

  function tick(){
    try{
      if(typeof playerModel!=='undefined')improveModel(playerModel);
      if(typeof remotePlayerMesh!=='undefined')improveModel(remotePlayerMesh);
    }catch(e){}
  }
  setInterval(tick,250);
  tick();
})();`;
  d.documentElement.appendChild(s);
  d.__ZULU_WEAPON_FIXES=true;
 }catch(e){console.error('Zulu weapon fixes:',e);}
}
function boot(){
 var f=document.getElementById('game');
 if(!f)return;
 f.addEventListener('load',function(){setTimeout(function(){install(f);},250);});
 setTimeout(function(){install(f);},700);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
