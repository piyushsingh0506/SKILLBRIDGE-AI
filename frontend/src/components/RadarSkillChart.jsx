import React from 'react';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Legend, Tooltip
} from 'recharts';

const RadarSkillChart = ({ data, height = 300 }) => {
  // Fallback demo data if student has few skills
  const chartData = (data && data.length >= 3) ? data : [
    { subject: 'Python & Data', student: 88, benchmark: 80 },
    { subject: 'SQL & DB', student: 82, benchmark: 85 },
    { subject: 'Ayush / Domain', student: 85, benchmark: 75 },
    { subject: 'BI & Excel', student: 90, benchmark: 85 },
    { subject: 'GCP Trials', student: 76, benchmark: 80 },
    { subject: 'Soft Skills', student: 80, benchmark: 75 }
  ];

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
          <PolarGrid stroke="#334155" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: '#64748b', fontSize: 9 }}
            stroke="#1e293b"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#f8fafc'
            }}
          />
          <Radar
            name="Your Verified Score"
            dataKey="student"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.45}
          />
          <Radar
            name="Industry Benchmark"
            dataKey="benchmark"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.2}
          />
          <Legend
            wrapperStyle={{
              fontSize: '11px',
              color: '#94a3b8',
              paddingTop: '10px'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarSkillChart;
