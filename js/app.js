/* Application controller: wires controls to independent simulation modules. */
(function(){
 'use strict';const {$,readConfig,seededRandom,configSeed}=window.FlowConfig;
 function updateLabels(){const c=readConfig();$('nVal').textContent=c.n;$('lossVal').textContent=`${Math.round(c.loss*100)}%`;$('winVal').textContent=c.win;$('capVal').textContent=c.cap;$('rateVal').textContent=`${c.rate} packets/tick`;$('delayVal').textContent=`${c.delay} ticks`;$('srcText').textContent=c.source;$('dstText').textContent=c.dest;window.FlowCharts.drawRoute(c.source,c.dest);}
 function applyPreset(){const preset=$('preset').value,values={low:[2,18,7],medium:[10,12,5],high:[22,8,3]}[preset];$('loss').value=values[0];$('cap').value=values[1];$('rate').value=values[2];updateLabels();}
 async function run(){
   const c=readConfig();
   const button=$('run');button.disabled=true;button.textContent='Running Java simulation…';
   try{
     const body=new URLSearchParams({source:c.source,dest:c.dest,n:String(c.n),loss:String(Math.round(c.loss*100)),win:String(c.win),cap:String(c.cap),rate:String(c.rate),delay:String(c.delay),preset:c.preset});
     const response=await fetch('http://localhost:8765/api/simulate',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:body.toString()});
     if(!response.ok)throw new Error('Java backend returned HTTP '+response.status);
     const result=await response.json();const {bucket,tcp,udp}=result;
     window.FlowCharts.drawBucket(bucket);window.FlowCharts.drawPerformance(tcp,udp);
     window.FlowUI.renderResults(c,bucket,tcp,udp);window.FlowWindowVisualizer.setTrace(tcp);
   }catch(err){
     alert('Could not connect to the Java backend. Start it using backend\\start.bat first.\\n\\n'+err.message);
   }finally{button.disabled=false;button.textContent='Run TCP vs UDP comparison';}
 }
 document.querySelectorAll('#source,#dest,#n,#loss,#win,#cap,#rate,#delay').forEach(el=>el.addEventListener('input',updateLabels));$('preset').addEventListener('change',applyPreset);$('run').addEventListener('click',run);$('reset').addEventListener('click',()=>{window.FlowUI.resetResults();window.FlowWindowVisualizer.reset();});updateLabels();window.FlowUI.resetResults();window.FlowWindowVisualizer.reset();
})();
