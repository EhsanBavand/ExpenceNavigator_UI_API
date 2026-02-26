////import React, { useEffect, useState, useMemo } from "react";
////import { jwtDecode } from "jwt-decode";
////import CategoryChart from "../components/Dashboard/CategoryChart";
////import SubCategoryPieChart from "../components/Dashboard/SubCategoryChart";
////import {
////    getDashboardSummary,
////    getUserCategoryBudgets,
////    getMonthlySummary,
////    SubCategoriesByCategory,
////} from "../services/api";
////import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

////const styles = {
////    page: { fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial", backgroundColor: "#f6f8fb", minHeight: "100vh", color: "#0f172a" },
////    container: { maxWidth: 1200, margin: "0 auto", padding: 24 },
////    cards: { display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 16, marginBottom: 16 },
////    card: { borderRadius: 16, padding: 16, color: "#fff", boxShadow: "0 1px 1px rgba(0,0,0,0.02), 0 6px 12px rgba(16,24,40,0.06)" },
////    subtitle: { fontSize: 12, opacity: 0.95 },
////    amount: { fontSize: 28, fontWeight: 700, marginTop: 4 },
////};

////const gradient = (from, to) => ({ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` });
////const currency = (n) => (!n ? "$0" : n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 }));

////export default function DashboardPage() {
////    const [userId, setUserId] = useState(null);
////    const [summary, setSummary] = useState(null);
////    const [categoryData, setCategoryData] = useState([]);
////    const [monthlyBarsData, setMonthlyBarsData] = useState([]);
////    const [loading, setLoading] = useState(false);
////    const [viewType, setViewType] = useState("monthly");
////    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
////    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

////    const [subCategoryData, setSubCategoryData] = useState([]);
////    const [selectedCategoryId, setSelectedCategoryId] = useState(null);

////    const [appliedFilters, setAppliedFilters] = useState({
////        viewType: "monthly",
////        month: new Date().getMonth() + 1,
////        year: new Date().getFullYear(),
////    });

////    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
////    const yearOptions = [2028, 2027, 2026, 2025, 2024, 2023];

////    useEffect(() => {
////        const token = localStorage.getItem("token");
////        if (!token) return;
////        try {
////            const decoded = jwtDecode(token);
////            const id = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || decoded.sub;
////            setUserId(id);
////        } catch { console.error("Invalid token"); }
////    }, []);

////    useEffect(() => {
////        const fetchData = async () => {
////            if (!userId) return;
////            setLoading(true);
////            const monthToSend = appliedFilters.viewType === "yearly" ? 0 : appliedFilters.month;
////            const yearToSend = appliedFilters.year;

////            try {
////                const summaryData = await getDashboardSummary(userId, monthToSend, yearToSend);
////                setSummary(summaryData || null);

////                const categories = await getUserCategoryBudgets(userId, monthToSend, yearToSend);
////                setCategoryData((categories || []).map((x) => ({
////                    CategoryId: x.categoryId,
////                    CategoryName: x.categoryName || "Unknown",
////                    Budget: Number(x.budget || 0),
////                    TotalExpense: Number(x.totalExpense || 0),
////                })));

////                const rawMonthly = await getMonthlySummary(userId, yearToSend);
////                const byMonth = new Map((rawMonthly || []).map((r) => [
////                    Number(r.month),
////                    { month: Number(r.month), income: Number(r.income || 0), expense: Number(r.expense || 0), budget: Number(r.budget || 0) }
////                ]));
////                setMonthlyBarsData(Array.from({ length: 12 }, (_, i) => byMonth.get(i + 1) || { month: i + 1, income: 0, expense: 0, budget: 0 }));
////            } catch (err) {
////                console.error("Error loading dashboard data", err);
////                setSummary(null); setCategoryData([]); setMonthlyBarsData([]);
////            } finally { setLoading(false); }
////        };
////        fetchData();
////    }, [userId, appliedFilters]);

////    const handleCategoryClick = async (catId) => {
////        if (!userId) return;
////        const monthToSend = viewType === "yearly" ? 0 : selectedMonth;

////        try {
////            const data = await SubCategoriesByCategory(catId, userId, monthToSend, selectedYear);
////            const parsed = (Array.isArray(data) ? data : []).map((x) => ({
////                SubCategoryName: x.name || "Unknown",
////                Amount: Number(x.amount) || 0,
////            }));
////            setSubCategoryData(parsed);
////            setSelectedCategoryId(catId);
////        } catch (err) {
////            console.error("Error loading subcategories", err);
////            setSubCategoryData([]);
////            setSelectedCategoryId(null);
////        }
////    };

////    const stats = useMemo(() => {
////        if (!summary) return { income: 0, budget: 0, expenses: 0, incomeLeft: 0, budgetLeft: 0, monthlySeries: [] };
////        return {
////            income: Number(summary.totalIncome || 0),
////            budget: Number(summary.totalBudget || 0),
////            expenses: Number(summary.totalExpenses || 0),
////            incomeLeft: Number(summary.remainingIncome || 0),
////            budgetLeft: Number(summary.remainingBudget || 0),
////            monthlySeries: monthlyBarsData.map((d) => ({ name: months[d.month - 1], income: d.income, expense: d.expense, budget: d.budget })),
////        };
////    }, [summary, monthlyBarsData]);

////    if (loading) return <div style={{ padding: 24 }}>Loading dashboard...</div>;

////    return (
////        <div style={styles.page}>
////            <div style={styles.container}>

////                {/* Filters */}
////                <div className="panel mb-3">
////                    <div className="panel-body d-flex flex-wrap gap-3 align-items-end">
////                        <div className="btn-group">
////                            {["monthly", "yearly"].map(p => (
////                                <button key={p} type="button" className={`btn ${viewType === p ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setViewType(p)}>
////                                    {p.charAt(0).toUpperCase() + p.slice(1)}
////                                </button>
////                            ))}
////                        </div>
////                        {viewType === "monthly" && (
////                            <div>
////                                <label className="form-label mb-1">Month</label>
////                                <select className="control-pill form-select" value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
////                                    {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
////                                </select>
////                            </div>
////                        )}
////                        <div>
////                            <label className="form-label mb-1">Year</label>
////                            <select className="control-pill form-select" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
////                                {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
////                            </select>
////                        </div>

////                        <button type="button" className="btn-pill btn-green btn btn-primary" onClick={() => setAppliedFilters({ viewType, month: selectedMonth, year: selectedYear })}>
////                            <i className="bi bi-search"></i> <span className="ms-1">Search</span>
////                        </button>
////                    </div>
////                </div>

////                {/* KPI Cards */}
////                <div style={styles.cards}>
////                    <div style={{ ...styles.card, ...gradient("#34d399", "#10b981") }}><div style={styles.subtitle}>Income</div><div style={styles.amount}>{currency(stats.income)}</div></div>
////                    <div style={{ ...styles.card, ...gradient("#a78bfa", "#6366f1") }}><div style={styles.subtitle}>Budget</div><div style={styles.amount}>{currency(stats.budget)}</div></div>
////                    <div style={{ ...styles.card, ...gradient("#f87171", "#fb7185") }}><div style={styles.subtitle}>Expenses</div><div style={styles.amount}>{currency(stats.expenses)}</div></div>
////                    <div style={{ ...styles.card, ...gradient("#60a5fa", "#3b82f6") }}><div style={styles.subtitle}>Income Left</div><div style={styles.amount}>{currency(stats.incomeLeft)}</div></div>
////                    <div style={{ ...styles.card, ...gradient("#7dd3fc", "#6366f1") }}><div style={styles.subtitle}>Budget Left</div><div style={styles.amount}>{currency(stats.budgetLeft)}</div></div>
////                </div>

////                {/* Category Chart */}
////                <CategoryChart data={categoryData} onCategoryClick={handleCategoryClick} selectedCategoryId={selectedCategoryId} />

////                {/* Subcategory Pie Chart */}
////                {subCategoryData.length > 0 && <SubCategoryPieChart data={subCategoryData} />}

////                {/* Monthly Bar Chart */}
////                <div style={{ width: "100%", marginTop: 20 }}>
////                    <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 1px 1px rgba(0,0,0,0.02),0 6px 12px rgba(16,24,40,0.06)" }}>
////                        <h5 style={{ marginBottom: 16 }}>Income vs Expenses vs Budget (All Months)</h5>
////                        <div style={{ width: "100%", height: 350 }}>
////                            <ResponsiveContainer width="100%" height="100%">
////                                <BarChart data={stats.monthlySeries}>
////                                    <XAxis dataKey="name" />
////                                    <YAxis tickLine={false} width={48} />
////                                    <Tooltip cursor={false} />
////                                    <Legend />
////                                    <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} />
////                                    <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} />
////                                    <Bar dataKey="budget" fill="#6366f1" radius={[6, 6, 0, 0]} />
////                                </BarChart>
////                            </ResponsiveContainer>
////                        </div>
////                    </div>
////                </div>

