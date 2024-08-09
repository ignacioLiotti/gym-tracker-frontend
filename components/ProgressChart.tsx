'use client'

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Weight, Repeat, Dumbbell, LayoutGrid, LayoutList, BarChart2, LineChart as LineChartIcon, AreaChart as AreaChartIcon } from 'lucide-react';
import { Button } from "@/components/ui/button"

interface ExerciseData {
  id: string;
  repetitions: number;
  weight: number;
  timestamp: string;
}

interface ChartData {
  date: string;
  value: number;
}

interface ExerciseProgressChartProps {
  data: ExerciseData[];
  exerciseName: string;
}

type ChartType = 'bar' | 'line' | 'area';

const ExerciseProgressChart: React.FC<ExerciseProgressChartProps> = ({ data, exerciseName }) => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [metric, setMetric] = useState<'repetitions' | 'weight' | 'volume'>('repetitions');
  const [showAggregate, setShowAggregate] = useState(false);
  const [chartType, setChartType] = useState<ChartType>('bar');

  useEffect(() => {
    let processedData: ChartData[];

    if (showAggregate) {
      const aggregatedData = data.reduce((acc, item) => {
        const date = new Date(item.timestamp).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { sum: 0, count: 0 };
        }
        const value = metric === 'volume' ? item.repetitions * item.weight : item[metric];
        acc[date].sum += value;
        acc[date].count += 1;
        return acc;
      }, {} as Record<string, { sum: number; count: number }>);

      processedData = Object.entries(aggregatedData).map(([date, { sum, count }]) => ({
        date,
        value: sum / count, // Calculate mean
      }));
    } else {
      processedData = data.map(item => ({
        date: new Date(item.timestamp).toLocaleDateString(),
        value: metric === 'volume' ? item.repetitions * item.weight : item[metric],
      }));
    }

    setChartData(processedData);
  }, [data, metric, showAggregate]);

  if (chartData.length === 0) {
    return <div>Loading chart data...</div>;
  }

  const metricLabels = {
    repetitions: 'Repetitions',
    weight: 'Weight (kg)',
    volume: 'Volume (kg x reps)',
  };

  const renderChart = () => {
    const props = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...props}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" name={`${metricLabels[metric]}${showAggregate ? ' (Mean)' : ''}`} />
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart {...props}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="value" fill="#8884d8" stroke="#8884d8" name={`${metricLabels[metric]}${showAggregate ? ' (Mean)' : ''}`} />
          </AreaChart>
        );
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-x-2">
          <Button
            variant={metric === 'repetitions' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setMetric('repetitions')}
            title="Repetitions"
          >
            <Repeat className="h-4 w-4" />
          </Button>
          <Button
            variant={metric === 'weight' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setMetric('weight')}
            title="Weight"
          >
            <Weight className="h-4 w-4" />
          </Button>
          <Button
            variant={metric === 'volume' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setMetric('volume')}
            title="Volume"
          >
            <Dumbbell className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-x-2">
          <Button
            variant={chartType === 'bar' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setChartType('bar')}
            title="Bar Chart"
          >
            <BarChart2 className="h-4 w-4" />
          </Button>
          <Button
            variant={chartType === 'area' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setChartType('area')}
            title="Area Chart"
          >
            <AreaChartIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={showAggregate ? 'default' : 'outline'}
            size="icon"
            onClick={() => setShowAggregate(!showAggregate)}
            title={showAggregate ? "Show Individual Sets" : "Show Aggregated Sets"}
          >
            {showAggregate ? <LayoutList className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExerciseProgressChart;