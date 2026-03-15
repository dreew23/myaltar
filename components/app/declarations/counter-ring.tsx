"use client"

interface Props {
  current: number
  target: number
  size?: number
  strokeWidth?: number
  completed?: boolean
}

export function CounterRing({ current, target, size = 120, strokeWidth = 4, completed }: Props) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(current / Math.max(target, 1), 1)
  const offset = circumference - pct * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size}>
        {/* Background ring */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#F9D57E" strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          className={`transition-all duration-300 ${completed ? "animate-pulse" : ""}`}
          style={{ filter: completed ? "drop-shadow(0 0 6px #F9D57E)" : undefined }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-playfair text-4xl font-bold transition-colors ${completed ? "text-[#F9D57E]" : "text-white"}`}>
          {current}
        </span>
        <span className="text-white/40 text-sm">of {target}</span>
      </div>
    </div>
  )
}
