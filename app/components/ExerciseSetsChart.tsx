import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

interface ExerciseSetsChartProps {
  sets: { repetitions: number; weight: number }[];
}

const ExerciseSetsChart: React.FC<ExerciseSetsChartProps> = ({ sets }) => {
  console.log('sets', sets);
  const data = {
    labels: sets.map((_, index) => `Set ${index + 1}`),
    datasets: [
      {
        label: 'Weight',
        data: sets.map(set => set.weight),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      },
      {
        label: 'Repetitions',
        data: sets.map(set => set.repetitions),
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Exercise Sets',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default ExerciseSetsChart;
