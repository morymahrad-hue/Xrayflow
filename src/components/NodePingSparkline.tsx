import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  YAxis
} from 'recharts';

interface NodePingSparklineProps {
  history?: number[];
  currentPing: number;
  colorHex?: string;
  gradientId: string;
}

export const NodePingSparkline: React.FC<NodePingSparklineProps> = ({
  history,
  currentPing,
  colorHex,
  gradientId
}) => {
  // Ensure we have a valid array of points
  const rawData = history && history.length > 0 ? history : [currentPing];
  const data = rawData.map((val, idx) => ({
    step: idx + 1,
    ping: val
  }));

  // Auto determine color if not provided
  let strokeColor = colorHex;
  if (!strokeColor) {
    if (currentPing <= 50) strokeColor = '#10b981'; // Emerald
    else if (currentPing <= 90) strokeColor = '#38bdf8'; // Sky
    else if (currentPing <= 160) strokeColor = '#f59e0b'; // Amber
    else strokeColor = '#c084fc'; // Violet
  }

  const pings = data.map((d) => d.ping);
  const minPing = Math.max(0, Math.min(...pings) - 5);
  const maxPing = Math.max(...pings) + 5;

  return (
    <div className="w-full h-9 min-w-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={36}>
        <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.35} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <YAxis domain={[minPing, maxPing]} hide />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const p = payload[0].value;
                return (
                  <div className="px-2 py-0.5 bg-slate-950/95 border border-slate-700/80 rounded-md text-[10px] font-mono font-bold text-slate-100 shadow-xl">
                    {p} ms
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="ping"
            stroke={strokeColor}
            strokeWidth={1.75}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
            dot={false}
            activeDot={{ r: 3, fill: strokeColor, stroke: '#0f172a', strokeWidth: 1.5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
