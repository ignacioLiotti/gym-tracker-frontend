'use client'
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Weight, Repeat, Dumbbell, LayoutGrid, LayoutList, BarChart2, LineChart as LineChartIcon, AreaChart as AreaChartIcon, Clock, Timer, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface ExerciseData {
  id: string;
  repetitions: number;
  weight: number;
  timestamp: string;
  duration: number;
}

interface ChartData {
  date: string;
  [key: string]: number | string;
}

interface ExerciseProgressChartProps {
  data: ExerciseData[];
  exerciseName: string;
}

interface AggregatedMetric {
  sum: number;
  count: number;
}

interface AggregatedData {
  [date: string]: {
    repetitions: AggregatedMetric;
    weight: AggregatedMetric;
    volume: number;
    duration: AggregatedMetric;
    restTime: AggregatedMetric;
  };
}

type ChartType = 'bar' | 'line' | 'area';
type Metric = 'repetitions' | 'weight' | 'volume' | 'duration' | 'restTime';
type TimeRange = 'lastMonth' | 'last3Months' | 'lastYear' | 'allTime';

const ExerciseProgressChart: React.FC<ExerciseProgressChartProps> = ({ data, exerciseName }) => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<Metric[]>(['repetitions']);
  const [showAggregate, setShowAggregate] = useState(false);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [dualMetricMode, setDualMetricMode] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('allTime');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`; // Format as MM/DD
  };

  useEffect(() => {
    let filteredData = data;

    // Filter data based on selected time range
    const now = new Date();
    switch (timeRange) {
      case 'lastMonth':
        filteredData = data.filter(item => new Date(item.timestamp) >= new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()));
        break;
      case 'last3Months':
        filteredData = data.filter(item => new Date(item.timestamp) >= new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()));
        break;
      case 'lastYear':
        filteredData = data.filter(item => new Date(item.timestamp) >= new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()));
        break;
      // 'allTime' doesn't need filtering
    }

    let processedData: ChartData[];

    if (showAggregate) {
      const aggregatedData = filteredData.reduce((acc: AggregatedData, item, index, arr) => {
        const date = formatDate(item.timestamp);
        if (!acc[date]) {
          acc[date] = {
            repetitions: { sum: 0, count: 0 },
            weight: { sum: 0, count: 0 },
            volume: 0,
            duration: { sum: 0, count: 0 },
            restTime: { sum: 0, count: 0 }
          };
        }

        acc[date].repetitions.sum += item.repetitions;
        acc[date].repetitions.count += 1;
        acc[date].weight.sum += item.weight;
        acc[date].weight.count += 1;
        acc[date].volume += item.repetitions * item.weight;
        acc[date].duration.sum += item.duration;
        acc[date].duration.count += 1;

        if (index > 0) {
          const prevDate = new Date(arr[index - 1].timestamp).toLocaleDateString();
          if (prevDate === date) {
            const restTime = (new Date(item.timestamp).getTime() - new Date(arr[index - 1].timestamp).getTime()) / 1000;
            acc[date].restTime.sum += restTime;
            acc[date].restTime.count += 1;
          }
        }

        return acc;
      }, {});

      processedData = Object.entries(aggregatedData).map(([date, metrics]) => {
        const entry: ChartData = { date };
        selectedMetrics.forEach(metric => {
          if (metric === 'volume') {
            entry[metric] = metrics[metric];
          } else {
            const metricData = metrics[metric as keyof typeof metrics];
            entry[metric] = (metricData as AggregatedMetric).count > 0 ? (metricData as AggregatedMetric).sum / (metricData as AggregatedMetric).count : 0;
          }
        });
        return entry;
      });
    } else {
      processedData = filteredData.map((item, index, arr) => {
        const entry: ChartData = {
          date: formatDate(item.timestamp),
          repetitions: item.repetitions,
          weight: item.weight,
          volume: item.repetitions * item.weight,
          duration: item.duration,
        };

        if (index > 0) {
          const prevDate = new Date(arr[index - 1].timestamp).toLocaleDateString();
          const currentDate = new Date(item.timestamp).toLocaleDateString();
          if (prevDate === currentDate) {
            entry.restTime = (new Date(item.timestamp).getTime() - new Date(arr[index - 1].timestamp).getTime()) / 1000;
          } else {
            entry.restTime = 0;
          }
        } else {
          entry.restTime = 0;
        }

        return entry;
      });
    }

    setChartData(processedData);
  }, [data, selectedMetrics, showAggregate, timeRange]);

  if (chartData.length === 0) {
    return <div>Loading chart data...</div>;
  }

  const metricLabels: Record<Metric, string> = {
    repetitions: 'Repetitions',
    weight: 'Weight (kg)',
    volume: 'Volume (kg x reps)',
    duration: 'Duration (seconds)',
    restTime: 'Rest Time (seconds)',
  };

  const metricColors: Record<Metric, string> = {
    repetitions: '#8884d8',
    weight: '#82ca9d',
    volume: '#ffc658',
    duration: '#ff8042',
    restTime: '#0088fe',
  };


  const renderChart = (): React.ReactElement => {
    const props = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    const renderBars = () =>
      selectedMetrics.slice(0, dualMetricMode ? 2 : 1).map((metric, index) => (
        <Bar
          key={metric}
          dataKey={metric}
          fill={metricColors[metric]}
          name={`${metricLabels[metric]}${showAggregate ? ' (Mean)' : ''}`}
          yAxisId={dualMetricMode ? index : 0}
        />
      ));

    const renderLines = () =>
      selectedMetrics.slice(0, dualMetricMode ? 2 : 1).map((metric, index) => (
        <Line
          key={metric}
          type="monotone"
          dataKey={metric}
          stroke={metricColors[metric]}
          strokeWidth={3}
          dot={{ fill: metricColors[metric], r: 4 }}
          activeDot={{ r: 8 }}
          name={`${metricLabels[metric]}${showAggregate ? ' (Mean)' : ''}`}
          yAxisId={dualMetricMode ? index : 0}
        />
      ));

    const renderAreas = () =>
      selectedMetrics.slice(0, dualMetricMode ? 2 : 1).map((metric, index) => (
        <Area
          key={metric}
          type="monotone"
          dataKey={metric}
          fill={`${metricColors[metric]}70`}
          stroke={metricColors[metric]}
          strokeWidth={2}
          name={`${metricLabels[metric]}${showAggregate ? ' (Mean)' : ''}`}
          yAxisId={dualMetricMode ? index : 0}
        />
      ));

    const renderYAxes = () =>
      selectedMetrics.slice(0, dualMetricMode ? 2 : 1).map((metric, index) => (
        <YAxis
          key={metric}
          yAxisId={dualMetricMode ? index : 0}
          orientation={dualMetricMode && index === 1 ? "right" : "left"}
          stroke={metricColors[metric]}
          strokeWidth={2}
          tick={{
            fill: metricColors[metric],
            fontWeight: 'bold',
            fontSize: 12
          }}
          tickLine={{
            stroke: metricColors[metric],
            strokeWidth: 2
          }}
          axisLine={{
            strokeWidth: 2
          }}
        />
      ));

    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...props}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontWeight: 'bold' }}
              tickLine={{ strokeWidth: 2 }}
              axisLine={{ strokeWidth: 2 }}
            />
            {renderYAxes()}
            <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', fontWeight: 'bold' }} />
            <Legend wrapperStyle={{ fontWeight: 'bold' }} />
            {renderBars()}
          </BarChart>
        );
      case 'line':
        return (
          <LineChart {...props}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontWeight: 'bold' }}
              tickLine={{ strokeWidth: 2 }}
              axisLine={{ strokeWidth: 2 }}
            />
            {renderYAxes()}
            <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', fontWeight: 'bold' }} />
            <Legend wrapperStyle={{ fontWeight: 'bold' }} />
            {renderLines()}
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart {...props}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontWeight: 'bold' }}
              tickLine={{ strokeWidth: 2 }}
              axisLine={{ strokeWidth: 2 }}
            />
            {renderYAxes()}
            <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', fontWeight: 'bold' }} />
            <Legend wrapperStyle={{ fontWeight: 'bold' }} />
            {renderAreas()}
          </AreaChart>
        );
    }
  };

  const toggleMetric = (metric: Metric) => {
    setSelectedMetrics(prevMetrics => {
      // If dualMetricMode is false, always replace the selectedMetrics with the current metric
      if (!dualMetricMode) {
        return [metric];
      }

      // Existing logic for dualMetricMode being true
      if (prevMetrics.includes(metric)) {
        return prevMetrics.filter(m => m !== metric);
      } else if (prevMetrics.length < 2) {
        return [...prevMetrics, metric].slice(-2);
      } else {
        return [prevMetrics[1], metric];
      }
    });
  };

  const handleCheck = (e: boolean | ((prevState: boolean) => boolean)) => {
    // Check if we are turning dualMetricMode on and selectedMetrics has only one item
    if (e && selectedMetrics.length === 1) {
      // Directly set dualMetricMode to true without modifying selectedMetrics
      setDualMetricMode(true);
    } else {
      // For all other cases, toggle dualMetricMode
      setDualMetricMode(e);
      // If turning dualMetricMode off and there are more than one selected metrics,
      // keep only the first one in the array to avoid deleting the only selected metric.
      if (!e && selectedMetrics.length > 1) {
        setSelectedMetrics(prevMetrics => prevMetrics.slice(0, 1));
      }
    }
  }

  return (

    <Card className="mb-6">
      <CardHeader>
        <CardTitle className='flex justify-between'>
          Progress Over Time
          <div className="flex items-center space-x-2">
            <Switch
              checked={dualMetricMode}
              onCheckedChange={(e) => handleCheck(e)}
              id="dual-metric-mode"
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full space-y-4 overflow-hidden ">
          <div className='flex justify-between'>

            <div className="space-x-2 flex items-center">
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
            </div>
            <div className='flex justify-center items-center gap-2'>

              <Button
                variant={showAggregate ? 'default' : 'outline'}
                size="icon"
                onClick={() => setShowAggregate(!showAggregate)}
                title={showAggregate ? "Show Individual Sets" : "Show Aggregated Sets"}
              >
                {showAggregate ? <LayoutList className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
              </Button>
              <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
                <SelectTrigger className="w-[100px] px-2">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lastMonth">Last Month</SelectItem>
                  <SelectItem value="last3Months">Last 3 Months</SelectItem>
                  <SelectItem value="lastYear">Last Year</SelectItem>
                  <SelectItem value="allTime">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>


          <div className="w-full h-[300px] flex items-start justify-start m-0 p-0 -ml-16" style={{ width: 'calc(100vw + 10px)' }}>
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between items-center">
            <div className="space-x-2 flex">
              {(['repetitions', 'weight', 'volume', 'duration', 'restTime'] as Metric[]).map(m => (
                <Button
                  key={m}
                  variant={selectedMetrics.includes(m) ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => toggleMetric(m)}
                  title={metricLabels[m]}
                >
                  {m === 'repetitions' && <Repeat className="h-4 w-4" />}
                  {m === 'weight' && <Weight className="h-4 w-4" />}
                  {m === 'volume' && <Dumbbell className="h-4 w-4" />}
                  {m === 'duration' && <Clock className="h-4 w-4" />}
                  {m === 'restTime' && <Timer className="h-4 w-4" />}
                </Button>
              ))}
            </div>

          </div>
        </div>
      </CardContent>
    </Card>

  );
};

export default ExerciseProgressChart;