import React from 'react';
import ChartCard from './ChartCard';

/**
 * EnhancedBarChart - Responsive, animated bar plot for expected vs received rent by property
 * Props:
 *   perProperty: array of { propertyName, expectedRent, receivedRent }
 *   title: string (chart title)
 */
export default function EnhancedBarChart({ perProperty = [], title = 'Expected Receivable Rent' }) {
  const labels = perProperty.map((p) => p.propertyName);
  const expectedData = perProperty.map((p) => p.expectedRent);
  const receivedData = perProperty.map((p) => p.receivedRent);

  return (
    <div className="bg-white/90 border border-[#FFA673]/20 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 p-6 mb-8">
      <div className="text-center font-bold text-xl mb-4">{title}</div>
      <div className="w-full h-[20rem] flex items-center justify-center">
        <ChartCard
          title=""
          type="bar"
          data={{
            labels,
            datasets: [
              {
                label: 'Expected',
                data: expectedData,
                backgroundColor: '#03A6A1',
                barThickness: 40,
                maxBarThickness: 60,
              },
              {
                label: 'Received',
                data: receivedData,
                backgroundColor: '#FFA673',
                barThickness: 40,
                maxBarThickness: 60,
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
              },
              datalabels: {
                display: true,
                color: '#23272F',
                font: { weight: 'bold', size: window.innerWidth < 768 ? 10 : 14 },
                anchor: 'end',
                align: 'start',
                formatter: v => `Kshs ${Number(v).toLocaleString()}`
              }
            },
            animation: { duration: 600, easing: 'easeOutQuart' },
            hover: { mode: 'nearest', intersect: true },
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Properties',
                  color: '#23272F',
                  font: { size: 16, weight: 'bold' }
                },
                grid: { display: window.innerWidth >= 768 },
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
                  text: 'Rent',
                  color: '#23272F',
                  font: { size: 16, weight: 'bold' }
                },
                grid: { display: false },
                ticks: {
                  color: '#23272F',
                  font: { size: window.innerWidth < 768 ? 10 : 14, weight: 'bold' },
                  min: 0,
                  max: 200000,
                  stepSize: 50000,
                  callback: function(value) {
                    if (value % 50000 === 0) {
                      if (value >= 1000000) return (value / 1000000) + 'M';
                      if (value >= 1000) return (value / 1000) + 'k';
                      return value;
                    }
                    return null;
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
