import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const CustomBar = ({ x, y, width, height, payload, onClick }) => {
    const budget = Number(payload.Budget || 0);
    const expense = Number(payload.TotalExpense || 0);
    const maxVal = Number(payload.MaxValue || 0);

    let fillColor = "#4CAF50";
    if (budget === 0 && expense > 0) fillColor = "#F44336";
    else {
        const ratio = budget > 0 ? expense / budget : 0;
        if (ratio >= 1) fillColor = "#F44336";
        else if (ratio >= 0.8) fillColor = "#FFC107";
    }

    const expenseWidth = maxVal > 0 ? (expense / maxVal) * width : 0;

    return (
        //<g
        //    onClick={() => onClick?.(payload.CategoryId)}
        //    style={{ cursor: "pointer" }}
        //>
        <g
            onClick={() => onClick?.(payload.CategoryId)}
            style={{
                cursor: "pointer",
                outline: "none"
            }}
            tabIndex={-1}   // 🔥 prevents focus
        >
            <rect x={x} y={y} width={width} height={height} outline={"none"} fill="#BDBDBD" rx={4} />
            {expenseWidth > 0 && (
                <rect
                    x={x}
                    y={y}
                    width={expenseWidth}
                    height={height}
                    fill={fillColor}
                    rx={4}
                />
            )}
        </g>
    );
};

const getColor = (budget, expense) => {
    if (budget === 0 && expense > 0) return "#F44336"; // red
    const ratio = budget > 0 ? expense / budget : 0;
    if (ratio >= 1) return "#F44336"; // red
    if (ratio >= 0.8) return "#FFC107"; // yellow
    return "#4CAF50"; // green
};

export default function CategoryChart({ data, onCategoryClick }) {
    const safe = Array.isArray(data) ? data : [];
    const hasData = safe.length > 0;

    // Add MaxValue for width calculation (even if empty)
    const chartData = safe.map((item) => ({
        ...item,
        Budget: Number(item.Budget) || 0,
        TotalExpense: Number(item.TotalExpense) || 0,
        MaxValue: Math.max(
            Number(item.Budget) || 0,
            Number(item.TotalExpense) || 0,
        ),
    }));

    const maxValue = chartData.length
        ? Math.max(...chartData.map((d) => d.MaxValue))
        : 0;

    return (
        <div className="card shadow-sm mt-4 mb-4 w-100  ">
            <div className="card-body ">
                <h5 className="card-title mb-4">Category Expenses</h5>

                <div style={{ width: "100%", height: 550 }}>
                    {!hasData ? (
                        <div
                            className="skeleton-box skeleton-chart-lg"
                            style={{ height: 550 }}
                        />
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={chartData}
                                margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                            >
                                <XAxis type="number" domain={[0, maxValue]} />
                                <YAxis
                                    type="category"
                                    dataKey="CategoryName"
                                    width={160}
                                    interval={0}
                                    tick={{ fontSize: 14 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={false}
                                    content={({ active, payload }) => {
                                        if (!active || !payload?.length) return null;
                                        const item = payload[0].payload;
                                        const color = getColor(item.Budget, item.TotalExpense);

                                        return (
                                            <div
                                                style={{
                                                    background: "#fff",
                                                    border: "1px solid #ccc",
                                                    padding: 8,
                                                    borderRadius: 6,
                                                    fontSize: 13,
                                                }}
                                            >
                                                <div style={{ fontWeight: 600 }}>
                                                    {item.CategoryName}
                                                </div>
                                                <div style={{ color: "#7f7f7f" }}>
                                                    Budget: ${Number(item.Budget).toFixed(2)}
                                                </div>
                                                <div style={{ color }}>
                                                    Expense: ${Number(item.TotalExpense).toFixed(2)}
                                                </div>
                                            </div>
                                        );
                                    }}
                                />
                                <Bar
                                    dataKey="MaxValue"
                                    barSize={24}
                                    shape={(props) => <CustomBar {...props} onClick={onCategoryClick} />}
                                    isAnimationActive={false}
                                    activeShape={null}  // 🔹 this disables the black border on click
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}

