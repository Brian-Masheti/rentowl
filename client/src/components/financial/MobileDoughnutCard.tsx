import React from 'react';
import { Doughnut } from 'react-chartjs-2';

const data = {
  labels: ['Rent A', 'Rent B', 'Rent C'],
  datasets: [
    {
      data: [30, 40, 30],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      borderWidth: 2,
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        font: { size: 16, weight: 'bold' },
        color: '#23272F',
        padding: 16,
      },
    },
    title: { display: false },
    tooltip: { enabled: true },
  },
  layout: { padding: 0 },
  animation: { duration: 300 },
  hover: { mode: 'nearest', intersect: true },
};

export default function MobileDoughnutCard() {
  return (
    <div className="w-full max-w-full flex flex-col items-center justify-center p-2 sm:p-4 md:p-6">
      <div className="w-full max-w-full bg-white/90 border border-[#FFA673]/20 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center">
        <div className="text-center font-bold text-lg mb-2 mt-4">Rent Distribution</div>
        <div className="flex items-center justify-center w-full h-[250px] xs:h-[300px] sm:h-[350px] md:h-[400px] max-w-full">
          <Doughnut data={data} options={options} />
        </div>
      </div>
    </div>
  );
}
