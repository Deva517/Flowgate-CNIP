/* Flowgate charts: Chart.js for readable data charts; Canvas route sketch retained. */
(function () {
  'use strict';

  const chartInstances = {};
  const palette = {
    mint: '#68ecd2', violet: '#a8a7ff', amber: '#ffbf69',
    danger: '#ff7f91', grid: 'rgba(164,190,224,.14)', text: '#b8c8dc'
  };

  function chartAvailable() {
    return typeof window.Chart === 'function';
  }

  function destroyChart(key) {
    if (chartInstances[key]) {
      chartInstances[key].destroy();
      delete chartInstances[key];
    }
  }

  function baseOptions(title, yTitle) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: palette.text, usePointStyle: true, padding: 18 } },
        title: { display: false, text: title, color: '#edf4ff' },
        tooltip: { enabled: true }
      },
      scales: {
        x: { ticks: { color: palette.text }, grid: { color: 'transparent' } },
        y: {
          beginAtZero: true,
          title: { display: true, text: yTitle, color: palette.text },
          ticks: { color: palette.text },
          grid: { color: palette.grid }
        }
      }
    };
  }

  function showFallback(canvas, message) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#9aacc5';
    ctx.font = '14px sans-serif';
    ctx.fillText(message, 18, 34);
  }

  function drawBucket(bucket) {
    const canvas = document.getElementById('bucketChart');
    if (!canvas) return;
    destroyChart('bucket');

    const levels = bucket.levels || [];
    if (!chartAvailable()) {
      showFallback(canvas, 'Charts require an internet connection to load Chart.js.');
      return;
    }

    chartInstances.bucket = new Chart(canvas, {
      type: 'line',
      data: {
        labels: levels.map(v => `Tick ${v.tick}`),
        datasets: [
          {
            label: 'Queue occupancy',
            data: levels.map(v => v.level),
            borderColor: palette.mint,
            backgroundColor: 'rgba(104,236,210,.12)',
            fill: true,
            tension: 0.25,
            pointRadius: 2,
            yAxisID: 'y'
          },
          {
            label: 'Bucket capacity',
            data: levels.map(() => bucket.capacity || 0),
            borderColor: palette.amber,
            borderDash: [6, 5],
            pointRadius: 0,
            fill: false,
            yAxisID: 'y'
          },
          {
            label: 'Packets released per tick',
            data: levels.map(v => v.released),
            type: 'bar',
            backgroundColor: 'rgba(168,167,255,.48)',
            borderColor: palette.violet,
            borderWidth: 1,
            yAxisID: 'y'
          }
        ]
      },
      options: {
        ...baseOptions('Leaky Bucket queue behaviour', 'Packets'),
        scales: {
          ...baseOptions('', 'Packets').scales,
          y: { ...baseOptions('', 'Packets').scales.y, suggestedMax: bucket.capacity || 1 }
        }
      }
    });
  }

  function drawPerformance(tcp, udp) {
    if (!chartAvailable()) {
      ['throughputChart', 'delayChart', 'packetChart'].forEach(id =>
        showFallback(document.getElementById(id), 'Chart.js could not be loaded.')
      );
      return;
    }

    const specs = [
      {
        key: 'throughput',
        id: 'throughputChart',
        title: 'Throughput',
        yTitle: 'Packets per tick',
        values: [tcp.throughput, udp.throughput],
        labels: ['TCP-style', 'UDP'],
        colors: [palette.mint, palette.violet]
      },
      {
        key: 'delay',
        id: 'delayChart',
        title: 'Average delivery delay',
        yTitle: 'Ticks',
        values: [tcp.delay, udp.delay],
        labels: ['TCP-style', 'UDP'],
        colors: [palette.mint, palette.violet]
      }
    ];

    specs.forEach(spec => {
      const canvas = document.getElementById(spec.id);
      if (!canvas) return;
      destroyChart(spec.key);
      chartInstances[spec.key] = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: spec.labels,
          datasets: [{
            label: spec.title,
            data: spec.values.map(v => Number.isFinite(v) ? Number(v.toFixed(3)) : 0),
            backgroundColor: spec.colors,
            borderColor: spec.colors,
            borderWidth: 1,
            borderRadius: 8
          }]
        },
        options: {
          ...baseOptions(spec.title, spec.yTitle),
          plugins: { ...baseOptions('', spec.yTitle).plugins, legend: { display: false } }
        }
      });
    });

    const packetCanvas = document.getElementById('packetChart');
    if (packetCanvas) {
      destroyChart('packets');
      chartInstances.packets = new Chart(packetCanvas, {
        type: 'bar',
        data: {
          labels: ['Received', 'Not received', 'Retransmissions'],
          datasets: [
            {
              label: 'TCP-style',
              data: [tcp.received, tcp.dropped, tcp.retx],
              backgroundColor: 'rgba(104,236,210,.78)',
              borderRadius: 6
            },
            {
              label: 'UDP',
              data: [udp.received, udp.dropped, udp.retx],
              backgroundColor: 'rgba(168,167,255,.78)',
              borderRadius: 6
            }
          ]
        },
        options: baseOptions('Packet outcomes', 'Packet count')
      });
    }
  }

  function drawRoute(source, dest) {
    const cv = document.getElementById('route');
    if (!cv) return;
    const ctx = cv.getContext('2d'), w = cv.width, h = cv.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0b1425';
    ctx.fillRect(0, 0, w, h);
    const nodes = [
      { x: 90, label: source, color: palette.mint },
      { x: w / 2, label: 'ROUTER', color: palette.amber },
      { x: w - 90, label: dest, color: palette.violet }
    ];
    ctx.setLineDash([7, 7]);
    ctx.strokeStyle = '#536784';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(nodes[0].x, h / 2);
    ctx.lineTo(nodes[2].x, h / 2);
    ctx.stroke();
    ctx.setLineDash([]);
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, h / 2, 24, 0, Math.PI * 2);
      ctx.fillStyle = '#182640';
      ctx.fill();
      ctx.strokeStyle = n.color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = n.color;
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(n.label, n.x, h / 2 + 44);
    });
  }

  window.FlowCharts = { drawBucket, drawRoute, drawPerformance };
})();