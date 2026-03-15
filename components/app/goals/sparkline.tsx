"use client"

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts"

interface SparklineProps {
  data: { week: number; value: number }[]
  colorClass: string
  currentWeek: number
  /** On narrow screens, show as 13 dots instead of line */
  compactDots?: boolean
}

const COLOR_MAP: Record<string, string> = {
  "text-emerald-500": "rgb(34 197 94)",
  "text-amber-500": "rgb(245 158 11)",
  "text-rose-500": "rgb(244 63 94)",
}

export function Sparkline({ data, colorClass, currentWeek, compactDots }: SparklineProps) {
  const stroke = COLOR_MAP[colorClass] ?? "rgb(61 30 56)"
  const fullData = Array.from({ length: 13 }, (_, i) => ({
    week: i + 1,
    value: data.find((d) => d.week === i + 1)?.value ?? null,
  }))

  if (compactDots) {
    return (
      <div className="flex gap-0.5 items-center h-6">
        {fullData.map((d) => (
          <div
            key={d.week}
            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
              d.value === null
                ? "bg-[#3C1E38]/15"
                : d.value >= 0.7
                  ? "bg-emerald-500"
                  : d.value >= 0.4
                    ? "bg-amber-500"
                    : "bg-rose-500"
            } ${d.week === currentWeek ? "ring-1 ring-[#3C1E38] ring-offset-1" : ""}`}
            title={`Week ${d.week}: ${d.value === null ? "—" : Math.round(d.value * 100) + "%"}`}
          />
        ))}
      </div>
    )
  }

  const plotData = fullData.map((d) => ({ ...d, value: d.value ?? 0 }))

  return (
    <div className="h-10 w-[150px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={plotData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <XAxis dataKey="week" hide />
          <YAxis hide domain={[0, 1]} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={stroke}
            strokeWidth={data.length >= 3 ? 1.5 : 0}
            dot={({ cx, cy, payload }) =>
              payload.value !== null && payload.value !== undefined ? (
                <circle
                  key={payload.week}
                  cx={cx}
                  cy={cy}
                  r={payload.week === currentWeek ? 4 : 2}
                  fill={stroke}
                  stroke={payload.week === currentWeek ? "#3C1E38" : "transparent"}
                  strokeWidth={1}
                />
              ) : null
            }
            isAnimationActive={false}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
