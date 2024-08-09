import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartOptions } from 'chart.js';
import _ from 'lodash';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Set {
  id: string;
  exerciseId: string;
  repetitions: string;
  weight: string;
  timestamp: string;
}

interface ExerciseSetsChartProps {
  sets: Set[];
}

const ExerciseSetsChart: React.FC<ExerciseSetsChartProps> = ({ sets }) => {
  const groupedSets = _.groupBy(sets, set => set.timestamp.split('T')[0]);

  const averagedSets = _.mapValues(groupedSets, dailySets => ({
    weight: _.round(_.meanBy(dailySets, set => parseFloat(set.weight)), 1),
    repetitions: _.round(_.meanBy(dailySets, set => parseInt(set.repetitions, 10)), 0),
  }));

  const sortedEntries = Object.entries(averagedSets).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());
  const limitedEntries = sortedEntries.slice(-10);

  const labels = limitedEntries.map(([date]) => date);
  const weights = limitedEntries.map(([, data]) => data.weight);
  const repetitions = limitedEntries.map(([, data]) => data.repetitions);

  const data = {
    labels,
    datasets: [
      {
        label: 'Weight',
        data: weights,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        yAxisID: 'y-axis-weight',
      },
      {
        label: 'Repetitions',
        data: repetitions,
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        yAxisID: 'y-axis-reps',
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Exercise Progress',
      },
    },
    scales: {
      'y-axis-weight': {
        type: 'linear' as const,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Weight',
        },
        min: Math.max(0, Math.min(...weights) - 5),
        max: Math.max(...weights) + 5,
      },
      'y-axis-reps': {
        type: 'linear' as const,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Repetitions',
        },
        min: Math.max(0, Math.min(...repetitions) - 2),
        max: Math.max(...repetitions) + 2,
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
    },
  };

  return (
    <div style={{ height: '400px' }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default ExerciseSetsChart;