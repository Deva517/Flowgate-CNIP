/* Module: metric calculation and safe display formatting. */
(function(){
 'use strict';
 const number=(v,d=2)=>Number.isFinite(v)?v.toFixed(d):'0.00';
 function rows(result){return [
  ['Packets received',`${result.received} / ${result.attempted}`],['Unique packets not received',result.dropped],['Network loss events (including retries)',result.netLost],['Retransmissions',result.retx],['Throughput',`${number(result.throughput)} packets/tick`],['Data rate',`${number(result.dataRate/1024)} KB/tick`],['Average delay',`${number(result.delay)} ticks`],['Delivery ratio',`${number(result.pdr*100,1)}%`]
 ];}
 function comparisonRows(bucket,tcp,udp){return [
 ['Released packets',bucket.released.length,bucket.released.length,'Same shaped stream for both models'],
 ['Packets received',tcp.received,udp.received,'Packets accepted at destination'],
 ['Unique packets not received',tcp.dropped,udp.dropped,'Released packets not delivered'],
 ['Network loss events',tcp.netLost,udp.netLost,'Includes loss during TCP-style retries'],
 ['Bucket overflow drops',bucket.overflow,bucket.overflow,'Dropped before protocol comparison'],
 ['Retransmissions',tcp.retx,udp.retx,'Extra transmissions for recovery'],
 ['Throughput (packets/tick)',number(tcp.throughput),number(udp.throughput),'Received packets divided by simulated duration'],
 ['Data rate (KB/tick)',number(tcp.dataRate/1024),number(udp.dataRate/1024),'Assumes 1 KB per packet'],
 ['Average delay (ticks)',number(tcp.delay),number(udp.delay),'Average modelled delivery delay'],
 ['Delivery ratio',number(tcp.pdr*100,1)+'%',number(udp.pdr*100,1)+'%','Received / released']
 ];}
 window.FlowMetrics={number,rows,comparisonRows};
})();
