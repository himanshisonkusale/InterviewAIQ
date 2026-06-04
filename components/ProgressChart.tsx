"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface CategoryScore {
  name: string;
  score: number;
}

interface FeedbackEntry {
  id: string;
  createdAt: string;
  totalScore: number;
  categoryScores: CategoryScore[];
  terminatedByFlags?: boolean;
}

interface ProgressChartProps {
  feedbackHistory: FeedbackEntry[];
}

// Category ke short labels (chart mein jagah kam hai)
const CATEGORY_KEYS = [
  { key: "Communication Skills", short: "Comm", color: "#00F2FE" },
  { key: "Technical Knowledge", short: "Tech", color: "#a78bfa" },
  { key: "Problem-Solving",     short: "Problem", color: "#34d399" },
  { key: "Cultural & Role Fit", short: "Culture", color: "#fbbf24" },
  { key: "Confidence & Clarity",short: "Confidence", color: "#f87171" },
];

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#13131c] border border-[#00F2FE]/20 rounded-xl px-4 py-3 shadow-xl text-xs">
        <p className="text-white/60 mb-2 font-semibold">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-white/70">{entry.name}:</span>
            <span className="text-white font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function ProgressChart({ feedbackHistory }: ProgressChartProps) {
  if (!feedbackHistory || feedbackHistory.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="text-4xl mb-3">📊</span>
        <p className="text-white/50 text-sm">
          Complete at least 2 interviews to see your progress chart.
        </p>
      </div>
    );
  }

  // Chart ke liye data transform karo
  const chartData = feedbackHistory.map((fb, index) => {
    const date = new Date(fb.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });

    const entry: Record<string, any> = {
      label: `#${index + 1} (${date})`,
      "Total Score": fb.terminatedByFlags ? 0 : fb.totalScore,
    };

    CATEGORY_KEYS.forEach(({ key, short }) => {
      const cat = fb.categoryScores?.find((c) => c.name === key);
      entry[short] = fb.terminatedByFlags ? 0 : (cat?.score ?? 0);
    });

    return entry;
  });

  // Progress message: last vs first totalScore
  const first = feedbackHistory[0];
  const last = feedbackHistory[feedbackHistory.length - 1];
  const diff = (last.totalScore ?? 0) - (first.totalScore ?? 0);

  // Best improved category
  const bestCategory = CATEGORY_KEYS.reduce(
    (best, cat) => {
      const firstScore =
        first.categoryScores?.find((c) => c.name === cat.key)?.score ?? 0;
      const lastScore =
        last.categoryScores?.find((c) => c.name === cat.key)?.score ?? 0;
      const improvement = lastScore - firstScore;
      return improvement > best.improvement
        ? { name: cat.key, short: cat.short, improvement, color: cat.color }
        : best;
    },
    { name: "", short: "", improvement: -Infinity, color: "" }
  );

  return (
    <div className="flex flex-col gap-6">

      {/* ── Progress Summary Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

        {/* Overall change */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl px-4 py-4 flex flex-col gap-1">
          <p className="text-xs text-white/40 font-medium">Overall Progress</p>
          <p className={`text-2xl font-black ${diff >= 0 ? "text-green-400" : "text-red-400"}`}>
            {diff >= 0 ? "+" : ""}{diff}
          </p>
          <p className="text-xs text-white/40">
            {first.totalScore} → {last.totalScore}
          </p>
        </div>

        {/* Interviews taken */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl px-4 py-4 flex flex-col gap-1">
          <p className="text-xs text-white/40 font-medium">Interviews Taken</p>
          <p className="text-2xl font-black text-[#00F2FE]">{feedbackHistory.length}</p>
          <p className="text-xs text-white/40">total sessions</p>
        </div>

        {/* Best improved category */}
        {bestCategory.improvement > 0 && (
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl px-4 py-4 flex flex-col gap-1 col-span-2 md:col-span-1">
            <p className="text-xs text-white/40 font-medium">Most Improved</p>
            <p className="text-lg font-black" style={{ color: bestCategory.color }}>
              +{bestCategory.improvement}
            </p>
            <p className="text-xs text-white/40">{bestCategory.name}</p>
          </div>
        )}
      </div>

      {/* ── Line Chart ── */}
      <div className="w-full bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 md:p-6">
        <p className="text-sm font-semibold text-white/60 mb-4">Score Trend per Interview</p>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="label"
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}
            />

            {/* Total Score — thicker line */}
            <Line
              type="monotone"
              dataKey="Total Score"
              stroke="#ffffff"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#ffffff" }}
              activeDot={{ r: 6 }}
            />

            {/* 5 category lines */}
            {CATEGORY_KEYS.map(({ short, color }) => (
              <Line
                key={short}
                type="monotone"
                dataKey={short}
                stroke={color}
                strokeWidth={1.5}
                dot={{ r: 3, fill: color }}
                activeDot={{ r: 5 }}
                strokeDasharray="4 2"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Per-Category Progress Bars ── */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-white/60">Category Breakdown (First → Latest)</p>
        {CATEGORY_KEYS.map(({ key, color }) => {
          const firstScore = first.categoryScores?.find((c) => c.name === key)?.score ?? 0;
          const lastScore = last.categoryScores?.find((c) => c.name === key)?.score ?? 0;
          const improvement = lastScore - firstScore;

          return (
            <div key={key} className="flex items-center gap-4">
              <p className="text-xs text-white/50 w-32 shrink-0">{key}</p>
              <div className="flex-1 bg-white/[0.05] rounded-full h-2 relative overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${lastScore}%`, background: color }}
                />
              </div>
              <div className="flex items-center gap-1 w-20 shrink-0 justify-end">
                <span className="text-xs font-bold text-white">{lastScore}</span>
                {improvement !== 0 && (
                  <span className={`text-xs font-bold ${improvement > 0 ? "text-green-400" : "text-red-400"}`}>
                    ({improvement > 0 ? "+" : ""}{improvement})
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}