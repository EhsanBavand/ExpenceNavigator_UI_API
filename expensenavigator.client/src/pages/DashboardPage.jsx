import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import "../CSS/Global.css";
import PieChartSection from "../components/Dashboard/PieChartSection";
import CategoryChart from "../components/Dashboard/CategoryChart";
import SubCategoryChart from "../components/Dashboard/SubCategoryChart";
import MonthlyGroupedBarChart from "../components/Dashboard/MonthlyGroupedChart";
import {
  getDashboardSummary,
  getUserCategoryBudgets,
  SubCategoriesByCategory,
  getMonthlySummary,
} from "../services/api";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingCategory, setLoadingCategory] = useState(true);
  const [userId, setUserId] = useState(null);
  const [subCategoryData, setSubCategoryData] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [viewType, setViewType] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyBarsData, setMonthlyBarsData] = useState([]);
  const [loadingMonthlyBars, setLoadingMonthlyBars] = useState(true);
  const [monthlyBarsError, setMonthlyBarsError] = useState("");

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

  const loadDashboardData = async () => {
    if (!userId) return;
    const monthToSend = viewType === "yearly" ? 0 : selectedMonth;
    setLoadingSummary(true);
    try {
      const summaryData = await getDashboardSummary(
        userId,
        monthToSend,
        selectedYear,
      );
      setSummary(summaryData || null);
    } catch {
      console.error("Error loading dashboard summary");
      setSummary(null);
    } finally {
      setLoadingSummary(false);
    }
    setLoadingCategory(true);
    try {
      const data = await getUserCategoryBudgets(
        userId,
        monthToSend,
        selectedYear,
      );
      const parsed = (Array.isArray(data) ? data : []).map((x) => ({
        CategoryId: x.categoryId,
        CategoryName: x.categoryName || "Unknown",
        Budget: Number(x.budget) || 0,
        TotalExpense: Number(x.totalExpense) || 0,
      }));
      setCategoryData(parsed);
    } catch (err) {
      console.error("Error loading category data", err);
      setCategoryData([]);
    } finally {
      setLoadingCategory(false);
    }

    setLoadingMonthlyBars(true);
    setMonthlyBarsError("");
    try {
      const raw = await getMonthlySummary(userId, selectedYear);
      const byMonth = new Map(
        (Array.isArray(raw) ? raw : []).map((r) => [
          Number(r.month),
          {
            year: Number(r.year) || selectedYear,
            month: Number(r.month),
            expense: Number(r.expense) || 0,
            budget: Number(r.budget) || 0,
            income: Number(r.income) || 0,
          },
        ]),
      );

      const complete = Array.from({ length: 12 }, (_, i) => {
        const m = i + 1;
        return (
          byMonth.get(m) || {
            year: selectedYear,
            month: m,
            expense: 0,
            budget: 0,
            income: 0,
          }
        );
      });
      setMonthlyBarsData(complete);
    } catch (err) {
      console.error("Error loading monthly bars", err);
      setMonthlyBarsError("Failed to load monthly bars data.");
      setMonthlyBarsData([]);
    } finally {
      setLoadingMonthlyBars(false);
    }
  };

  const handleCategoryClick = async (catId) => {
    if (!userId) return;
    const monthToSend = viewType === "yearly" ? 0 : selectedMonth;

    try {
      const data = await SubCategoriesByCategory(
        catId,
        userId,
        monthToSend,
        selectedYear,
      );
      const parsed = (Array.isArray(data) ? data : []).map((x) => ({
        SubCategoryName: x.name || "Unknown",
        Amount: Number(x.amount) || 0,
      }));
      setSubCategoryData(parsed);
      setSelectedCategoryId(catId);
    } catch (err) {
      console.error("Error loading subcategories", err);
      setSubCategoryData([]);
    }
  };

  useEffect(() => {
    if (userId) loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const yearOptions = [2028, 2027, 2026, 2025, 2024, 2023];

  return (
    <div className="container mt-4">
      <div className="card shadow-sm mb-4">
        <div className="card-body d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-start-0 gap-3">
            <div className="btn-group">
              <button
                className={`btn ${viewType === "monthly" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setViewType("monthly")}
              >
                Monthly
              </button>
              <button
                className={`btn ${viewType === "yearly" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setViewType("yearly")}
              >
                Yearly
              </button>
            </div>
            {viewType === "monthly" && (
              <select
                className="form-select"
                style={{ width: 140 }}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {monthNames.map((m, i) => (
                  <option key={i} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            )}

            {/* Year Selector */}
            <select
              className="form-select"
              style={{ width: 120 }}
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            {/* Search */}
            <button className="btn btn-primary" onClick={loadDashboardData}>
              Search
            </button>
          </div>
          <h4 className="mb-0 align-items-end">Financial Overview</h4>
        </div>
      </div>
      {loadingSummary ? (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">Income vs Expenses</h5>
            <div className="skeleton-box skeleton-chart-lg" />
          </div>
        </div>
      ) : (
        <PieChartSection summary={summary} />
      )}
      {loadingCategory ? (
        <div className="card shadow-sm mt-4 mb-4 w-100">
          <div className="card-body">
            <h5 className="card-title mb-4">Category Expenses</h5>
            <div
              className="skeleton-box skeleton-chart-lg"
              style={{ height: 550 }}
            />
          </div>
        </div>
      ) : (
        <CategoryChart
          data={categoryData}
          onCategoryClick={handleCategoryClick}
        />
      )}
      <SubCategoryChart data={subCategoryData} />
      <div className="card shadow-sm mt-4">
        <div className="card-body">
          <h5 className="mb-3">Monthly Expense vs Budget vs Income</h5>
          {loadingMonthlyBars ? (
            <div
              className="skeleton-box skeleton-chart-lg"
              style={{ height: 360 }}
            />
          ) : monthlyBarsError ? (
            // If you prefer *no* visible error, comment the next line and show a skeleton instead.
            <div
              className="skeleton-box skeleton-chart-lg"
              style={{ height: 360 }}
            />
          ) : (
            <MonthlyGroupedBarChart
              data={monthlyBarsData}
              labelFontSize={16}
              yAxisStroke="#374151"
            />
          )}
        </div>
      </div>
    </div>
  );
}

// // New Design
// // pages/DashboardPage.jsx
// import React, { useEffect, useState } from "react";
// import { jwtDecode } from "jwt-decode";
// import "../CSS/Global.css";
// import PieChartSection from "../components/Dashboard/PieChartSection";
// import CategoryChart from "../components/Dashboard/CategoryChart";
// import SubCategoryChart from "../components/Dashboard/SubCategoryChart";
// import MonthlyGroupedBarChart from "../components/Dashboard/MonthlyGroupedChart";
// import {
//   getDashboardSummary,
//   getUserCategoryBudgets,
//   SubCategoriesByCategory,
//   getMonthlySummary,
// } from "../services/api";

// export default function DashboardPage() {
//   const [summary, setSummary] = useState(null);
//   const [categoryData, setCategoryData] = useState([]);
//   const [loadingSummary, setLoadingSummary] = useState(true);
//   const [loadingCategory, setLoadingCategory] = useState(true);
//   const [userId, setUserId] = useState(null);
//   const [subCategoryData, setSubCategoryData] = useState([]);
//   const [selectedCategoryId, setSelectedCategoryId] = useState(null);
//   const [viewType, setViewType] = useState("monthly");
//   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
//   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
//   const [monthlyBarsData, setMonthlyBarsData] = useState([]);
//   const [loadingMonthlyBars, setLoadingMonthlyBars] = useState(true);
//   const [monthlyBarsError, setMonthlyBarsError] = useState("");

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) return;
//     try {
//       const decoded = jwtDecode(token);
//       const id =
//         decoded[
//           "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
//         ] || decoded.sub;
//       setUserId(id);
//     } catch {
//       console.error("Invalid token");
//     }
//   }, []);

//   const loadDashboardData = async () => {
//     if (!userId) return;
//     const monthToSend = viewType === "yearly" ? 0 : selectedMonth;

//     // Summary
//     setLoadingSummary(true);
//     try {
//       const summaryData = await getDashboardSummary(
//         userId,
//         monthToSend,
//         selectedYear,
//       );
//       setSummary(summaryData || null);
//     } catch {
//       console.error("Error loading dashboard summary");
//       setSummary(null);
//     } finally {
//       setLoadingSummary(false);
//     }

//     // Category
//     setLoadingCategory(true);
//     try {
//       const data = await getUserCategoryBudgets(
//         userId,
//         monthToSend,
//         selectedYear,
//       );
//       const parsed = (Array.isArray(data) ? data : []).map((x) => ({
//         CategoryId: x.categoryId,
//         CategoryName: x.categoryName || "Unknown",
//         Budget: Number(x.budget) || 0,
//         TotalExpense: Number(x.totalExpense) || 0,
//       }));
//       setCategoryData(parsed);
//     } catch (err) {
//       console.error("Error loading category data", err);
//       setCategoryData([]);
//     } finally {
//       setLoadingCategory(false);
//     }

//     // Monthly bars
//     setLoadingMonthlyBars(true);
//     setMonthlyBarsError("");
//     try {
//       const raw = await getMonthlySummary(userId, selectedYear);
//       const byMonth = new Map(
//         (Array.isArray(raw) ? raw : []).map((r) => [
//           Number(r.month),
//           {
//             year: Number(r.year) || selectedYear,
//             month: Number(r.month),
//             expense: Number(r.expense) || 0,
//             budget: Number(r.budget) || 0,
//             income: Number(r.income) || 0,
//           },
//         ]),
//       );

//       const complete = Array.from({ length: 12 }, (_, i) => {
//         const m = i + 1;
//         return (
//           byMonth.get(m) || {
//             year: selectedYear,
//             month: m,
//             expense: 0,
//             budget: 0,
//             income: 0,
//           }
//         );
//       });
//       setMonthlyBarsData(complete);
//     } catch (err) {
//       console.error("Error loading monthly bars", err);
//       setMonthlyBarsError("Failed to load monthly bars data.");
//       setMonthlyBarsData([]);
//     } finally {
//       setLoadingMonthlyBars(false);
//     }
//   };

//   const handleCategoryClick = async (catId) => {
//     if (!userId) return;
//     const monthToSend = viewType === "yearly" ? 0 : selectedMonth;

//     try {
//       const data = await SubCategoriesByCategory(
//         catId,
//         userId,
//         monthToSend,
//         selectedYear,
//       );
//       const parsed = (Array.isArray(data) ? data : []).map((x) => ({
//         SubCategoryName: x.name || "Unknown",
//         Amount: Number(x.amount) || 0,
//       }));
//       setSubCategoryData(parsed);
//       setSelectedCategoryId(catId);
//     } catch (err) {
//       console.error("Error loading subcategories", err);
//       setSubCategoryData([]);
//     }
//   };

//   useEffect(() => {
//     if (userId) loadDashboardData();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [userId]);

//   const monthNames = [
//     "January",
//     "February",
//     "March",
//     "April",
//     "May",
//     "June",
//     "July",
//     "August",
//     "September",
//     "October",
//     "November",
//     "December",
//   ];
//   const yearOptions = [2028, 2027, 2026, 2025, 2024, 2023];

//   return (
//     <div className="container mt-4">
//       {/* Header / Filters */}
//       <div className="panel panel-glass mb-4 p-3">
//         <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
//           <div className="d-flex align-items-center flex-wrap gap-2">
//             <div className="segmented">
//               <button
//                 className={`btn ${viewType === "monthly" ? "active" : ""}`}
//                 onClick={() => setViewType("monthly")}
//               >
//                 Monthly
//               </button>
//               <button
//                 className={`btn ${viewType === "yearly" ? "active" : ""}`}
//                 onClick={() => setViewType("yearly")}
//               >
//                 Yearly
//               </button>
//             </div>

//             {viewType === "monthly" && (
//               <select
//                 className="form-select control-pill"
//                 style={{ width: 160 }}
//                 value={selectedMonth}
//                 onChange={(e) => setSelectedMonth(Number(e.target.value))}
//               >
//                 {monthNames.map((m, i) => (
//                   <option key={i} value={i + 1}>
//                     {m}
//                   </option>
//                 ))}
//               </select>
//             )}

//             <select
//               className="form-select control-pill"
//               style={{ width: 130 }}
//               value={selectedYear}
//               onChange={(e) => setSelectedYear(Number(e.target.value))}
//             >
//               {yearOptions.map((y) => (
//                 <option key={y} value={y}>
//                   {y}
//                 </option>
//               ))}
//             </select>

//             <button className="btn btn-search" onClick={loadDashboardData}>
//               Search
//             </button>
//           </div>

//           <h5 className="mb-0 fw-bold">Dashboard</h5>
//         </div>
//       </div>

//       {/* Top summary cards + small donut */}
//       {loadingSummary ? (
//         <div className="panel chart-card mb-4">
//           <h6 className="chart-title mb-3">Income vs Expenses</h6>
//           <div
//             className="skeleton-box skeleton-chart-lg"
//             style={{ height: 240 }}
//           />
//         </div>
//       ) : (
//         <PieChartSection summary={summary} />
//       )}

//       {/* Two-column charts row (left: monthly grouped, right: category) */}
//       <div className="row g-4 mt-1">
//         <div className="col-12 col-lg-8">
//           <div className="panel chart-card">
//             <h6 className="chart-title">
//               Income vs Expenses vs Budget (All Months)
//             </h6>
//             {loadingMonthlyBars ? (
//               <div
//                 className="skeleton-box skeleton-chart-lg"
//                 style={{ height: 360 }}
//               />
//             ) : monthlyBarsError ? (
//               <div
//                 className="skeleton-box skeleton-chart-lg"
//                 style={{ height: 360 }}
//               />
//             ) : (
//               <MonthlyGroupedBarChart data={monthlyBarsData} />
//             )}
//           </div>
//         </div>
//         <div className="col-12 col-lg-4">
//           <div className="panel">
//             {loadingCategory ? (
//               <div className="chart-card">
//                 <h6 className="chart-title">Expense by Category</h6>
//                 <div
//                   className="skeleton-box skeleton-chart-lg"
//                   style={{ height: 360 }}
//                 />
//               </div>
//             ) : (
//               <CategoryChart
//                 data={categoryData}
//                 onCategoryClick={handleCategoryClick}
//               />
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Subcategories */}
//       <SubCategoryChart data={subCategoryData} />
//     </div>
//   );
// }