////            </div>
////        </div>
////    );
////}

import React, { useEffect, useState, useMemo } from "react";
import { jwtDecode } from "jwt-decode";
import CategoryChart from "../components/Dashboard/CategoryChart";
import SubCategoryPieChart from "../components/Dashboard/SubCategoryChart";
import {
    getDashboardSummary,
    getUserCategoryBudgets,
    getMonthlySummary,
    SubCategoriesByCategory,
} from "../services/api";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import "../CSS/dashboard.css";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

const currency = (n) =>
    !n
        ? "$0"
        : n.toLocaleString(undefined, {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 2,
        });

export default function DashboardPage() {
    const [userId, setUserId] = useState(null);
    const [summary, setSummary] = useState(null);
    const [categoryData, setCategoryData] = useState([]);
    const [monthlyBarsData, setMonthlyBarsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewType, setViewType] = useState("monthly");
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const [subCategoryData, setSubCategoryData] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);

    const [appliedFilters, setAppliedFilters] = useState({
        viewType: "monthly",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ];
    const yearOptions = [2028, 2027, 2026, 2025, 2024, 2023];

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const decoded = jwtDecode(token);
            const id =
                decoded[
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
                ] || decoded.sub;
            setUserId(id);
        } catch {
            console.error("Invalid token");
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;
            setLoading(true);
            const monthToSend = appliedFilters.viewType === "yearly" ? 0 : appliedFilters.month;
            const yearToSend = appliedFilters.year;

            try {
                const summaryData = await getDashboardSummary(userId, monthToSend, yearToSend);
                setSummary(summaryData || null);

                const categories = await getUserCategoryBudgets(userId, monthToSend, yearToSend);
                setCategoryData(
                    (categories || []).map((x) => ({
                        CategoryId: x.categoryId,
                        CategoryName: x.categoryName || "Unknown",
                        Budget: Number(x.budget || 0),
                        TotalExpense: Number(x.totalExpense || 0),
                    }))
                );

                const rawMonthly = await getMonthlySummary(userId, yearToSend);
                const byMonth = new Map(
                    (rawMonthly || []).map((r) => [
                        Number(r.month),
                        {
                            month: Number(r.month),
                            income: Number(r.income || 0),
                            expense: Number(r.expense || 0),
                            budget: Number(r.budget || 0),
                        },
                    ])
                );
                setMonthlyBarsData(
                    Array.from({ length: 12 }, (_, i) =>
                        byMonth.get(i + 1) || { month: i + 1, income: 0, expense: 0, budget: 0 }
                    )
                );
            } catch (err) {
                console.error("Error loading dashboard data", err);
                setSummary(null);
                setCategoryData([]);
                setMonthlyBarsData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userId, appliedFilters]);

    const handleCategoryClick = async (catId) => {
        if (!userId) return;
        const monthToSend = viewType === "yearly" ? 0 : selectedMonth;

        try {
            const data = await SubCategoriesByCategory(catId, userId, monthToSend, selectedYear);
            const parsed = (Array.isArray(data) ? data : []).map((x) => ({
                SubCategoryName: x.name || "Unknown",
                Amount: Number(x.amount) || 0,
            }));
            setSubCategoryData(parsed);
            setSelectedCategoryId(catId);
        } catch (err) {
            console.error("Error loading subcategories", err);
            setSubCategoryData([]);
            setSelectedCategoryId(null);
        }
    };

    const stats = useMemo(() => {
        if (!summary)
            return {
                income: 0,
                budget: 0,
                expenses: 0,
                incomeLeft: 0,
                budgetLeft: 0,
                monthlySeries: [],
            };
        return {
            income: Number(summary.totalIncome || 0),
            budget: Number(summary.totalBudget || 0),
            expenses: Number(summary.totalExpenses || 0),
            incomeLeft: Number(summary.remainingIncome || 0),
            budgetLeft: Number(summary.remainingBudget || 0),
            monthlySeries: monthlyBarsData.map((d) => ({
                name: months[d.month - 1],
                income: d.income,
                expense: d.expense,
                budget: d.budget,
            })),
        };
    }, [summary, monthlyBarsData]);

    if (loading) return <div style={{ padding: 24 }}>Loading dashboard...</div>;

    return (
        <div className="dashboard-page">
            <div className="dashboard-container">                          

                {/* Filters */}
                {/*<div className="dashboard-panel panel mb-3">*/}

                <div className="panel mb-3">
                    <div className="panel-body filter-responsive">
                        <div className="btn-group filter-item" role="group" aria-label="View type">
                            {["monthly", "yearly"].map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    className={`btn ${viewType === p ? "btn-primary" : "btn-outline-primary"}`}
                                    onClick={() => setViewType(p)}
                                >
                                    {p.charAt(0).toUpperCase() + p.slice(1)}
                                </button>
                            ))}
                        </div>

                        {viewType === "monthly" && (
                            <div className="filter-item">
                                <label className="form-label mb-1">Month</label>
                                <select
                                    className="control-pill form-select"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                >
                                    {months.map((m, i) => (
                                        <option key={i} value={i + 1}>{m}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="filter-item">
                            <label className="form-label mb-1">Year</label>
                            <select
                                className="control-pill form-select"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                            >
                                {yearOptions.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="button"
                            className="btn-pill btn-green btn btn-primary filter-item"
                            onClick={() => setAppliedFilters({ viewType, month: selectedMonth, year: selectedYear })}
                        >
                            <i className="bi bi-search" />
                            <span className="ms-1">Search</span>
                        </button>
                    </div>
                </div>


                {/* KPI Cards */}
                <div className="dashboard-cards">
                    <div className="dashboard-card grad-income">
                        <div className="subtitle">Income</div>
                        <div className="amount">{currency(stats.income)}</div>
                    </div>
                    <div className="dashboard-card grad-budget">
                        <div className="subtitle">Budget</div>
                        <div className="amount">{currency(stats.budget)}</div>
                    </div>
                    <div className="dashboard-card grad-expenses">
                        <div className="subtitle">Expenses</div>
                        <div className="amount">{currency(stats.expenses)}</div>
                    </div>
                    <div className="dashboard-card grad-incomeLeft">
                        <div className="subtitle">Income Left</div>
                        <div className="amount">{currency(stats.incomeLeft)}</div>
                    </div>
                    <div className="dashboard-card grad-budgetLeft">
                        <div className="subtitle">Budget Left</div>
                        <div className="amount">{currency(stats.budgetLeft)}</div>
                    </div>
                </div>

                {/* Category Chart */}
                <CategoryChart
                    data={categoryData}
                    onCategoryClick={handleCategoryClick}
                    selectedCategoryId={selectedCategoryId}
                />

                {/* Subcategory Pie Chart */}
                {/*{subCategoryData.length > 0 && (*/}
                {/*    <SubCategoryPieChart data={subCategoryData} />*/}
                {/*)}*/}
                {subCategoryData.length > 0 && (
                    <div className="card-surface">
                        <h5 className="chart-title">Sub Categories</h5>
                        <div className="chart-scroll-y">
                            <SubCategoryPieChart data={subCategoryData} />
                        </div>
                    </div>
                )}


                {/* Monthly Bar Chart */}
                {/*<div style={{ width: "100%", marginTop: 20 }}>*/}
                {/*    <div className="card-surface">*/}
                {/*        <h5 className="chart-title">Income vs Expenses vs Budget (All Months)</h5>*/}
                {/*        <div style={{ width: "100%", height: 350 }}>*/}
                {/*            <ResponsiveContainer width="100%" height="100%">*/}
                {/*                <BarChart data={stats.monthlySeries}>*/}
                {/*                    <XAxis dataKey="name" />*/}
                {/*                    <YAxis tickLine={false} width={48} />*/}
                {/*                    <Tooltip cursor={false} />*/}
                {/*                    <Legend wrapperStyle={{ paddingTop: 8 }} />*/}
                {/*                    <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} />*/}
                {/*                    <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} />*/}
                {/*                    <Bar dataKey="budget" fill="#6366f1" radius={[6, 6, 0, 0]} />*/}
                {/*                </BarChart>*/}
                {/*            </ResponsiveContainer>*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*</div>*/}
                <div className="card-surface">
                    <h5 className="chart-title">Income vs Expenses vs Budget (All Months)</h5>
                    <div className="chart-scroll-y">
                        <div style={{ width: "100%", height: 350 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.monthlySeries}>
                                    <XAxis dataKey="name" />
                                    <YAxis tickLine={false} width={48} />
                                    <Tooltip cursor={false} />
                                    <Legend wrapperStyle={{ paddingTop: 8 }} />
                                    <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="budget" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}