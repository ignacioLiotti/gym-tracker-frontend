'use client';
import React from 'react';
import { ResponsiveCalendar } from '@nivo/calendar';

const FrequencyChart = () => {
  // Sample data, replace with actual data from your API
  const data = [
    { day: '2023-01-01', value: 1 },
    { day: '2023-01-02', value: 2 },
    // ... more data
  ];

  return (
    <div style={{ height: '200px' }}>
      <ResponsiveCalendar
        data={data}
        from="2023-01-01"
        to="2023-12-31"
        emptyColor="#eeeeee"
        colors={['#61cdbb', '#97e3d5', '#e8c1a0', '#f47560']}
        margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
        yearSpacing={40}
        monthBorderColor="#ffffff"
        dayBorderWidth={2}
        dayBorderColor="#ffffff"
      />
    </div>
  );
};

export default FrequencyChart;