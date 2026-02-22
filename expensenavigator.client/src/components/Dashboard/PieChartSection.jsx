import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
const COLORS = ["#4CAF50", "#F44336", "#2196F3", "#FF9800", "#9C27B0"];

export default function PieChartSection({ summary }) {
  if (!summary) {
    return (
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-3">Income vs Expenses</h5>
          <div className="skeleton-box skeleton-chart-lg" />
        </div>
      </div>
    );
  }

  const data = [
    { name: "Income", value: Number(summary.totalIncome) || 0 },
    { name: "Budget", value: Number(summary.totalBudget) || 0 },
    { name: "Expenses", value: Number(summary.totalExpenses) || 0 },
    { name: "Income Left", value: Number(summary.remainingIncome) || 0 },
    { name: "Budget Left", value: Number(summary.remainingBudget) || 0 },
  ];

  const donutData = [
    {
      name: "Expenses",
      value: Number(summary.totalExpenses) || 0,
      color: "#2196F3",
    },
    {
      name: "Income Left",
      value: Number(summary.remainingIncome) || 0,
      color: "#FF9800",
    },
  ].filter((x) => x.value > 0);

  const height = 260;

  const validData = data.filter((x) => x.value > 0);
  const showSkeleton = validData.length === 0 || donutData.length === 0;

  const totalIncomeSafe = Number(summary.totalIncome) || 0;

  return (
    <>
      {/* Summary cards */}
      <div
        className="d-flex flex-wrap justify-content-between mb-4"
        style={{ gap: 10 }}
      >
        {data.map((x, i) => (
          <SummaryCard
            key={i}
            title={x.name}
            value={x.value}
            color={COLORS[i % COLORS.length]}
          />
        ))}
      </div>

      {/* Chart card */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title">Income vs Expenses</h5>

          <div style={{ width: "100%", height: 400 }}>
            {showSkeleton ? (
              <div className="skeleton-box skeleton-chart-lg" />
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="65%"
                    outerRadius="85%"
                    paddingAngle={3}
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value, name) => [
                      `$${Number(value).toFixed(2)}`,
                      name,
                    ]}
                  />

                  {/* Center label */}
                  <text
                    x="50%"
                    y="45%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontSize: 13, fill: "#777" }}
                  >
                    Total Income
                  </text>

                  <text
                    x="50%"
                    y="55%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontSize: 18, fontWeight: 700 }}
                  >
                    ${totalIncomeSafe.toFixed(2)}
                  </text>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function SummaryCard({ title, value = 0, color }) {
  const safeValue = Number(value) || 0;
  return (
    <div style={{ flex: "1 1 18%", margin: 5 }}>
      <div
        className="card shadow-sm"
        style={{ borderLeft: `4px solid ${color}` }}
      >
        <div className="card-body text-center">
          <h6 className="text-muted">{title}</h6>
          <h4 style={{ color }}>${safeValue.toFixed(2)}</h4>
        </div>
      </div>
    </div>
  );
}

// // New Design

// // components/Dashboard/PieChartSection.jsx
// import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// const COLORS = ["#16a34a", "#7c3aed", "#ef4444", "#2563eb", "#4338ca"];

// export default function PieChartSection({ summary }) {
//   if (!summary) {
//     return (
//       <div className="panel chart-card">
//         <h6 className="chart-title mb-3">Income vs Expenses</h6>
//         <div
//           className="skeleton-box skeleton-chart-lg"
//           style={{ height: 240 }}
//         />
//       </div>
//     );
//   }

//   const data = [
//     {
//       name: "Income",
//       value: Number(summary.totalIncome) || 0,
//       variant: "income",
//     },
//     {
//       name: "Budget",
//       value: Number(summary.totalBudget) || 0,
//       variant: "budget",
//     },
//     {
//       name: "Expenses",
//       value: Number(summary.totalExpenses) || 0,
//       variant: "expenses",
//     },
//     {
//       name: "Income Left",
//       value: Number(summary.remainingIncome) || 0,
//       variant: "income-left",
//     },
//     {
//       name: "Budget Left",
//       value: Number(summary.remainingBudget) || 0,
//       variant: "budget-left",
//     },
//   ];

//   const donutData = [
//     {
//       name: "Expenses",
//       value: Number(summary.totalExpenses) || 0,
//       color: "#ef4444",
//     },
//     {
//       name: "Income Left",
//       value: Number(summary.remainingIncome) || 0,
//       color: "#16a34a",
//     },
//   ].filter((x) => x.value > 0);

//   const totalIncomeSafe = Number(summary.totalIncome) || 0;
//   const validData = data.filter((x) => x.value > 0);
//   const showSkeleton = validData.length === 0 || donutData.length === 0;

//   return (
//     <>
//       {/* Gradient summary tiles */}
//       <div className="row g-3 mb-4">
//         {data.map((x, i) => (
//           <div className="col-12 col-sm-6 col-lg-2 metric-col" key={i}>
//             <SummaryCard title={x.name} value={x.value} variant={x.variant} />
//           </div>
//         ))}
//       </div>

//       {/* Donut (kept for quick overview; optional) */}
//       <div className="panel chart-card">
//         <h6 className="chart-title">Income vs Expenses</h6>
//         <div style={{ width: "100%", height: 260 }}>
//           {showSkeleton ? (
//             <div
//               className="skeleton-box skeleton-chart-lg"
//               style={{ height: 220 }}
//             />
//           ) : (
//             <ResponsiveContainer>
//               <PieChart>
//                 <Pie
//                   data={donutData}
//                   dataKey="value"
//                   nameKey="name"
//                   innerRadius="65%"
//                   outerRadius="85%"
//                   paddingAngle={3}
//                 >
//                   {donutData.map((entry, index) => (
//                     <Cell key={index} fill={entry.color} />
//                   ))}
//                 </Pie>

//                 <Tooltip
//                   formatter={(value, name) => [
//                     `$${Number(value).toFixed(2)}`,
//                     name,
//                   ]}
//                 />

//                 {/* Center label */}
//                 <text
//                   x="50%"
//                   y="45%"
//                   textAnchor="middle"
//                   dominantBaseline="middle"
//                   style={{ fontSize: 12, fill: "#6B7280" }}
//                 >
//                   Total Income
//                 </text>
//                 <text
//                   x="50%"
//                   y="57%"
//                   textAnchor="middle"
//                   dominantBaseline="middle"
//                   style={{ fontSize: 20, fontWeight: 800, fill: "#111827" }}
//                 >
//                   ${totalIncomeSafe.toFixed(2)}
//                 </text>
//               </PieChart>
//             </ResponsiveContainer>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }

// function SummaryCard({ title, value = 0, variant }) {
//   const safeValue = Number(value) || 0;
//   const variantClass =
//     variant === "income"
//       ? "metric--income"
//       : variant === "budget"
//         ? "metric--budget"
//         : variant === "expenses"
//           ? "metric--expenses"
//           : variant === "income-left"
//             ? "metric--income-left"
//             : "metric--budget-left";

//   const Icon = () => (
//     <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" opacity="0.9">
//       <path d="M3 13h2v8H3v-8zm4-4h2v12H7V9zm4-6h2v18h-2V3zm4 10h2v8h-2v-8zm4-6h2v14h-2V7z"></path>
//     </svg>
//   );

//   return (
//     <div className={`metric-card ${variantClass}`}>
//       <div className="blob"></div>
//       <div className="metric-body d-flex align-items-center justify-content-between">
//         <div>
//           <h6 className="mb-1">{title}</h6>
//           <div className="metric-value">${safeValue.toFixed(2)}</div>
//           <small>This month</small>
//         </div>
//         <Icon />
//       </div>
//     </div>
//   );
// }
