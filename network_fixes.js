/* Zulu Wars networking fix. Injects into old3index.html without replacing its game code. */
(function(){
  'use strict';
  function install(frame){
    try{
      const d=frame.contentDocument;
      if(!d || d.__ZULU_NETWORK_FIXES) return false;
      if(!d.defaultView || !d.defaultView.STATE) return false;

      const s=d.createElement('script');
      s.textContent=`
(function(){
  if(window.__ZULU_NETWORK_FIXES)return;
  window.__ZULU_NETWORK_FIXES=true;

  function setStatus(text, color){
    const el=document.getElementById('network-status');
    if(!el)return;
    el.innerText=text;
    if(color)el.style.color=color;
  }

  function safeStartGame(){
    if(typeof startGame==='function' && !STATE.gameStarted){
      startGame();
    }
  }

  window.initPeer=function(customId=null){
    try{
      if(peer){
        try{peer.destroy();}catch(e){}
      }
    }catch(e){}

    peer=customId ? new Peer(customId) : new Peer();

    peer.on('open', function(id){
      console.log('PeerJS open:', id);
      if(isHost){
        setStatus('HOSTING (WAITING)', '#65ff8a');
        safeStartGame();
      }
    });

    peer.on('connection', function(c){
      conn=c;
      setupNetwork();
    });

    peer.on('error', function(err){
      console.error('PeerJS error:', err);
      let msg='PeerJS connection error.';
      if(err && err.type==='unavailable-id')msg='That room code is already in use. Please create another room.';
      else if(err && err.type==='network')msg='Network connection failed. Check your internet connection.';
      else if(err && err.type==='server-error')msg='PeerJS server error. Please try again.';
      else if(err && err.message)msg=err.message;
      setStatus('ERROR', '#ff6666');
      alert(msg);
    });

    peer.on('disconnected', function(){
      setStatus('DISCONNECTED', '#ff6666');
    });
  };

  window.createRoom=function(){
    playerName=(document.getElementById('player-name').value||'').trim() || 'Host';
    const code=String(Math.floor(1000+Math.random()*9000));
    isHost=true;
    const badge=document.getElementById('room-code-badge');
    const codeEl=document.getElementById('room-code-val');
    if(badge)badge.style.display='block';
    if(codeEl)codeEl.innerText=code;
    setStatus('CREATING ROOM...', '#ffd166');
    initPeer('frontier-pass-'+code);
  };

  window.joinRoom=function(){
    playerName=(document.getElementById('player-name').value||'').trim() || 'Client';
    const code=(document.getElementById('room-code-input').value||'').trim();
    if(!/^\\d{4}$/.test(code)){
      alert('Enter a valid 4-digit room code.');
      return;
    }
    isHost=false;
    setStatus('CONNECTING...', '#ffd166');
    initPeer();
    peer.on('open', function(){
      conn=peer.connect('frontier-pass-'+code,{reliable:true});
      conn.on('open', function(){
        setStatus('ONLINE (ZULU WARS)', '#65ff8a');
        setupNetwork();
        safeStartGame();
      });
      conn.on('error', function(err){
        console.error('Connection error:',err);
        setStatus('CONNECTION ERROR','#ff6666');
        alert('Could not connect to that room. Make sure the host has already created it.');
      });
    });
  };

  // Replace inline button handlers too, so the new functions are used.
  const createBtn=document.querySelector('button[onclick="createRoom()"]');
  if(createBtn){createBtn.onclick=function(e){e.preventDefault();window.createRoom();};}
  const joinBtn=document.querySelector('button[onclick="joinRoom()"]');
  if(joinBtn){joinBtn.onclick=function(e){e.preventDefault();window.joinRoom();};}

  // Fix accidental duplicate network timers.
  const originalSetup=window.setupNetwork;
  window.setupNetwork=function(){
    if(!conn)return;
    if(conn.__zuluSetup)return;
    conn.__zuluSetup=true;
    return originalSetup.apply(this,arguments);
  };
})();`;
      d.documentElement.appendChild(s);
      d.__ZULU_NETWORK_FIXES=true;
      return true;
    }catch(e){
      console.error('Network fix install failed:',e);
      return false;
    }
  }

  function boot(){
    const frame=document.getElementById('game');
    if(!frame)return;
    frame.addEventListener('load',function(){
      setTimeout(function(){install(frame);},300);
    });
    setTimeout(function(){install(frame);},800);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
