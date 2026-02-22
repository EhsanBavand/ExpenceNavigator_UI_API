import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const truncate = (s, n = 14) => (s?.length > n ? s.slice(0, n - 1) + "…" : s);
export default function SubCategoryChart({ data }) {
  if (!data || data.length === 0)
    return <div>No subcategory data to display</div>;

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body" style={{ overflow: "visible" }}>
        <h5 className="card-title">Sub Categories</h5>
        <div style={{ width: "100%", height: 600 }}>
          <ResponsiveContainer>
            <BarChart
              data={data}
              margin={{ top: 10, right: 20, left: 10, bottom: 90 }}
            >
              <XAxis
                dataKey="SubCategoryName"
                interval={0}
                tickLine={false}
                axisLine
                height={110}
                angle={-90}
                textAnchor="end"
                tickMargin={10}
              />
              <YAxis />
              <Tooltip
                cursor={false}
                formatter={(value) => [`$${value}`, "Amount"]}
              />
              <Bar
                dataKey="Amount"
                fill="#6c63ff"
                barSize={22}
                radius={[6, 6, 0, 0]}
                activeBar={false}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// // New Design

// // components/Dashboard/SubCategoryChart.jsx
// import React from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";

// export default function SubCategoryChart({ data }) {
//   if (!data || data.length === 0)
//     return (
//       <div className="panel chart-card mb-4">
//         <h6 className="chart-title">Sub Categories</h6>
//         <div className="text-muted">No subcategory data to display</div>
//       </div>
//     );

//   return (
//     <div className="panel chart-card mb-4">
//       <h6 className="chart-title">Sub Categories</h6>

//       <div
//         className="dashboard-chart-height"
//         style={{ width: "100%", height: 520 }}
//       >
//         <ResponsiveContainer>
//           <BarChart
//             data={data}
//             margin={{ top: 10, right: 20, left: 10, bottom: 90 }}
//           >
//             <XAxis
//               dataKey="SubCategoryName"
//               interval={0}
//               tickLine={false}
//               axisLine={{ stroke: "#e5e7eb" }}
//               height={110}
//               angle={-90}
//               textAnchor="end"
//               tick={{ fill: "#374151", fontSize: 12, fontWeight: 600 }}
//               tickMargin={10}
//             />
//             <YAxis
//               tick={{ fill: "#6B7280", fontSize: 12 }}
//               axisLine={{ stroke: "#e5e7eb" }}
//             />
//             <Tooltip
//               cursor={false}
//               formatter={(value) => [`$${Number(value).toFixed(2)}`, "Amount"]}
//             />
//             <Bar
//               dataKey="Amount"
//               fill="#6c63ff"
//               barSize={20}
//               radius={[6, 6, 0, 0]}
//               activeBar={false}
//               isAnimationActive={false}
//             />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }
