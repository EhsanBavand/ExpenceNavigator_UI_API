//import React from "react";
//import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

//const COLORS = [
//    "#6c63ff", "#ff6384", "#36a2eb", "#ffce56", "#4bc0c0",
//    "#9966ff", "#ff9f40", "#8bc34a", "#e91e63", "#00bcd4"
//];

//export default function SubCategoryPieChart({ data }) {
//    if (!data || data.length === 0) return <div>No subcategory data</div>;

//    const showSliceLabels = data.length <= 10;
//    return (
//        <div className="card-body">
//            <div className="pie-chart-wrapper">
//                <ResponsiveContainer width="100%" height="100%">
//                    <PieChart>
//                        <Pie
//                            data={data}
//                            dataKey="Amount"
//                            nameKey="SubCategoryName"
//                            cx="50%"
//                            cy="50%"
//                            innerRadius={120}
//                            outerRadius={160}
//                            labelLine={showSliceLabels}
//                            label={
//                                showSliceLabels
//                                    ? ({ percent }) => `${(percent * 100).toFixed(0)}%`
//                                    : false
//                            }
//                        >
//                            {data.map((entry, index) => (
//                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
//                            ))}
//                        </Pie>

//                        <Tooltip cursor={false} />
//                        <Legend
//                            layout={window.innerWidth < 768 ? "horizontal" : "vertical"}
//                            align={window.innerWidth < 768 ? "center" : "right"}
//                            verticalAlign={window.innerWidth < 768 ? "bottom" : "middle"}
//                            iconType="none"
//                            wrapperStyle={{
//                                fontSize: 13,
//                                maxHeight: 450,
//                                overflowY: "auto",
//                                paddingRight: 8,
//                            }}
//                            content={() => {
//                                const sorted = [...data].sort((a, b) => b.Amount - a.Amount);

//                                const totalAmount = sorted.reduce((sum, i) => sum + i.Amount, 0);

//                                return (
//                                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
//                                        {sorted.map((item, index) => {
//                                            const percent = totalAmount
//                                                ? ((item.Amount / totalAmount) * 100).toFixed(1)
//                                                : 0;

//                                            const color = COLORS[index % COLORS.length];

//                                            return (
//                                                <div
//                                                    key={item.SubCategoryName}
//                                                    style={{
//                                                        display: "flex",
//                                                        alignItems: "center",
//                                                        gap: 4,
//                                                        whiteSpace: "nowrap",
//                                                        lineHeight: 1.1,
//                                                    }}
//                                                >
//                                                    <span
//                                                        style={{
//                                                            width: 8,
//                                                            height: 8,
//                                                            borderRadius: "50%",
//                                                            backgroundColor: color,
//                                                            flexShrink: 0,
//                                                        }}
//                                                    />
//                                                    <span style={{ color: "#000" }}>
//                                                        {item.SubCategoryName}
//                                                    </span>

//                                                    <strong style={{ fontWeight: 700 }}>
//                                                        - {item.Amount}
//                                                    </strong>

//                                                    <span style={{ color: "#888" }}>
//                                                        ({percent}%)
//                                                    </span>
//                                                </div>
//                                            );
//                                        })}
//                                    </div>
//                                );
//                            }}
//                        />
//                    </PieChart>
//                </ResponsiveContainer>
//            </div>
//        </div>
//    );
//}
import React, { useEffect, useRef, useState } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

/* ================= COLORS ================= */
const COLORS = [
    "#6c63ff", "#ff6384", "#36a2eb", "#ffce56", "#4bc0c0",
    "#9966ff", "#ff9f40", "#8bc34a", "#e91e63", "#00bcd4"
];

/* ================= SIZE HOOK ================= */
function useContainerSize(ref) {
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (!ref.current) return;

        const observer = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            setSize({ width, height });
        });

        observer.observe(ref.current);

        return () => observer.disconnect();
    }, [ref]);

    return size;
}

/* ================= COMPONENT ================= */
export default function SubCategoryPieChart({ data }) {

    const containerRef = useRef(null);
    const size = useContainerSize(containerRef);

    if (!data || data.length === 0) {
        return <div>No subcategory data</div>;
    }

    /* ================= RESPONSIVE RULES ================= */
    const isSmall = size.width < 520;

    const outerRadius = isSmall ? 95 : 160;
    const innerRadius = isSmall ? 60 : 120;

    const showSliceLabels = data.length <= 10;

    const sorted = [...data].sort((a, b) => b.Amount - a.Amount);
    const totalAmount = sorted.reduce((sum, i) => sum + i.Amount, 0);

    const legendPosition = isSmall ? "bottom" : "right";
    const legendLayout = isSmall ? "horizontal" : "vertical";

    return (
        <div className="card-body">

            {/* ===== OUTER WRAPPER ===== */}
            <div
                ref={containerRef}
                style={{
                    width: "100%",
                    height: isSmall ? 360 : 520,
                    display: "flex",
                    flexDirection: isSmall ? "column" : "row",
                    gap: 10
                }}
            >

                {/* ================= CHART ================= */}
                <div style={{ flex: 1, minHeight: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>

                            <Pie
                                data={data}
                                dataKey="Amount"
                                nameKey="SubCategoryName"
                                cx="50%"
                                cy="50%"
                                innerRadius={innerRadius}
                                outerRadius={outerRadius}
                                labelLine={showSliceLabels}
                                label={
                                    showSliceLabels
                                        ? ({ percent }) =>
                                            `${(percent * 100).toFixed(0)}%`
                                        : false
                                }
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={index}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>

                            <Tooltip cursor={false} />

                            {/* ================= LEGEND ================= */}
                            <Legend
                                layout="vertical"
                                align={isSmall ? "center" : "right"}
                                verticalAlign={isSmall ? "bottom" : "middle"}
                                iconType="circle"
                                wrapperStyle={{
                                    fontSize: isSmall ? 11 : 13,

                                    /* 🔥 IMPORTANT: hard boundary */
                                    width: isSmall ? "100%" : 260,

                                    maxHeight: isSmall ? 150 : 420,
                                    overflowY: "auto",
                                    overflowX: "hidden",

                                    paddingTop: isSmall ? 10 : 0,
                                    boxSizing: "border-box"
                                }}
                                content={() => (
                                    <div
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 6,
                                            paddingRight: 6,
                                            boxSizing: "border-box"
                                        }}
                                    >
                                        {sorted.map((item, index) => {

                                            const percent = totalAmount
                                                ? ((item.Amount / totalAmount) * 100).toFixed(1)
                                                : 0;

                                            const color = COLORS[index % COLORS.length];

                                            return (
                                                <div
                                                    key={item.SubCategoryName}
                                                    style={{
                                                        display: "grid",
                                                        gridTemplateColumns: "10px 1fr auto auto",
                                                        alignItems: "center",
                                                        columnGap: 8,
                                                        width: "100%",
                                                        minWidth: 0
                                                    }}
                                                >
                                                    {/* DOT */}
                                                    <span
                                                        style={{
                                                            width: 8,
                                                            height: 8,
                                                            borderRadius: "50%",
                                                            backgroundColor: color,
                                                            flexShrink: 0
                                                        }}
                                                    />

                                                    {/* NAME */}
                                                    <span
                                                        style={{
                                                            color: "#000",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            whiteSpace: "nowrap",
                                                            minWidth: 0
                                                        }}
                                                    >
                                                        {item.SubCategoryName}
                                                    </span>

                                                    {/* AMOUNT */}
                                                    <strong style={{ whiteSpace: "nowrap" }}>
                                                        - {item.Amount}
                                                    </strong>

                                                    {/* PERCENT */}
                                                    <span style={{ color: "#888", whiteSpace: "nowrap" }}>
                                                        ({percent}%)
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

            </div>
        </div>
    );
}

