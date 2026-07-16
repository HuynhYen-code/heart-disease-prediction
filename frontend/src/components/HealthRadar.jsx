import React from 'react';
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
} from 'recharts';
import { getRadarData } from '../constants/formConfig';

/**
 * HealthRadar
 * Renders a 6-axis radar chart comparing the patient's values against
 * the healthy-population reference band derived from the dataset.
 */
const HealthRadar = ({ values, darkMode }) => {
    const data = getRadarData(values);
    const tickFill = darkMode ? '#94a3b8' : '#64748b';

    return (
        <ResponsiveContainer width="100%" height={210}>
            <RadarChart data={data} margin={{ top: 8, right: 18, bottom: 8, left: 18 }}>
                <PolarGrid stroke="rgba(148,163,184,0.18)" />
                <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fill: tickFill, fontSize: 11, fontFamily: 'Inter' }}
                />
                <Radar
                    name="Ngưỡng tham chiếu"
                    dataKey="safe"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.07}
                    strokeWidth={2}
                    strokeDasharray="4 2"
                />
                <Radar
                    name="Bệnh nhân"
                    dataKey="value"
                    stroke="#e11d48"
                    fill="#e11d48"
                    fillOpacity={0.22}
                    strokeWidth={2}
                    dot={{ fill: '#e11d48', r: 3 }}
                />
            </RadarChart>
        </ResponsiveContainer>
    );
};

export default HealthRadar;
