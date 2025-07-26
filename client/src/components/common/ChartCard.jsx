import React from 'react';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
);

const ChartCard = ({ title, type, data, options, className }) => {
  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className || ''}`}>
      <h3 className="text-lg font-bold mb-2 text-[#03A6A1]">{title}</h3>
      <div className="w-full h-64">
        {type === 'bar' && <Bar data={data} options={options} />}
        {type === 'line' && <Line data={data} options={options} />}
        {type === 'pie' && <Pie data={data} options={options} />}
        {type === 'doughnut' && <Doughnut data={data} options={options} />}
      </div>
    </div>
  );
};

export default ChartCard;
