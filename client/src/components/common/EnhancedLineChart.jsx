import React from 'react';
import ChartCard from './ChartCard';

/**
 * EnhancedLineChart - Responsive, animated line chart for monthly rent collection trend
 * Props:
 *   payments: array of payment objects (must have paidAt, amount, status)
 *   title: string (chart title)
 */
export default function EnhancedLineChart({ payments = [], title = 'Monthly Rent Collection Trend' }) {
  // Aggregate received payments by month
  const monthly = {};
  payments.forEach(p => {
    if (p.status !== 'paid' || !p.paidAt) return;
    const date = new Date(p.paidAt);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    if (!monthly[key]) monthly[key] = 0;
    monthly[key] += p.amount || 0;
  });
  const sortedKeys = Object.keys(monthly).sort((a, b) => new Date(a) - new Date(b));
  const labels = sortedKeys.map(k => {
    const [year, month] = k.split('-');
    return `${new Date(year, month - 1).toLocaleString('default', { month: 'short' })} ${year}`;
  });
  const dataPoints = sortedKeys.map(k => monthly[k]);

  return (
    <div className="bg-white/90 border border-[#FFA673]/20 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 p-6 mb-8">
      <div className="text-center font-bold text-xl mb-4">{title}</div>
      <div className="w-full h-[min(20rem,60vw)] flex items-center justify-center">
        <ChartCard
          title=""
          type="line"
          data={{
            labels,
            datasets: [
              {
                label: 'Received',
                data: dataPoints,
                borderColor: '#03A6A1',
                backgroundColor: ctx => {
                  const chart = ctx.chart;
                  const {ctx: c, chartArea} = chart;
                  if (!chartArea) return 'rgba(3,166,161,0.1)';
                  const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                  gradient.addColorStop(0, 'rgba(3,166,161,0.25)');
                  gradient.addColorStop(1, 'rgba(3,166,161,0.01)');
                  return gradient;
                },
                tension: 0.4,
                pointBackgroundColor: '#03A6A1',
                pointBorderColor: '#FFF',
                pointRadius: 5,
                pointHoverRadius: 8,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: window.innerWidth < 768 ? 'bottom' : 'top',
                labels: { font: { size: window.innerWidth < 768 ? 10 : 14 } }
              },
              title: { display: false },
              tooltip: {
                callbacks: {
                  label: ctx => `Kshs ${Number(ctx.parsed.y).toLocaleString()}`
                }
              }
            },
            animation: { duration: 600, easing: 'easeOutQuart' },
            hover: { mode: 'nearest', intersect: true },
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Month',
                  color: '#23272F',
                  font: { size: window.innerWidth < 768 ? 12 : 16, weight: 'bold' }
                },
                grid: { display: false },
                ticks: {
                  color: '#23272F',
                  font: { size: window.innerWidth < 768 ? 10 : 14, weight: 'bold' },
                  align: 'center',
                  maxRotation: 0,
                  minRotation: 0
                }
              },
              y: {
                title: {
                display: true,
                text: 'Received',
                color: '#23272F',
                font: { size: window.innerWidth < 768 ? 12 : 16, weight: 'bold' }
                },
                grid: { display: false },
                ticks: {
                  color: '#23272F',
                  font: { size: window.innerWidth < 768 ? 10 : 14, weight: 'bold' },
                  beginAtZero: true,
                  stepSize: 50000,
                  suggestedMin: 0,
                  suggestedMax: 200000,
                  callback: function(tickValue) {
                    if (typeof tickValue === 'number') {
                      if (tickValue >= 1000000) return (tickValue / 1000000) + 'M';
                      if (tickValue >= 1000) return (tickValue / 1000) + 'k';
                      return tickValue;
                    }
                    return tickValue;
                  }
                }
              }
            }
          }}
          className="h-full w-full"
        />
      </div>
    </div>
  );
}
