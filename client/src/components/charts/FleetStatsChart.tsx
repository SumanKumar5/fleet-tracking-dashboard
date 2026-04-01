import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { TripState } from "../../domain/types";

type Props = { trips: TripState[] };

export default function FleetStatsChart({ trips }: Props) {
  const data = [
    {
      name: "Active",
      value: trips.filter((t) => t.status === "active").length,
    },
    {
      name: "Completed",
      value: trips.filter((t) => t.status === "completed").length,
    },
    { name: "Issues", value: trips.filter((t) => t.status === "issue").length },
    {
      name: "Cancelled",
      value: trips.filter((t) => t.status === "cancelled").length,
    },
  ];

  const colors = ["#22c55e", "#3b82f6", "#ef4444", "#6b7280"];

  return (
    <div style={{ width: "100%", height: 250 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value">
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
