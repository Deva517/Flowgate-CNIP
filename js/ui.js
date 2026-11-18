/* Module: DOM rendering only. Simulation algorithms live in separate files. */
(function(){
 'use strict';const $=window.FlowConfig.$;
 function renderMetricRows(id,result){$(''+id).innerHTML=window.FlowMetrics.rows(result).map(([label,value])=>`<div class="metricline"><span>${label}</span><b>${value}</b></div>`).join('')+(result.aborted?'<p class="warning">Retry limit reached: unresolved packets were marked not delivered.</p>':'');}
 function renderResults(config,bucket,tcp,udp){
  renderMetricRows('tcp',tcp);renderMetricRows('udp',udp);
  const cards=[['Bucket overflow',bucket.overflow],['TCP-style received',`${tcp.received}/${tcp.attempted}`],['UDP-style received',`${udp.received}/${udp.attempted}`],['TCP retransmissions',tcp.retx],['UDP retransmissions',udp.retx],['TCP throughput',window.FlowMetrics.number(tcp.throughput)],['UDP throughput',window.FlowMetrics.number(udp.throughput)],['Source → destination',`${config.source} → ${config.dest}`]];
  $('cards').innerHTML=cards.map(([label,value])=>`<article class="panel stat"><span>${label}</span><h3>${value}</h3><small>Latest run</small></article>`).join('');
  $('table').innerHTML=window.FlowMetrics.comparisonRows(bucket,tcp,udp).map(row=>`<tr>${row.map((v,i)=>`<td>${v}</td>`).join('')}</tr>`).join('');
  const events=[`Route: ${config.source} → ${config.dest}.`,`Leaky Bucket: ${bucket.generated} generated, ${bucket.admitted} admitted, ${bucket.overflow} overflow drops, ${bucket.released.length} released.`,...tcp.events,...udp.events,`Completed: TCP-style ${tcp.received}/${tcp.attempted}; UDP-style ${udp.received}/${udp.attempted}.`];
  $('events').innerHTML=events.slice(-26).map(v=>`<li>${v}</li>`).join('');
  $('generated').textContent=bucket.generated;$('admitted').textContent=bucket.admitted;$('drops').textContent=bucket.overflow;$('released').textContent=bucket.released.length;
 }
 function resetResults(){['generated','admitted','drops','released'].forEach(id=>$(id).textContent='—');$('tcp').innerHTML='<p>Run comparison to see results.</p>';$('udp').innerHTML='<p>Run comparison to see results.</p>';$('cards').innerHTML='<article class="panel stat"><span>Results</span><h3>—</h3><small>Awaiting run</small></article>';$('table').innerHTML='<tr><td colspan="4">Run comparison to populate results.</td></tr>';$('events').innerHTML='<li>Ready for a new experiment.</li>';window.FlowCharts.drawBucket({levels:[],capacity:1});}
 window.FlowUI={renderResults,resetResults};
})();
