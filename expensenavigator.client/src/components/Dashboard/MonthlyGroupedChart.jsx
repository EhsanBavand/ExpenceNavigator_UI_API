import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  LabelList,
  Text,
} from "recharts";
const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Plain number formatter: no currency symbol, with thousand separators and 2 decimals */
function fmtNumber(value) {
  const num = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(num)) return String(value);
  return new Intl.NumberFormat(undefined, {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

export default function MonthlyGroupedBarChart({
  data,
  height = 360,
  showLegend = true,
  colors = {
    expense: "#2196F3",
    budget: "#FF9800",
    income: "#4CAF50",
  },
}) {
  const chartData = (data || []).map((d) => ({
    name: monthNames[(d.month ?? 1) - 1],
    Expense: d.expense ?? null,
    Budget: d.budget ?? null,
    Income: d.income ?? null,
  }));

  const renderVerticalTopLabel = (props) => {
    const { x, y, width, value } = props;
    if (value === null || value === undefined) return null;

    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return null;

    // Skip minuscule values to avoid crowding at the baseline
    const MIN_FOR_LABEL = 0.01;
    if (Math.abs(numeric) < MIN_FOR_LABEL) return null;

    const labelText = fmtNumber(numeric);

    const centerX = x + width / 2;
    const topY = y - 8;

    return (
      <Text
        x={centerX}
        y={topY}
        textAnchor="middle"
        verticalAnchor="end"
        angle={-90} // vertical
        fill="#374151"
        fontSize={13}
        fontWeight="bold"
        fontFamily="system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
      >
        {labelText}
      </Text>
    );
  };

  function fmtNumber(value) {
    const num = typeof value === "string" ? Number(value) : value;
    if (!Number.isFinite(num)) return String(value);
    return new Intl.NumberFormat(undefined, {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 12, left: 12, bottom: 12 }}
      >
        <XAxis dataKey="name" />
        <XAxis dataKey="name" />
        <YAxis
          tickFormatter={(v) => fmtNumber(v)}
          tick={{ fill: "#374151", fontSize: 12 }}
          axisLine={true}
          tickLine={false}
          width={48}
        />
        {showLegend && <Legend />}
        <Bar dataKey="Expense" fill={colors.expense} radius={[4, 4, 0, 0]}>
          <LabelList dataKey="Expense" content={renderVerticalTopLabel} />
        </Bar>
        <Bar dataKey="Budget" fill={colors.budget} radius={[4, 4, 0, 0]}>
          <LabelList dataKey="Budget" content={renderVerticalTopLabel} />
        </Bar>
        <Bar dataKey="Income" fill={colors.income} radius={[4, 4, 0, 0]}>
          <LabelList dataKey="Income" content={renderVerticalTopLabel} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// // New Design
// // components/Dashboard/MonthlyGroupedChart.jsx
// import React from "react";
// import {
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Legend,
//   Tooltip,
//   LabelList,
//   Text,
// } from "recharts";

// const monthNames = [
//   "Jan",
//   "Feb",
//   "Mar",
//   "Apr",
//   "May",
//   "Jun",
//   "Jul",
//   "Aug",
//   "Sep",
//   "Oct",
//   "Nov",
//   "Dec",
// ];

// function fmtNumber(value) {
//   const num = typeof value === "string" ? Number(value) : value;
//   if (!Number.isFinite(num)) return String(value);
//   return new Intl.NumberFormat(undefined, {
//     style: "decimal",
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 2,
//   }).format(num);
// }

// export default function MonthlyGroupedBarChart({
//   data,
//   height = 360,
//   showLegend = true,
//   colors = {
//     expense: "#ef4444",
//     budget: "#2563eb",
//     income: "#16a34a",
//   },
// }) {
//   const chartData = (data || []).map((d) => ({
//     name: monthNames[(d.month ?? 1) - 1],
//     Expense: d.expense ?? null,
//     Budget: d.budget ?? null,
//     Income: d.income ?? null,
//   }));

//   const renderVerticalTopLabel = (props) => {
//     const { x, y, width, value } = props;
//     if (value === null || value === undefined) return null;
//     const numeric = Number(value);
//     if (!Number.isFinite(numeric)) return null;
//     if (Math.abs(numeric) < 0.01) return null;
//     const labelText = fmtNumber(numeric);
//     const centerX = x + width / 2;
//     const topY = y - 6;
//     return (
//       <Text
//         x={centerX}
//         y={topY}
//         textAnchor="middle"
//         verticalAnchor="end"
//         angle={0}
//         fill="#374151"
//         fontSize={12}
//         fontWeight="bold"
//         fontFamily="system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
//       >
//         {labelText}
//       </Text>
//     );
//   };

//   return (
//     <ResponsiveContainer
//       width="100%"
//       height={height}
//       className="dashboard-chart-height"
//     >
//       <BarChart
//         data={chartData}
//         margin={{ top: 12, right: 12, left: 8, bottom: 8 }}
//       >
//         <XAxis
//           dataKey="name"
//           tick={{ fill: "#6B7280", fontSize: 12 }}
//           axisLine={{ stroke: "#e5e7eb" }}
//           tickLine={false}
//         />
//         <YAxis
//           tickFormatter={(v) => fmtNumber(v)}
//           tick={{ fill: "#6B7280", fontSize: 12 }}
//           axisLine={{ stroke: "#e5e7eb" }}
//           tickLine={false}
//           width={48}
//         />
//         {showLegend && (
//           <Legend
//             verticalAlign="bottom"
//             align="center"
//             wrapperStyle={{ paddingTop: 8 }}
//           />
//         )}
//         <Tooltip
//           formatter={(value, name) => [`$${Number(value).toFixed(2)}`, name]}
//         />

//         <Bar
//           dataKey="Income"
//           fill={colors.income}
//           radius={[6, 6, 0, 0]}
//           maxBarSize={26}
//         >
//           <LabelList dataKey="Income" content={renderVerticalTopLabel} />
//         </Bar>
//         <Bar
//           dataKey="Expense"
//           fill={colors.expense}
//           radius={[6, 6, 0, 0]}
//           maxBarSize={26}
//         >
//           <LabelList dataKey="Expense" content={renderVerticalTopLabel} />
//         </Bar>
//         <Bar
//           dataKey="Budget"
//           fill={colors.budget}
//           radius={[6, 6, 0, 0]}
//           maxBarSize={26}
//         >
//           <LabelList dataKey="Budget" content={renderVerticalTopLabel} />
//         </Bar>
//       </BarChart>
//     </ResponsiveContainer>
//   );
// }
