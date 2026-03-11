import React from 'react';

interface ScoreRingProps {
    pct: number;
}

const ScoreRing: React.FC<ScoreRingProps> = ({ pct }) => {
    const r = 26;
    const circ = 2 * Math.PI * r;
    const fill = (pct / 100) * circ;
    const color = pct === 100 ? '#10b981' : pct >= 70 ? '#f59e0b' : '#ef4444';

    return (
        <svg width="64" height="64" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r={r} fill="none" stroke="var(--secondary)" strokeWidth="6" />
            <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="6"
                strokeDasharray={`${fill} ${circ - fill}`}
                strokeDashoffset={circ / 4}
                strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
            <text x="32" y="37" textAnchor="middle" fill={color}
                style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
                {pct}%
            </text>
        </svg>
    );
};

export default ScoreRing;
