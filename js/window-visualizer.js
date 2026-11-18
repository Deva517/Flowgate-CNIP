/* UI-only sliding-window trace player. It visualizes the trace produced by gobackn.js. */
(function(){
 'use strict';
 const $=window.FlowConfig.$;let trace=[],step=0,playTimer=null;
 function stop(){if(playTimer){clearInterval(playTimer);playTimer=null;}const b=$('tracePlay');if(b)b.textContent='Play trace';}
 function frameClass(frame){if(!frame)return 'waiting';if(frame.outcome==='lost')return 'lost';if(frame.outcome==='out-of-order'||frame.outcome==='retry-limit')return 'lost';if(frame.outcome==='accepted'||frame.outcome==='recovered')return 'ack';return 'waiting';}
 function render(){
   const track=$('windowTrack');if(!track)return;
   if(!trace.length){track.innerHTML='<p class="empty-state">Click “Run TCP vs UDP comparison” to generate the packet trace.</p>';$('traceTitle').textContent='Waiting for simulation';$('traceCount').textContent='0 / 0';$('traceStatus').textContent='The highlighted window shows which packets may be outstanding at this step.';$('tracePrev').disabled=$('traceNext').disabled=$('tracePlay').disabled=true;return;}
   const t=trace[step],maxVisible= Math.max(12,Math.min(24,t.windowEnd+1));
   const first=Math.max(0,t.windowStart-3),last=Math.min(Math.max(...trace.map(x=>x.windowEnd))+1,first+maxVisible-1);
   const frames=new Map(t.frames.map(f=>[f.index,f]));let html='';
   for(let i=first;i<=last;i++){
     const inWindow=i>=t.windowStart&&i<=t.windowEnd, f=frames.get(i);let cls=inWindow?'in-window':'outside';
     if(f)cls+=' '+frameClass(f);else if(i<=t.acknowledgedThrough)cls+=' ack';else cls+=' waiting';
     const label=f?(f.outcome==='lost'?'LOST':f.outcome==='out-of-order'?'DISCARD':f.outcome==='retry-limit'?'STOP':f.outcome==='recovered'?'RETRY OK':'SENT'):i<=t.acknowledgedThrough?'ACKED':i<t.windowStart?'ACKED':'WAIT';
     html+=`<div class="packet ${cls}" title="Packet ${i+1}: ${label}"><b>P${i+1}</b><small>${label}</small></div>`;
   }
   track.innerHTML=html;
   $('traceTitle').textContent=`Round ${t.round}: packets ${t.windowStart+1}–${t.windowEnd+1}`;
   $('traceCount').textContent=`${step+1} / ${trace.length}`;
   let status=`Window size ${t.windowSize}. `;
   if(t.retryLimitHit)status+='Retry limit reached; remaining undelivered packets are abandoned in this educational model.';
   else if(t.retryFrom!==null&&t.timeout)status+=`Packet ${t.retryFrom+1} is the first missing packet. Timeout occurs; next round goes back to packet ${t.retryFrom+1}.`;
   else if(t.acknowledgedThrough>=0)status+=`Cumulative ACK now covers packets 1–${t.acknowledgedThrough+1}. The window advances to packet ${t.nextBase+1}.`;
   else status+='No cumulative acknowledgement yet.';
   $('traceStatus').textContent=status;
   $('tracePrev').disabled=step===0;$('traceNext').disabled=step===trace.length-1;$('tracePlay').disabled=trace.length<2;
 }
 function setTrace(result){stop();trace=result&&result.trace?result.trace:[];step=0;render();}
 function next(){if(step<trace.length-1){step++;render();}else stop();}
 function previous(){stop();if(step>0){step--;render();}}
 function play(){if(playTimer){stop();return;}if(!trace.length)return;if(step>=trace.length-1)step=0;$('tracePlay').textContent='Pause trace';render();playTimer=setInterval(()=>{if(step>=trace.length-1){stop();render();return;}step++;render();$('tracePlay').textContent='Pause trace';},1100);}
 $('tracePrev').addEventListener('click',previous);$('traceNext').addEventListener('click',()=>{stop();next();});$('tracePlay').addEventListener('click',play);
 window.FlowWindowVisualizer={setTrace,reset(){stop();trace=[];step=0;render();}};render();
})();
