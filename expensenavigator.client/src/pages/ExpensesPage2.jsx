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

    const [editCategoryModalOpen, setEditCategoryModalOpen] = useState(false);
    const [editSubCategoryModalOpen, setEditSubCategoryModalOpen] = useState(false);
    const [editPlaceModalOpen, setEditPlaceModalOpen] = useState(false);

    const [editCategoryItem, setEditCategoryItem] = useState(null);
    const [editSubCategoryItem, setEditSubCategoryItem] = useState(null);
    const [editPlaceItem, setEditPlaceItem] = useState(null);

    const [editCategoryName, setEditCategoryName] = useState("");
    const [editSubCategoryName, setEditSubCategoryName] = useState("");
    const [editSubCategoryParent, setEditSubCategoryParent] = useState("");
    const [editPlaceName, setEditPlaceName] = useState("");
    const [editPlaceSubCategory, setEditPlaceSubCategory] = useState("");

    const [showBudgetPrompt, setShowBudgetPrompt] = useState(false);
    const [budgetPromptCategory, setBudgetPromptCategory] = useState(null);
    const [newBudgetAmount, setNewBudgetAmount] = useState("");

    const [editExpenseModalOpen, setEditExpenseModalOpen] = useState(false);
    const [editExpenseForm, setEditExpenseForm] = useState({
        date: "",
        categoryId: "",
        subCategoryId: "",
        placeId: "",
        amount: "",
        paidFor: "",
        note: "",
        isFixed: false,
    });

    const [expenses, setExpenses] = useState([]);
    const [categoryIsRecurring, setCategoryIsRecurring] = useState(false);

    const categoryMap = React.useMemo(() => {
        const map = {};
        categories.forEach((c) => { map[c.catId] = c.name; });
        return map;
    }, [categories]);
    const subCategoryMap = React.useMemo(() => {
        const map = {};

        subCategories.forEach(sc => {
            map[sc.id] = sc.name;
        });

        return map;

    }, [subCategories]);


    const placeMap = React.useMemo(() => {
        const map = {};

        places.forEach(p => {
            map[p.id] = p.name;
        });

        return map;

    }, [places]);

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

    const [categorySort, setCategorySort] = useState({ field: "name", asc: true });
    const [subCatSort, setSubCatSort] = useState({ field: "name", asc: true });
    const [placeSort, setPlaceSort] = useState({ field: "name", asc: true });
    //const [expenseSort, setExpenseSort] = useState({ field: "date", asc: true });

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
    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!categoryName || !userId) return;
        try {
            await createCategory(userId, categoryName, categoryBudget ? parseFloat(categoryBudget) : 0, categoryIsRecurring);
            await refreshAll();
            await fetchSummary();
            setCategoryName("");
            setCategoryBudget("");
            setCategoryIsRecurring(false);
        } catch (err) {
            console.error(err);
            alert("Failed to create category");
        }
    };

    const handleAddSubCategory = async (e) => {
        e.preventDefault();
        if (!subCategoryName || !selectedCategory || !userId) return;
        try {
            const res = await createSubCategory({
                name: subCategoryName,
                categoryId: selectedCategory,
                userId,
                isRecurring: true,
            });
            setSubCategories([...subCategories, res]);
            setSubCategoryName("");
            setSelectedCategory("");
        } catch (err) {
            console.error(err);
            alert("Failed to create subcategory");
        }
    };

    const handleAddPlace = async (e) => {
        e.preventDefault();
        if (!placeName || !userId) return;
        try {
            const res = await createPlace({
                name: placeName,
                subCategoryId: selectedSubCategoryForPlace || null,
                userId,
                isRecurring: true,
            });
            setPlaces([...places, res]);
            setPlaceName("");
            setSelectedCategoryForPlace("");
            setSelectedSubCategoryForPlace("");
        } catch (err) {
            console.error(err);
            alert("Failed to create place");
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        if (!userId || !expenseForm.category || !expenseForm.amount || !expenseForm.date) return;
        const selectedCat = categories.find((c) => c.catId === expenseForm.category);
        if (selectedCat && Number(selectedCat.budget) === 0) {
            setBudgetPromptCategory(selectedCat);
            setShowBudgetPrompt(true);
            return;
        }
        await saveExpense();
    };

    const saveExpense = async () => {
        const [year, month] = expenseForm.date.split("-").map(Number);
        try {
            await createExpense({
                userId,
                date: expenseForm.date,
                categoryId: expenseForm.category,
                subCategoryId: expenseForm.subCategory || null,
                placeId: expenseForm.place || null,
                amount: parseFloat(expenseForm.amount),
                paidFor: expenseForm.paidFor || null,
                itemName: expenseForm.itemName || null,
                note: expenseForm.note || null,
                year,
                month,
                isFixed: expenseForm.isFixed ?? false,
            });
            await refreshAll();
            setExpenseForm({
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
        } catch (err) {
            console.error(err);
            alert("Failed to create expense");
        }
    };

    const handleExpenseChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === "category") {
            setExpenseForm({ ...expenseForm, category: value, subCategory: "", place: "" });
        } else {
            setExpenseForm({ ...expenseForm, [name]: type === "checkbox" ? checked : value });
        }
    };

    const handleDelete = async (id, type, userIdArg = null, month = null, year = null) => {
        if (!id) return;
        try {
            switch (type) {
                case "expense":
                    await deleteExpense(id);
                    await refreshAll();
                    await fetchSummary();
                    break;
                case "category":
                    if (!userId || month == null || year == null) return;
                    await deleteCategory(id, userId, month, year);
                    await refreshAll();
                    break;
                case "subCategory":
                    await deleteSubCategory(id);
                    setSubCategories(await getSubCategories(userId));
                    break;
                case "place":
                    await deletePlace(id);
                    setPlaces(await getPlaces(userId));
                    break;
                default:
                    break;
            }
        } catch (err) {
            console.error(err);
            alert("Delete failed");
        }
    };

    const openEditCategoryModal = (category) => {
        setEditCategoryItem(category);
        setEditCategoryName(category.name);
        setEditCategoryModalOpen(true);
    };

    const openEditSubCategoryModal = (sub) => {
        setEditSubCategoryItem(sub);
        setEditSubCategoryName(sub.name);
        setEditSubCategoryParent(sub.categoryId);
        setEditSubCategoryModalOpen(true);
    };

    const openEditPlaceModal = (place) => {
        const freshPlace = places.find((p) => p.id === place.id);
        setEditPlaceItem(freshPlace);
        setEditPlaceName(freshPlace.name);
        setEditPlaceSubCategory(freshPlace.subCategoryId);
        setEditPlaceModalOpen(true);
    };

    const saveEditCategory = async () => {
        if (!editCategoryItem) return;
        const payload = {
            catId: editCategoryItem.catId,
            userId: editCategoryItem.userId,
            name: editCategoryName,
            budget: editCategoryItem.budget,
            isRecurring: editCategoryItem.isRecurring,
            isActive: editCategoryItem.isActive,
            month: editCategoryItem.month,
            year: editCategoryItem.year,
        };
        try {
            await updateCategory(payload);
            await refreshAll();
            const refreshed = await getCategories(userId, selectedMonth, selectedYear);
            setCategories(refreshed);
            await fetchSummary();
            setEditCategoryModalOpen(false);
        } catch (err) {
            console.error("Failed to update category", err);
            alert("Failed to update category");
        }
    };

    const saveEditSubCategory = async () => {
        if (!editSubCategoryItem) return;
        if (!editSubCategoryParent) {
            alert("Please select a parent category");
            return;
        }
        try {
            const payload = {
                id: editSubCategoryItem.id,
                name: editSubCategoryName,
                categoryId: editSubCategoryParent,
                createdDate: editSubCategoryItem.createdDate || null,
                isRecurring: editSubCategoryItem.isRecurring,
                isActive: editSubCategoryItem.isActive,
                userId,
            };
            await updateSubCategory(editSubCategoryItem.id, payload);
            const refreshed = await getSubCategories(userId);
            setSubCategories(refreshed);
            setEditSubCategoryModalOpen(false);
        } catch (err) {
            console.error("Failed to update subcategory:", err.response?.data || err);
            alert("Failed to update subcategory");
        }
    };

    const saveEditPlace = async () => {
        try {
            const userIdLocal = localStorage.getItem("userId");
            const payload = {
                name: editPlaceName,
                subCategoryId: editPlaceSubCategory || null,
                userId: userIdLocal,
                isRecurring: editPlaceItem.isRecurring,
                isActive: editPlaceItem.isActive,
            };
            await updatePlace(editPlaceItem.id, payload);
            setPlaces((prev) =>
                prev.map((p) =>
                    p.id === editPlaceItem.id
                        ? {
                            ...p,
                            name: editPlaceName,
                            isRecurring: editPlaceItem.isRecurring,
                            isActive: editPlaceItem.isActive,
                            subCategoryId: editPlaceSubCategory ?? p.subCategoryId,
                        }
                        : p
                )
            );
            setEditPlaceModalOpen(false);
        } catch (err) {
            console.error("Failed to update place:", err.response?.data || err);
            alert("Failed to update place");
        }
    };

    const saveEditExpense = async (id) => {
        const rowData = editExpenseForm;
        const original = expenses.find((e) => e.id === id);
        if (!original) return;
        const dateStr = rowData.date ?? (original.date ? original.date.split("T")[0] : null);
        if (!dateStr) return;
        const dateObj = new Date(dateStr);
        if (isNaN(dateObj)) return;
        const [year, month] = dateStr.split("-").map(Number);

        try {
            const payload = {
                userId,
                date: dateStr,
                categoryId: rowData.categoryId ?? original.categoryId,
                subCategoryId: rowData.subCategoryId ?? original.subCategoryId ?? null,
                placeId: rowData.placeId ?? original.placeId ?? null,
                amount: parseFloat(rowData.amount ?? original.amount),
                paidFor: rowData.paidFor ?? original.paidFor ?? null,
                itemName: rowData.itemName ?? original.itemName ?? null,
                note: rowData.note ?? original.note ?? "",
                isFixed: rowData.isFixed ?? original.isFixed ?? false,
                month,
                year,
            };
            await updateExpense(id, payload);
            await refreshAll();
            setEditExpenseModalOpen(false);
            setEditExpenseForm({});
        } catch (err) {
            console.error("Failed to update expense:", err.response?.data || err);
            alert("Failed to update expense");
        }
    };

    // Sorting helpers (unchanged)
    const handleCategorySort = (field) => {
        const asc = categorySort.field === field ? !categorySort.asc : true;
        setCategorySort({ field, asc });
    };
    const sortedCategories = [...categories].sort((a, b) => {
        const field = categorySort.field;
        let valA = a[field];
        let valB = b[field];
        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();
        if (valA < valB) return categorySort.asc ? -1 : 1;
        if (valA > valB) return categorySort.asc ? 1 : -1;
        return 0;
    });

    const handleSubCatSort = (field) => {
        const asc = subCatSort.field === field ? !subCatSort.asc : true;
        setSubCatSort({ field, asc });
    };
    const sortedSubCategories = [...subCategories].sort((a, b) => {
        const field = subCatSort.field;
        let valA, valB;
        if (field === "category") {
            valA = categories.find((c) => c.catId === a.categoryId)?.name || "";
            valB = categories.find((c) => c.catId === b.categoryId)?.name || "";
        } else {
            valA = a[field];
            valB = b[field];
        }
        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();
        if (valA < valB) return subCatSort.asc ? -1 : 1;
        if (valA > valB) return subCatSort.asc ? 1 : -1;
        return 0;
    });

    const sortedPlaces = [...places].sort((a, b) => {
        let valA = a.name.toLowerCase();
        let valB = b.name.toLowerCase();
        return placeSort.asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    //const toggleExpenseSort = (field) => {
    //    setExpenseSort((prev) => (prev.field === field ? { field, asc: !prev.asc } : { field, asc: true }));
    //};

    const handleSearchByMonth = () => {
        if (!userId) return;
        const changed = uiMonth !== selectedMonth || uiYear !== selectedYear;
        if (!changed) return;
        setSelectedMonth(uiMonth);
        setSelectedYear(uiYear);
    };

    const openEditExpenseModal = (exp) => {
        setEditExpenseForm({
            id: exp.id,
            date: exp.date?.split("T")[0] ?? "",
            categoryId: exp.categoryId ? String(exp.categoryId) : "",
            subCategoryId: exp.subCategoryId ? String(exp.subCategoryId) : "",
            placeId: exp.placeId ? String(exp.placeId) : "",
            amount: exp.amount != null ? String(exp.amount) : "",
            paidFor: exp.paidFor || "",
            itemName: exp.itemName || "",
            note: exp.note || "",
            isFixed: !!exp.isFixed,
        });
        setEditExpenseModalOpen(true);
    };

    // ======= Render =======
    return (
        <div className="container mt-4" style={{ margin: "auto" }}>
            {/* Page header */}
            <h4 className="page-title">Expenses</h4>
            <div className="page-header-line"></div>

            {/* Top Filter Panel */}
            <div className="panel">
                <div className="panel-body">
                    <div className="toolbar stack-sm">
                        <Form.Group className="mb-0 w-100-sm">
                            <Form.Label className="mb-1">Month</Form.Label>
                            <Form.Select
                                className="control-pill"
                                value={uiMonth}
                                onChange={(e) => setUiMonth(Number(e.target.value))}
                            >
                                {monthNames.map((m, index) => (
                                    <option key={index + 1} value={index + 1}>{m}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-0 w-100-sm">
                            <Form.Label className="mb-1">Year</Form.Label>
                            <Form.Select
                                className="control-pill"
                                value={uiYear}
                                onChange={(e) => setUiYear(Number(e.target.value))}
                            >
                                {[...Array(5)].map((_, i) => {
                                    const year = now.getFullYear() - i;
                                    return <option key={year} value={year}>{year}</option>;
                                })}
                            </Form.Select>
                        </Form.Group>

                        <Button className="btn-pill btn-green full-btn-sm" onClick={handleSearchByMonth}>
                            <i className="bi bi-search"></i>
                            <span className="ms-1">Search</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* KPI Summary + Actions */}
            <div className="panel">
                <div className="panel-body">
                    {/* KPI Cards */}
                    <div className="kpi-grid mb-3">
                        <div className="kpi-card kpi--income">
                            <div className="kpi-title">Total Income</div>
                            <div className="kpi-value">{currency(summary.totalIncome)}</div>
                            <div className="kpi-sub">This month</div>
                            <div className="kpi-icon"><i className="bi bi-wallet2"></i></div>
                        </div>

                        <div className="kpi-card kpi--budget">
                            <div className="kpi-title">Total Budget</div>
                            <div className="kpi-value">{currency(summary.totalBudget)}</div>
                            <div className="kpi-sub">This month</div>
                            <div className="kpi-icon"><i className="bi bi-clipboard2-data"></i></div>
                        </div>

                        <div className="kpi-card kpi--remaining">
                            <div className="kpi-title">Remaining Budget</div>
                            <div className="kpi-value">
                                {currency(summary.remainingBudget)}
                            </div>
                            <div className="kpi-sub">This month</div>
                            <div className="kpi-icon"><i className="bi bi-piggy-bank"></i></div>
                        </div>

                        <div className="kpi-card kpi--expense">
                            <div className="kpi-title">Total Expense</div>
                            <div className="kpi-value">{currency(summary.totalExpenses)}</div>
                            <div className="kpi-sub">This month</div>
                            <div className="kpi-icon"><i className="bi bi-receipt"></i></div>
                        </div>
                    </div>

                    {/* Header-like actions (copy) */}
                    {/*<div className="d-flex gap-2 stack-sm">*/}
                    {/*    <Button className="btn-pill btn-blue full-btn-sm" onClick={() => setShowCopyCategoryBudgetModal(true)}>*/}
                    {/*        <i className="bi bi-files"></i>*/}
                    {/*        <span className="ms-1">Copy Categories to Next Month</span>*/}
                    {/*    </Button>*/}
                    {/*    <Button className="btn-pill btn-green full-btn-sm" onClick={() => setShowGenerateExpenseModal(true)}>*/}
                    {/*        <i className="bi bi-calendar2-plus"></i>*/}
                    {/*        <span className="ms-1">Copy Expenses to Next Month</span>*/}
                    {/*    </Button>*/}
                    {/*</div>*/}
                </div>
            </div>

            {/* Manage (Forms) */}
            <div className="panel">
                <div className="panel-header">
                    <h6 className="panel-header-title">Manage</h6>
                </div>
                <div className="panel-body">
                    <div className="d-flex flex-wrap gap-2 mb-3">
                        {["category", "subCategory", "place", "expense"].map((tab) => (
                            <Button
                                key={tab}
                                className={`btn-pill ${formTab === tab ? "btn-green" : "btn-ghost"}`}
                                onClick={() => setFormTab(tab)}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </Button>
                        ))}
                    </div>

                    {formTab === "category" && (
                        <form onSubmit={handleAddCategory}>
                            <div className="row g-2">
                                <div className="col-12 col-md-6">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Category Name"
                                        value={categoryName}
                                        onChange={(e) => setCategoryName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="col-12 col-md-4">
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Budget"
                                        value={categoryBudget}
                                        onChange={(e) => setCategoryBudget(e.target.value)}
                                        min="0"
                                        required
                                    />
                                </div>
                                <div className="col-12 col-md-2">
                                    <Button type="submit" className="w-100 btn-pill btn-green">Add Category</Button>
                                </div>
                            </div>
                        </form>
                    )}

                    {formTab === "subCategory" && (
                        <form onSubmit={handleAddSubCategory}>
                            <div className="row g-2">
                                <div className="col-12 col-md-6">
                                    <select
                                        className="form-select"
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        required
                                    >
                                        <option value="">Choose Category</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.catId}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-12 col-md-4">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="SubCategory Name"
                                        value={subCategoryName}
                                        onChange={(e) => setSubCategoryName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="col-12 col-md-2">
                                    <Button type="submit" className="w-100 btn-pill btn-green">Add SubCategory</Button>
                                </div>
                            </div>
                        </form>
                    )}

                    {formTab === "place" && (
                        <form onSubmit={handleAddPlace}>
                            <div className="row g-2">
                                <div className="col-12 col-md-10">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Place Name"
                                        value={placeName}
                                        onChange={(e) => setPlaceName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="col-12 col-md-2">
                                    <Button type="submit" className="w-100 btn-pill btn-blue">Add Place</Button>
                                </div>
                            </div>
                        </form>
                    )}

                    {formTab === "expense" && (
                        <form onSubmit={handleAddExpense}>
                            <div className="row g-2">
                                <div className="col-12 col-sm-6">
                                    <input
                                        type="date"
                                        name="date"
                                        className="form-control"
                                        value={expenseForm.date || ""}
                                        onChange={handleExpenseChange}
                                        required
                                    />
                                </div>
                                <div className="col-12 col-sm-6">
                                    <select
                                        className="form-select"
                                        name="category"
                                        value={expenseForm.category}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setExpenseForm({ ...expenseForm, category: value, subCategory: "", place: "" });
                                        }}
                                        required
                                    >
                                        <option value="">Choose a Category</option>
                                        {categories.filter((c) => c.isActive).map((c) => (
                                            <option key={c.catId} value={c.catId}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-12 col-sm-6">
                                    <select
                                        className="form-select"
                                        name="subCategory"
                                        value={expenseForm.subCategory || ""}
                                        onChange={handleExpenseChange}
                                    >
                                        <option value="">Choose a SubCategory (optional)</option>
                                        {subCategories
                                            .filter((sc) => sc.categoryId === expenseForm.category)
                                            .map((sc) => (
                                                <option key={sc.id} value={sc.id}>{sc.name}</option>
                                            ))}
                                    </select>
                                </div>
                                <div className="col-12 col-sm-6">
                                    <select
                                        className="form-select"
                                        name="place"
                                        value={expenseForm.place || ""}
                                        onChange={handleExpenseChange}
                                    >
                                        <option value="">Choose a Place</option>
                                        {places.map((p) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-12 col-sm-6">
                                    <input
                                        type="number"
                                        name="amount"
                                        className="form-control"
                                        placeholder="Amount"
                                        value={expenseForm.amount}
                                        onChange={handleExpenseChange}
                                        required
                                    />
                                </div>
                                <div className="col-12 col-sm-6">
                                    <input
                                        type="text"
                                        name="paidFor"
                                        className="form-control"
                                        placeholder="Paid For"
                                        value={expenseForm.paidFor}
                                        onChange={handleExpenseChange}
                                    />
                                </div>
                                <div className="col-12 col-sm-6">
                                    <input
                                        type="text"
                                        name="itemName"
                                        className="form-control"
                                        placeholder="Item Name"
                                        value={expenseForm.itemName}
                                        onChange={handleExpenseChange}
                                    />
                                </div>
                                <div className="col-12">
                                    <textarea
                                        name="note"
                                        className="form-control"
                                        placeholder="Note"
                                        value={expenseForm.note}
                                        onChange={handleExpenseChange}
                                    />
                                </div>
                                <div className="col-12">
                                    <div className="form-check mb-2">
                                        <input
                                            type="checkbox"
                                            id="expenseLable"
                                            name="isFixed"
                                            className="form-check-input"
                                            checked={expenseForm.isFixed}
                                            onChange={handleExpenseChange}
                                        />
                                        <label className="form-check-label" htmlFor="expenseLable">
                                            Fixed Expense
                                        </label>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <Button type="submit" className="w-100 btn-pill btn-green">Add Expense</Button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>

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

                <div className="panel-body">
                    {/* Tab Toggle */}
                    <div className="d-flex flex-wrap gap-2 mb-3">
                        {["category", "subCategory", "place", "expense"].map((tab) => (
                            <Button
                                key={tab}
                                className={`btn-pill ${tableTab === tab ? "btn-green" : "btn-ghost"}`}
                                onClick={() => setTableTab(tab)}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)} Table
                            </Button>
                        ))}
                    </div>

                    {/* Category Table */}
                    {tableTab === "category" && (
                        <div className="table-responsive table-rounded">
                            <table className="table table-soft table-hover align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th onClick={() => handleCategorySort("name")} style={{ cursor: "pointer" }}>Name</th>
                                        <th onClick={() => handleCategorySort("budget")} style={{ cursor: "pointer" }}>Budget</th>
                                        <th>Active</th>
                                        <th style={{ width: 120 }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedCategories.map((cat) => (
                                        <tr key={cat.id}>
                                            <td data-label="Name">{cat.name}</td>
                                            <td data-label="Budget">{currency(cat.budget)}</td>
                                            <td data-label="Active">{cat.isActive ? "Yes" : "No"}</td>
                                            <td data-label="Action" data-actions="true">
                                                <div className="cell-actions">
                                                    <Button
                                                        size="sm"
                                                        className="btn-ghost me-2"
                                                        onClick={() => openEditCategoryModal(cat)}
                                                    >
                                                        <i className="bi bi-pencil"></i>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="btn-ghost"
                                                        onClick={() =>
                                                            handleDelete(cat.catId, "category", userId, parseInt(selectedMonth), parseInt(selectedYear))
                                                        }
                                                    >
                                                        <i className="bi bi-trash text-danger"></i>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {categories.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="text-center py-4">No categories</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* SubCategory Table */}
                    {tableTab === "subCategory" && (
                        <div className="table-responsive table-rounded">
                            <table className="table table-soft table-hover align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th onClick={() => handleSubCatSort("name")} style={{ cursor: "pointer" }}>Name</th>
                                        <th onClick={() => handleSubCatSort("category")} style={{ cursor: "pointer" }}>Category</th>
                                        <th>Active</th>
                                        <th style={{ width: 120 }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedSubCategories.map((sc) => (
                                        <tr key={sc.id}>
                                            <td data-label="Name">{sc.name}</td>
                                            <td data-label="Category">{categories.find((c) => c.catId === sc.categoryId)?.name || "-"}</td>
                                            <td data-label="Active">{sc.isActive ? "Yes" : "No"}</td>
                                            <td data-label="Action" data-actions="true">
                                                <div className="cell-actions">
                                                    <Button size="sm" className="btn-ghost me-2" onClick={() => openEditSubCategoryModal(sc)}>
                                                        <i className="bi bi-pencil"></i>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="btn-ghost"
                                                        onClick={() => handleDelete(sc.id, "subCategory", userId, selectedMonth, selectedYear)}
                                                    >
                                                        <i className="bi bi-trash text-danger"></i>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {subCategories.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="text-center py-4">No subcategories</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Place Table */}
                    {tableTab === "place" && (
                        <div className="table-responsive table-rounded">
                            <table className="table table-soft table-hover align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th
                                            style={{ cursor: "pointer" }}
                                            onClick={() => setPlaceSort({ field: "name", asc: !placeSort.asc })}
                                        >
                                            Name
                                        </th>
                                        <th>Active</th>
                                        <th style={{ width: 120 }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedPlaces.map((p) => (
                                        <tr key={p.id}>
                                            <td data-label="Name">{p.name}</td>
                                            <td data-label="Active">{p.isActive ? "Yes" : "No"}</td>
                                            <td data-label="Action" data-actions="true">
                                                <div className="cell-actions">
                                                    <Button size="sm" className="btn-ghost me-2" onClick={() => openEditPlaceModal(p)}>
                                                        <i className="bi bi-pencil"></i>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="btn-ghost"
                                                        onClick={() => handleDelete(p.id, "place", userId, selectedMonth, selectedYear)}
                                                    >
                                                        <i className="bi bi-trash text-danger"></i>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {places.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="text-center py-4">No places</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Expense Table */}
                    {tableTab === "expense" && (
                        <div className="table-responsive table-rounded">
                            <table className="table table-soft table-hover align-middle mb-0" style={{ fontSize: "0.95rem" }}>
                                <thead>
                                    <tr>
                                        {/*<th style={{ width: "120px", cursor: "pointer" }}*/}
                                        {/*    onClick={() => setExpenseSort({ field: "date", asc: !expenseSort.asc })}>*/}
                                        {/*    Date*/}
                                        {/*</th>*/}
                                        {/*<th style={{ cursor: "pointer" }} onClick={() => setExpenseSort({ field: "category", asc: !expenseSort.asc })}>*/}
                                        {/*    Category*/}
                                        {/*</th>*/}
                                        {/*<th style={{ cursor: "pointer" }} onClick={() => setExpenseSort({ field: "subCategory", asc: !expenseSort.asc })}>*/}
                                        {/*    SubCategory*/}
                                        {/*</th>*/}
                                        {/*<th style={{ cursor: "pointer" }} onClick={() => setExpenseSort({ field: "place", asc: !expenseSort.asc })}>*/}
                                        {/*    Place*/}
                                        {/*</th>*/}
                                        <th>Date</th>
                                        <th>Category</th>
                                        <th>SubCategory</th>
                                        <th>Place</th>
                                        <th className="text-truncate" style={{ width: "100px" }}>Amount</th>
                                        <th style={{ width: "120px" }}>Paid For</th>
                                        <th style={{ width: "140px" }}>Item</th>
                                        <th style={{ width: "180px" }}>Note</th>
                                        {/*<th style={{ width: "80px", cursor: "pointer" }}*/}
                                        {/*    onClick={() => toggleExpenseSort("isFixed")}>*/}
                                        {/*    Fixed*/}
                                        {/*</th>*/}
                                        <th style={{ width: "80px", cursor: "pointer" }}>Fixed</th>
                                        <th className="text-center" style={{ width: "80px" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenseList.map((exp) => (
                                        <tr key={exp.id}>
                                            <td data-label="Date" className="text-nowrap text-muted">
                                                {exp.date?.split("T")[0]}
                                            </td>
                                            <td data-label="Category">{categoryMap[exp.categoryId] || ""}</td>
                                            <td data-label="SubCategory">{subCategoryMap[exp.subCategoryId] || ""}</td>
                                            <td data-label="Place">{placeMap[exp.placeId] || ""}</td>
                                            <td data-label="Amount" className="fw-semibold">{currency(exp.amount)}</td>
                                            <td data-label="Paid For">{exp.paidFor}</td>
                                            <td data-label="Item" className="text-truncate" style={{ maxWidth: "140px" }} title={exp.itemName}>
                                                {exp.itemName}
                                            </td>
                                            <td data-label="Note" className="text-truncate text-muted" style={{ maxWidth: "180px" }} title={exp.note}>
                                                {exp.note}
                                            </td>
                                            <td data-label="Fixed">
                                                {exp.isFixed ? <span className="badge-soft success">Yes</span> : <span className="badge-soft">No</span>}
                                            </td>

                                            <td data-label="Actions" data-actions="true">
                                                <div className="cell-actions d-flex align-items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="btn-ghost"
                                                        onClick={() => openEditExpenseModal(exp)}
                                                    >
                                                        <i className="bi bi-pencil"></i>
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        className="btn-ghost"
                                                        onClick={() => handleDelete(exp.id, "expense")}
                                                    >
                                                        <i className="bi bi-trash text-danger"></i>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {/*{sortedExpenses.length === 0 && (*/}
                                    {/*    <tr>*/}
                                    {/*        <td colSpan={10} className="text-center text-muted py-4">No expenses found</td>*/}
                                    {/*    </tr>*/}
                                    {/*)}*/}
                                    {expenseList.length === 0 && (
                                        <tr>
                                            <td colSpan={10} className="text-center text-muted py-4">No expenses found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* ===== Modals & Prompts ===== */}

            {/* Budget prompt */}
            {showBudgetPrompt && budgetPromptCategory && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Set Budget for {budgetPromptCategory.name}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowBudgetPrompt(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p>
                                    You just added an expense to <strong>{budgetPromptCategory.name}</strong> but this category has no
                                    budget set for {selectedMonth}/{selectedYear}.
                                </p>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="Enter budget amount"
                                    value={newBudgetAmount}
                                    onChange={(e) => setNewBudgetAmount(e.target.value)}
                                    min="0"
                                />
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowBudgetPrompt(false)}>Not now</button>
                                <button
                                    className="btn btn-primary"
                                    onClick={async () => {
                                        if (!newBudgetAmount || !budgetPromptCategory) return;
                                        try {
                                            await updateCategory({
                                                catId: budgetPromptCategory.catId,
                                                userId: budgetPromptCategory.userId,
                                                name: budgetPromptCategory.name,
                                                budget: parseFloat(newBudgetAmount),
                                                isActive: budgetPromptCategory.isActive,
                                                isRecurring: budgetPromptCategory.isRecurring,
                                                month: selectedMonth,
                                                year: selectedYear,
                                            });
                                            await refreshAll();
                                            setShowBudgetPrompt(false);
                                            setNewBudgetAmount("");
                                            setBudgetPromptCategory(null);
                                        } catch (err) {
                                            console.error("Failed to update budget", err);
                                            alert("Failed to update budget");
                                        }
                                    }}
                                >
                                    Save Budget
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Category */}
            {editCategoryModalOpen && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Category</h5>
                                <button type="button" className="btn-close" onClick={() => setEditCategoryModalOpen(false)}></button>
                            </div>
                            <div className="modal-body">
                                <input
                                    type="text"
                                    className="form-control mb-2"
                                    value={editCategoryName}
                                    onChange={(e) => setEditCategoryName(e.target.value)}
                                />
                                <input
                                    type="number"
                                    className="form-control mb-3"
                                    value={editCategoryItem?.budget ?? 0}
                                    onChange={(e) => setEditCategoryItem({ ...editCategoryItem, budget: parseFloat(e.target.value) })}
                                    min="0"
                                />
                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="editIsActive"
                                        checked={editCategoryItem?.isActive ?? false}
                                        onChange={(e) => setEditCategoryItem({ ...editCategoryItem, isActive: e.target.checked })}
                                    />
                                    <label className="form-check-label" htmlFor="editIsActive">Is Active</label>
                                </div>
                                <input type="hidden" value={editCategoryItem?.id || ""} readOnly />
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setEditCategoryModalOpen(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={saveEditCategory}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit SubCategory */}
            {editSubCategoryModalOpen && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit SubCategory</h5>
                                <button type="button" className="btn-close" onClick={() => setEditSubCategoryModalOpen(false)}></button>
                            </div>
                            <div className="modal-body">
                                <select
                                    className="form-select mb-2"
                                    value={editSubCategoryParent}
                                    onChange={(e) => setEditSubCategoryParent(e.target.value)}
                                >
                                    <option value="">-- Select Parent Category --</option>
                                    {categories.map((c) => (
                                        <option key={c.catId} value={c.catId}>{c.name}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={editSubCategoryName}
                                    onChange={(e) => setEditSubCategoryName(e.target.value)}
                                />
                                <div className="form-check mt-2">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="editSubIsActive"
                                        checked={editSubCategoryItem?.isActive ?? false}
                                        onChange={(e) => setEditSubCategoryItem({ ...editSubCategoryItem, isActive: e.target.checked })}
                                    />
                                    <label className="form-check-label" htmlFor="editSubIsActive">Is Active</label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setEditSubCategoryModalOpen(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={saveEditSubCategory}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Place */}
            {editPlaceModalOpen && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Place</h5>
                                <button type="button" className="btn-close" onClick={() => setEditPlaceModalOpen(false)}></button>
                            </div>
                            <div className="modal-body">
                                <input
                                    type="text"
                                    className="form-control mt-1"
                                    value={editPlaceName}
                                    onChange={(e) => setEditPlaceName(e.target.value)}
                                />
                                <div className="form-check mt-2">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="editPlaceIsActive"
                                        checked={editPlaceItem?.isActive ?? false}
                                        onChange={(e) => setEditPlaceItem({ ...editPlaceItem, isActive: e.target.checked })}
                                    />
                                    <label className="form-check-label" htmlFor="editPlaceIsActive">Is Active</label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setEditPlaceModalOpen(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={saveEditPlace}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* Edit Expense */}
            {editExpenseModalOpen && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Expense</h5>
                                <button type="button" className="btn-close" onClick={() => setEditExpenseModalOpen(false)}></button>
                            </div>

                            <div className="modal-body">
                                {/* Wrap the grid so mobile rules apply cleanly */}
                                <div className="row g-2">
                                    <div className="col-12 col-sm-6">
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={editExpenseForm.date || ""}
                                            onChange={(e) => setEditExpenseForm((prev) => ({ ...prev, date: e.target.value }))}
                                        />
                                    </div>

                                    <div className="col-12 col-sm-6">
                                        <select
                                            className="form-select"
                                            value={editExpenseForm.categoryId || ""}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setEditExpenseForm((prev) => ({ ...prev, categoryId: value, subCategoryId: "", placeId: "" }));
                                            }}
                                        >
                                            <option value="">Choose Category</option>
                                            {categories.filter((c) => c.isActive).map((c) => (
                                                <option key={c.catId} value={String(c.catId)}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-12 col-sm-6">
                                        <select
                                            className="form-select"
                                            value={editExpenseForm.subCategoryId || ""}
                                            onChange={(e) => setEditExpenseForm((prev) => ({ ...prev, subCategoryId: e.target.value }))}
                                            disabled={!editExpenseForm.categoryId}
                                        >
                                            <option value="">Choose a SubCategory (optional)</option>
                                            {subCategories
                                                .filter((sc) => String(sc.categoryId) === String(editExpenseForm.categoryId))
                                                .map((sc) => (
                                                    <option key={sc.id} value={String(sc.id)}>{sc.name}</option>
                                                ))}
                                        </select>
                                    </div>

                                    <div className="col-12 col-sm-6">
                                        <select
                                            className="form-select"
                                            value={editExpenseForm.placeId || ""}
                                            onChange={(e) => setEditExpenseForm((prev) => ({ ...prev, placeId: e.target.value }))}
                                            disabled={!editExpenseForm.categoryId}
                                        >
                                            <option value="">Choose a Place (optional)</option>
                                            {places.map((p) => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-12 col-sm-6">
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="Amount"
                                            value={editExpenseForm.amount || ""}
                                            onChange={(e) => setEditExpenseForm((prev) => ({ ...prev, amount: e.target.value }))}
                                        />
                                    </div>

                                    <div className="col-12 col-sm-6">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Paid For"
                                            value={editExpenseForm.paidFor || ""}
                                            onChange={(e) => setEditExpenseForm((prev) => ({ ...prev, paidFor: e.target.value }))}
                                        />
                                    </div>

                                    <div className="col-12 col-sm-6">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Item Name"
                                            value={editExpenseForm.itemName || ""}
                                            onChange={(e) => setEditExpenseForm((prev) => ({ ...prev, itemName: e.target.value }))}
                                        />
                                    </div>

                                    <div className="col-12">
                                        <textarea
                                            className="form-control"
                                            placeholder="Note"
                                            value={editExpenseForm.note || ""}
                                            onChange={(e) => setEditExpenseForm((prev) => ({ ...prev, note: e.target.value }))}
                                        />
                                    </div>

                                    <div className="col-12">
                                        <div className="form-check mb-2">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                checked={!!editExpenseForm.isFixed}
                                                onChange={(e) => setEditExpenseForm((prev) => ({ ...prev, isFixed: e.target.checked }))}
                                                id="edit-expense-fixed"
                                            />
                                            <label className="form-check-label" htmlFor="edit-expense-fixed">Fixed Expense</label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setEditExpenseModalOpen(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={() => saveEditExpense(editExpenseForm.id)}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
