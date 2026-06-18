"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface AKHLAKRadarChartProps {
  data: {
    subject: string;
    value: number;
    fullMark?: number;
  }[];
  title?: string;
}

const INDICATOR_COLORS = {
  AMANAH: "#16a34a",
  KOMPETEN: "#2563eb",
  HARMONIS: "#7c3aed",
  LOYAL: "#ea580c",
  ADAPTIF: "#0891b2",
  KOLABORATIF: "#db2777",
};

export function AKHLAKRadarChart({ data, title }: AKHLAKRadarChartProps) {
  const maxValue = 5;

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart outerRadius="70%" data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fontSize: 12, fill: "#374151", fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, maxValue]}
            tick={{ fontSize: 10, fill: "#9ca3af" }}
          />
          <Radar
            name={title || "Skor AKHLAK"}
            dataKey="value"
            stroke="#16a34a"
            fill="#16a34a"
            fillOpacity={0.5}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "8px 12px",
            }}
            formatter={(value: number) => [value.toFixed(2), "Skor"]}
            labelFormatter={(label) => `Indikator: ${label}`}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AKHLAKMultiRadarChart({
  datasets,
}: {
  datasets: {
    name: string;
    color: string;
    data: { subject: string; value: number }[];
  }[];
}) {
  const maxValue = 5;

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart outerRadius="70%" data={datasets[0]?.data || []}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fontSize: 12, fill: "#374151", fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, maxValue]}
            tick={{ fontSize: 10, fill: "#9ca3af" }}
          />
          {datasets.map((dataset) => (
            <Radar
              key={dataset.name}
              name={dataset.name}
              dataKey="value"
              stroke={dataset.color}
              fill={dataset.color}
              fillOpacity={0.2}
              strokeWidth={2}
            />
          ))}
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "8px 12px",
            }}
            formatter={(value: number) => [value.toFixed(2), "Skor"]}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Convert AKHLAK enum to radar chart data format
export function convertToRadarData(
  scores: {
    amanah: number;
    kompeten: number;
    harmonis: number;
    loyal: number;
    adaptif: number;
    kolaboratif: number;
  }
) {
  return [
    { subject: "Amanah", value: scores.amanah || 0 },
    { subject: "Kompeten", value: scores.kompeten || 0 },
    { subject: "Harmonis", value: scores.harmonis || 0 },
    { subject: "Loyal", value: scores.loyal || 0 },
    { subject: "Adaptif", value: scores.adaptif || 0 },
    { subject: "Kolaboratif", value: scores.kolaboratif || 0 },
  ];
}
