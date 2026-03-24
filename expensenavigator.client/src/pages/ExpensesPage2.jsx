import React, { useState, useEffect } from "react";
import { FaTrash, FaPen } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import {
    getCategories,
    getSubCategories,
    getPlaces,
    getExpenses,
    createCategory,
    createSubCategory,
    createPlace,
    createExpense,
    deleteCategory,
    deleteSubCategory,
    deletePlace,
    deleteExpense,
    updateCategory,
    updateSubCategory,
    updatePlace,
    updateExpense,
    getDashboardSummary,
    copyExpenseByRange,
    copyCategoryBudget,
} from "../services/api";

/* Month names */
const monthNames = [
    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
];

/* Currency helper (keeps UI consistent) */
const currency = (v) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 })
        .format(Number(v || 0));

export default function ExpenseManager() {
    // ======= State (unchanged logic) =======
    const [formTab, setFormTab] = useState("category");
    const [tableTab, setTableTab] = useState("category");
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [places, setPlaces] = useState([]);
    const [categoryName, setCategoryName] = useState("");
    const [categoryBudget, setCategoryBudget] = useState("");
    const [subCategoryName, setSubCategoryName] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [placeName, setPlaceName] = useState("");
    const [selectedCategoryForPlace, setSelectedCategoryForPlace] = useState("");
    const [selectedSubCategoryForPlace, setSelectedSubCategoryForPlace] = useState("");
    const [expenseForm, setExpenseForm] = useState({
        date: "",
        category: "",
        subCategory: "",
        place: "",
        store: "",
        amount: "",
        paidFor: "",
        itemName: "",
        note: "",
        isFixed: false,
    });

    const [userId, setUserId] = useState(null);
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [uiMonth, setUiMonth] = useState(selectedMonth);
    const [uiYear, setUiYear] = useState(selectedYear);

   

    const [expenses, setExpenses] = useState([]);
    const [categoryIsRecurring, setCategoryIsRecurring] = useState(false);

   

    //const sortedExpenses = React.useMemo(() => {
    //    return [...expenses].sort((a, b) => {
    //        const catA = categoryMap[a.categoryId] || "";
    //        const catB = categoryMap[b.categoryId] || "";
    //        return catA.localeCompare(catB);
    //    });
    //}, [expenses, categoryMap]);
    const expenseList = expenses; // no sorting
    
    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalBudget: 0,
        totalExpenses: 0,
        remainingIncome: 0,
        remainingBudget: 0,
    });

    const [showGenerateModal, setShowGenerateExpenseModal] = useState(false);
    const [generateRange, setGenerateRange] = useState({
        sourceMonth: selectedMonth,
        sourceYear: selectedYear,
        fromMonth: selectedMonth,
        fromYear: selectedYear,
        toMonth: selectedMonth,
        toYear: selectedYear,
    });
    const hasDataToCopy = expenseList.length > 0;
    const [copyMessage, setCopyMessage] = useState("");

    const [showCopyCategoryBudgetModal, setShowCopyCategoryBudgetModal] = useState(false);
    const [categoryBudgetRange, setCategoryBudgetRange] = useState({
        sourceMonth: new Date().getMonth() + 1,
        sourceYear: new Date().getFullYear(),
        fromMonth: new Date().getMonth() + 2 > 12 ? 12 : new Date().getMonth() + 2,
        toMonth: new Date().getMonth() + 2 > 12 ? 12 : new Date().getMonth() + 2,
    });
    const [categoryCopyMessage, setCategoryCopyMessage] = useState("");

    // ======= Effects =======
    const fetchSummary = async () => {
        if (!userId || !selectedMonth || !selectedYear) return;
        try {
            const data = await getDashboardSummary(userId, parseInt(selectedMonth), parseInt(selectedYear));
            setSummary(data);
        } catch (err) {
            console.error("Error fetching dashboard summary:", err);
        }
    };

    const refreshAll = async () => {
        await Promise.all([fetchData(), fetchSummary()]);
    };

    useEffect(() => {
        if (!userId) return;
        fetchData();
        fetchSummary();
    }, [userId, selectedMonth, selectedYear]);

    useEffect(() => {
        setUiMonth(selectedMonth);
        setUiYear(selectedYear);
    }, [selectedMonth, selectedYear]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const decoded = jwtDecode(token);
            const id =
                decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
                decoded.sub || null;
            setUserId(id);
        } catch (err) {
            console.error("Invalid token", err);
        }
    }, []);

    const fetchData = async () => {
        try {
            const [catRes, subRes, placeRes, expRes] = await Promise.all([
                getCategories(userId, selectedMonth, selectedYear),
                getSubCategories(userId),
                getPlaces(userId),
                getExpenses(userId, selectedMonth, selectedYear),
            ]);
            setCategories(catRes);
            setSubCategories(subRes);
            setPlaces(placeRes);
            setExpenses(expRes);
        } catch (err) {
            console.error("Error fetching data", err);
        }
    };

    // ======= Handlers (logic unchanged) =======
    

     
    // ======= Render =======
    return (
        <div className="container mt-4" style={{ margin: "auto" }}>
                     {/* Overview & Tables */}
            <div className="panel">
                <div className="panel-header">
                    <h6 className="panel-header-title">Overview &amp; Tables</h6>
                    <div className="d-flex gap-2 stack-sm">
                        <Button className="btn-pill btn-blue full-btn-sm" onClick={() => setShowCopyCategoryBudgetModal(true)}>
                            <i className="bi bi-files"></i><span className="ms-1">Copy Categories</span>
                        </Button>
                        <Button className="btn-pill btn-green full-btn-sm" onClick={() => setShowGenerateExpenseModal(true)}>
                            <i className="bi bi-calendar2-plus"></i><span className="ms-1">Copy Expenses</span>
                        </Button>
                    </div>
                </div>

            </div>


            {/* Copy Expenses Modal */}
            <Modal show={showGenerateModal} onHide={() => setShowGenerateExpenseModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Copy Expense</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Source Month &amp; Year</Form.Label>
                        {/* stack on phones */}
                        <div className="stack-sm">
                            <Form.Select
                                className="w-100-sm"
                                value={generateRange.sourceMonth}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setGenerateRange((p) => ({
                                        ...p,
                                        sourceMonth: val,
                                        fromMonth: val + 1 > 12 ? 12 : val + 1,
                                        toMonth: val + 1 > 12 ? 12 : val + 1,
                                    }));
                                }}
                            >
                                {monthNames.map((m, i) => (
                                    <option key={i + 1} value={i + 1}>{m}</option>
                                ))}
                            </Form.Select>

                            <Form.Control
                                className="w-100-sm"
                                type="number"
                                value={generateRange.sourceYear}
                                onChange={(e) => setGenerateRange((p) => ({ ...p, sourceYear: Number(e.target.value) }))}
                            />
                        </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Copy to Months</Form.Label>

                        {/* From row */}
                        <div className="stack-sm">
                            <div className="d-flex gap-2 align-items-center w-100-sm">
                                <Form.Label className="mb-0">From</Form.Label>
                                <Form.Select
                                    className="w-100-sm"
                                    value={generateRange.fromMonth}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        setGenerateRange((p) => ({ ...p, fromMonth: val, toMonth: Math.max(val, p.toMonth) }));
                                    }}
                                >
                                    {monthNames
                                        .map((m, i) => ({ label: m, value: i + 1 }))
                                        .filter((m) => m.value > generateRange.sourceMonth)
                                        .map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                                </Form.Select>
                            </div>

                            {/* To row */}
                            <div className="d-flex gap-2 align-items-center w-100-sm">
                                <Form.Label className="mb-0">To</Form.Label>
                                <Form.Select
                                    className="w-100-sm"
                                    value={generateRange.toMonth}
                                    onChange={(e) => setGenerateRange((p) => ({ ...p, toMonth: Number(e.target.value) }))}
                                >
                                    {monthNames
                                        .map((m, i) => ({ label: m, value: i + 1 }))
                                        .filter((m) => m.value >= generateRange.fromMonth)
                                        .map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                                </Form.Select>
                            </div>
                        </div>

                        {!copyMessage && (
                            <Alert variant="info" className="mt-2 mb-0">
                                Only the expenses from the selected source month will be copied.
                                Target months must be after the source month and within the same year.
                            </Alert>
                        )}
                        {copyMessage && (
                            <Alert
                                variant={copyMessage.toLowerCase().includes("success") ? "success" : "warning"}
                                className="mt-2 mb-0"
                            >
                                {copyMessage}
                            </Alert>
                        )}
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowGenerateExpenseModal(false)}>Cancel</Button>
                    <Button
                        className="btn-pill btn-blue"
                        disabled={!hasDataToCopy}
                        onClick={async () => {
                            try {
                                const payload = {
                                    UserId: userId,
                                    SourceMonth: generateRange.sourceMonth,
                                    SourceYear: generateRange.sourceYear,
                                    TargetFromMonth: generateRange.fromMonth,
                                    TargetToMonth: generateRange.toMonth,
                                };
                                const { data } = await copyExpenseByRange(payload);
                                setCopyMessage(data.message);
                                await refreshAll();
                            } catch (err) {
                                setCopyMessage(err.response?.data || "Something went wrong while copying expenses.");
                            }
                        }}
                    >
                        Copy
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Copy Category Budget Modal */}
            <Modal show={showCopyCategoryBudgetModal} onHide={() => setShowCopyCategoryBudgetModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Copy Category Budget</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Source Month &amp; Year</Form.Label>
                        <div className="stack-sm">
                            <Form.Select
                                className="w-100-sm"
                                value={categoryBudgetRange.sourceMonth}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setCategoryBudgetRange((p) => ({
                                        ...p,
                                        sourceMonth: val,
                                        fromMonth: val + 1 > 12 ? 12 : val + 1,
                                        toMonth: val + 1 > 12 ? 12 : val + 1,
                                    }));
                                }}
                            >
                                {monthNames.map((m, i) => (
                                    <option key={i + 1} value={i + 1}>{m}</option>
                                ))}
                            </Form.Select>

                            <Form.Control
                                className="w-100-sm"
                                type="number"
                                value={categoryBudgetRange.sourceYear}
                                onChange={(e) => setCategoryBudgetRange((p) => ({ ...p, sourceYear: Number(e.target.value) }))}
                            />
                        </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Copy to Months</Form.Label>

                        <div className="stack-sm">
                            <div className="d-flex gap-2 align-items-center w-100-sm">
                                <Form.Label className="mb-0">From</Form.Label>
                                <Form.Select
                                    className="w-100-sm"
                                    value={categoryBudgetRange.fromMonth}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        setCategoryBudgetRange((p) => ({ ...p, fromMonth: val, toMonth: Math.max(val, p.toMonth) }));
                                    }}
                                >
                                    {monthNames
                                        .map((m, i) => ({ label: m, value: i + 1 }))
                                        .filter((m) => m.value > categoryBudgetRange.sourceMonth)
                                        .map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                                </Form.Select>
                            </div>

                            <div className="d-flex gap-2 align-items-center w-100-sm">
                                <Form.Label className="mb-0">To</Form.Label>
                                <Form.Select
                                    className="w-100-sm"
                                    value={categoryBudgetRange.toMonth}
                                    onChange={(e) => setCategoryBudgetRange((p) => ({ ...p, toMonth: Number(e.target.value) }))}
                                >
                                    {monthNames
                                        .map((m, i) => ({ label: m, value: i + 1 }))
                                        .filter((m) => m.value >= categoryBudgetRange.fromMonth)
                                        .map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                                </Form.Select>
                            </div>
                        </div>

                        {!categoryCopyMessage && (
                            <Alert variant="info" className="mt-2 mb-0">
                                Only the budgets from the selected source month will be copied.
                                Target months must be after the source month and within the same year.
                            </Alert>
                        )}
                        {categoryCopyMessage && (
                            <Alert
                                variant={categoryCopyMessage.toLowerCase().includes("success") ? "success" : "warning"}
                                className="mt-2 mb-0"
                            >
                                {categoryCopyMessage}
                            </Alert>
                        )}
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCopyCategoryBudgetModal(false)}>Cancel</Button>
                    <Button
                        className="btn-pill btn-green"
                        onClick={async () => {
                            try {
                                const payload = {
                                    UserId: userId,
                                    SourceMonth: categoryBudgetRange.sourceMonth,
                                    SourceYear: categoryBudgetRange.sourceYear,
                                    TargetFromMonth: categoryBudgetRange.fromMonth,
                                    TargetToMonth: categoryBudgetRange.toMonth,
                                };
                                const { data } = await copyCategoryBudget(payload);
                                setCategoryCopyMessage(data.message);
                                await refreshAll();
                            } catch (err) {
                                setCategoryCopyMessage(err.response?.data || "Something went wrong while copying budgets.");
                            }
                        }}
                    >
                        Copy
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
};
