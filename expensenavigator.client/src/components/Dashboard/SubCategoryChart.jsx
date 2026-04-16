import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = [
    "#6c63ff", "#ff6384", "#36a2eb", "#ffce56", "#4bc0c0",
    "#9966ff", "#ff9f40", "#8bc34a", "#e91e63", "#00bcd4"
];

export default function SubCategoryPieChart({ data }) {
    if (!data || data.length === 0) return <div>No subcategory data</div>;

    const showSliceLabels = data.length <= 10;
    return (
        <div className="card-body">
            <div className="pie-chart-wrapper">
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
                            layout={window.innerWidth < 768 ? "horizontal" : "vertical"}
                            align={window.innerWidth < 768 ? "center" : "right"}
                            verticalAlign={window.innerWidth < 768 ? "bottom" : "middle"}
                            iconType="none"
                            wrapperStyle={{
                                fontSize: 13,
                                maxHeight: 450,
                                overflowY: "auto",
                                paddingRight: 8,
                            }}
                            content={() => {
                                const sorted = [...data].sort((a, b) => b.Amount - a.Amount);

                                const totalAmount = sorted.reduce((sum, i) => sum + i.Amount, 0);

                                return (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                        {sorted.map((item, index) => {
                                            const percent = totalAmount
                                                ? ((item.Amount / totalAmount) * 100).toFixed(1)
                                                : 0;

                                            const color = COLORS[index % COLORS.length];

                                            return (
                                                <div
                                                    key={item.SubCategoryName}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 4,              
                                                        whiteSpace: "nowrap",
                                                        lineHeight: 1.1,    
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            width: 8,
                                                            height: 8,
                                                            borderRadius: "50%",
                                                            backgroundColor: color,
                                                            flexShrink: 0,
                                                        }}
                                                    />
                                                    <span style={{ color: "#000" }}>
                                                        {item.SubCategoryName}
                                                    </span>

                                                    <strong style={{ fontWeight: 700 }}>
                                                        - {item.Amount}
                                                    </strong>

                                                    <span style={{ color: "#888" }}>
                                                        ({percent}%)
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

