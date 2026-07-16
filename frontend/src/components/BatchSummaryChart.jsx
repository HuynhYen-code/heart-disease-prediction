import React from 'react';
import {
    PieChart, Pie, Cell,
    Tooltip as ReTooltip, Legend, ResponsiveContainer,
} from 'recharts';

/**
 * BatchSummaryChart
 * Donut chart summarising high-risk vs safe patient counts.
 */
const BatchSummaryChart = ({ highRisk, safe, darkMode }) => {
    const data = [
        { name: 'Nguy cơ cao', value: highRisk, color: '#e11d48' },
        { name: 'An toàn',     value: safe,     color: '#10b981' },
    ];

    return (
        <ResponsiveContainer width="100%" height={160}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%" cy="50%"
                    innerRadius={45} outerRadius={70}
                    dataKey="value"
                    paddingAngle={3}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <ReTooltip formatter={(v, n) => [`${v} bệnh nhân`, n]} />
                <Legend
                    iconType="circle"
                    iconSize={10}
                    wrapperStyle={{
                        fontSize: '12px',
                        color: darkMode ? '#94a3b8' : '#64748b',
                    }}
                />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default BatchSummaryChart;
