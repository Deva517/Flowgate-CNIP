/* Module: shared configuration, input reading and seeded random generator. */
(function(){
  'use strict';
  const $ = id => document.getElementById(id);
  function readConfig(){
    return {
      source:$('source').value, dest:$('dest').value, n:Number($('n').value),
      loss:Number($('loss').value)/100, win:Number($('win').value),
      cap:Number($('cap').value), rate:Number($('rate').value),
      delay:Number($('delay').value), preset:$('preset').value, maxAttempts:6
    };
  }
  function seededRandom(seed){ let state=seed>>>0; return function(){ state=(1664525*state+1013904223)>>>0; return state/4294967296; }; }
  function configSeed(c,offset=0){
    const s=c.source.charCodeAt(c.source.length-1)||1, d=c.dest.charCodeAt(c.dest.length-1)||1;
    return (c.n*31+Math.round(c.loss*1000)*17+c.win*13+c.cap*7+c.rate*5+c.delay*3+s*11+d*19+offset)>>>0;
  }
  window.FlowConfig={ $, readConfig, seededRandom, configSeed };
})();
