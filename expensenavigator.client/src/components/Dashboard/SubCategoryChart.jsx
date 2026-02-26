import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = [
    "#6c63ff", "#ff6384", "#36a2eb", "#ffce56", "#4bc0c0",
    "#9966ff", "#ff9f40", "#8bc34a", "#e91e63", "#00bcd4"
];

export default function SubCategoryPieChart({ data }) {
    if (!data || data.length === 0) return <div>No subcategory data</div>;

    const total = data.reduce((sum, item) => sum + item.Amount, 0);
    const showSliceLabels = data.length <= 10;

    return (
        <div className="card shadow-sm mb-4">
            <div className="card-body">
                <h5 className="card-title">Sub Categories</h5>

                <div style={{ width: "100%", height: 450 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="Amount"
                                nameKey="SubCategoryName"
                                cx="50%"
                                cy="50%"
                                innerRadius={120}
                                outerRadius={160}
                                labelLine={showSliceLabels}
                                label={
                                    showSliceLabels
                                        ? ({ percent }) => `${(percent * 100).toFixed(0)}%`
                                        : false
                                }
                            >
                                {data.map((entry, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>

                            <Tooltip cursor={false} />

                            <Legend
                                layout="vertical"
                                align="right"
                                verticalAlign="middle"
                                iconSize={10}
                                wrapperStyle={{ fontSize: 12, maxHeight: 450, overflowY: "auto" }}
                                formatter={(value, entry, index) => {
                                    if (!showSliceLabels) {
                                        const percent = ((data[index].Amount / total) * 100).toFixed(0);
                                        return `${value} (${percent}%)`;
                                    }
                                    return value;
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
