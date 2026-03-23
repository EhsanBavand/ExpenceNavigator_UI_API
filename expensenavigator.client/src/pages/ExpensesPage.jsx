import React, { useState, useEffect, useMemo } from "react";
import { Button, Form } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
import "../CSS/Expenses.css";

import { ExpenseForm } from "../components/Expenses/ExpenseForm";
import { CategoryForm } from "../components/Expenses/CategoryForm";
import { SubCategoryForm } from "../components/Expenses/SubCategoryForm";
import { PlaceForm } from "../components/Expenses/PlaceForm";

import { ExpenseTable } from "../components/Expenses/ExpenseTable";
import { CategoryTable } from "../components/Expenses/CategoryTable";
import { SubCategoryTable } from "../components/Expenses/SubCategoryTable";
import { PlaceTable } from "../components/Expenses/PlaceTable";
import { EditExpenseModal } from "../components/Expenses/EditExpenseModal";
import { EditCategoryModal } from "../components/Expenses/EditCategoryModal";

// ===== API SERVICES =====
import {
    getCategories,
    getSubCategories,
    getPlaces,
    getExpenses,
    createCategory,
    createSubCategory,
    createPlace,
    createExpense,
    updateExpense,
    updateCategory,   // ← ADD THIS
    deleteCategory,
    deleteSubCategory,
    deletePlace,
    deleteExpense,
    getDashboardSummary,
} from "../services/api";

const currency = (v) =>
    new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
    }).format(Number(v || 0));
export default function ExpensesPage() {
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [places, setPlaces] = useState([]);
    const [expenses, setExpenses] = useState([]);

    const [categoryName, setCategoryName] = useState("");
    const [categoryBudget, setCategoryBudget] = useState("");

    const [subCategoryName, setSubCategoryName] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");

    const [placeName, setPlaceName] = useState("");

    const [expenseForm, setExpenseForm] = useState({
        date: "",
        categoryId: "",
        subCategoryId: "",
        placeId: "",
        amount: "",
        paidFor: "",
        itemName: "",
        note: "",
        isFixed: false,
    });

    const [userId, setUserId] = useState(null);
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);

    const [uiMonth, setUiMonth] = useState(currentMonth);
    const [uiYear, setUiYear] = useState(currentYear);

    const [formTab, setFormTab] = useState("category");
    const [tableTab, setTableTab] = useState("category");
    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalBudget: 0,
        totalExpenses: 0,
        remainingIncome: 0,
        remainingBudget: 0,
    });

    // ===== Expense MODAL =====
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({});

    // Category Modal
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [categoryEditForm, setCategoryEditForm] = useState({});

    // ===== LOAD USER =====
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const decoded = jwtDecode(token);
            const id =
                decoded?.sub ||
                decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
            setUserId(id);
        } catch { /* empty */ }
    }, []);

    // ===== FETCH DATA =====
    useEffect(() => {
        if (!userId) return;
        fetchAll();
    }, [userId, selectedMonth, selectedYear]);

    const fetchAll = async () => {
        try {
            const [cat, sub, plc, exp] = await Promise.all([
                getCategories(userId, selectedMonth, selectedYear),
                getSubCategories(userId),
                getPlaces(userId),
                getExpenses(userId, selectedMonth, selectedYear),
            ]);

            setCategories(cat);
            setSubCategories(sub);
            setPlaces(plc);
            setExpenses(exp);

            const dash = await getDashboardSummary(userId, selectedMonth, selectedYear);
            setSummary(dash);

        } catch (err) {
            console.error(err);
        }
    };

    // ===== MAP HELPERS =====
    const categoryMap = useMemo(() => {
        const map = {};
        categories.forEach((c) => (map[c.catId] = c.name));
        return map;
    }, [categories]);

    const subCategoryMap = useMemo(() => {
        const map = {};
        subCategories.forEach((s) => (map[s.id] = s.name));
        return map;
    }, [subCategories]);

    const placeMap = useMemo(() => {
        const map = {};
        places.forEach((p) => (map[p.id] = p.name));
        return map;
    }, [places]);

    // ===== HANDLERS =====
    const handleAddCategory = async (e) => {
        e.preventDefault();
        await createCategory(userId, categoryName, parseFloat(categoryBudget) || 0, true);
        setCategoryName("");
        setCategoryBudget("");
        fetchAll();
    };

    const handleAddSubCategory = async (e) => {
        e.preventDefault();
        await createSubCategory({
            name: subCategoryName,
            categoryId: selectedCategory,
            userId,
            isRecurring: true,
        });
        setSubCategoryName("");
        setSelectedCategory("");
        fetchAll();
    };

    const handleAddPlace = async (e) => {
        e.preventDefault();
        await createPlace({
            name: placeName,
            userId,
            isRecurring: true,
        });

        setPlaceName("");
        fetchAll();
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();

        const [y, m] = expenseForm.date.split("-");

        await createExpense({
            userId,
            date: expenseForm.date,
            categoryId: expenseForm.categoryId || null,
            subCategoryId: expenseForm.subCategoryId || null,
            placeId: expenseForm.placeId || null,
            amount: Number(expenseForm.amount),
            paidFor: expenseForm.paidFor,
            itemName: expenseForm.itemName,
            note: expenseForm.note,
            isFixed: expenseForm.isFixed,
            year: Number(y),
            month: Number(m),
        });

        setExpenseForm({
            date: "",
            categoryId: "",
            subCategoryId: "",
            placeId: "",
            amount: "",
            paidFor: "",
            itemName: "",
            note: "",
            isFixed: false,
        });

        fetchAll();
    };

    const handleExpenseInput = (e) => {
        const { name, type, checked, value } = e.target;

        setExpenseForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleDelete = async (id, type) => {
        if (type === "expense") await deleteExpense(id);
        if (type === "category") await deleteCategory(id, userId, selectedMonth, selectedYear);
        if (type === "subCategory") await deleteSubCategory(id);
        if (type === "place") await deletePlace(id);
        fetchAll();
    };

    // ===== EDIT EXPENSE =====
    const handleEditChange = (field, value) => {
        setEditForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleEditExpense = (expense) => {
        setEditForm({
            id: expense.id,
            date: expense.date?.split("T")[0],
            categoryId: expense.categoryId || "",
            subCategoryId: expense.subCategoryId || "",
            placeId: expense.placeId || "",
            amount: expense.amount,
            paidFor: expense.paidFor,
            itemName: expense.itemName,
            note: expense.note,
            isFixed: expense.isFixed,
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = async () => {
        const [y, m] = editForm.date.split("-");
        await updateExpense(editForm.id, {
            userId,
            date: editForm.date,
            categoryId: editForm.categoryId || null,
            subCategoryId: editForm.subCategoryId || null,
            placeId: editForm.placeId || null,
            amount: Number(editForm.amount),
            paidFor: editForm.paidFor,
            itemName: editForm.itemName,
            note: editForm.note,
            isFixed: editForm.isFixed,
            year: Number(y),
            month: Number(m),
        });
        setShowEditModal(false);
        fetchAll();
    };

    // Category Modal
    const handleEditCategory = (category) => {

        setCategoryEditForm({
            catId: category.catId,
            name: category.name,
            budget: category.budget,
            isActive: category.isActive,
            userId
        });

        setShowCategoryModal(true);
    };

    const handleCategoryChange = (field, value) => {

        setCategoryEditForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCategorySubmit = async () => {

        await updateCategory({
            ...categoryEditForm,
            userId,
            month: selectedMonth,
            year: selectedYear
        });

        setShowCategoryModal(false);

        fetchAll();
    };

    return (
        <div className="container mt-4">
            <h4 className="page-title">Expenses</h4>
            <div className="page-header-line"></div>

            {/* ===== FILTER ===== */}
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
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                    <option key={m} value={m}>{m}</option>
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
                                {[selectedYear, selectedYear - 1, selectedYear - 2].map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Button
                            className="btn-pill btn-green full-btn-sm"
                            onClick={() => {
                                setSelectedMonth(uiMonth);
                                setSelectedYear(uiYear);
                            }}
                        >
                            <i className="bi bi-search"></i>
                            <span className="ms-1">Search</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* KPI CARDS */}
            <div className="panel">
                <div className="panel-body">
                    <div className="kpi-grid mb-3">
                        <div className="kpi-card kpi--income">
                            <div className="kpi-title">Total Income</div>
                            <div className="kpi-value">{currency(summary.totalIncome)}</div>
                            <div className="kpi-sub">This month</div>
                            <div className="kpi-icon">
                                <i className="bi bi-wallet2"></i>
                            </div>
                        </div>

                        <div className="kpi-card kpi--budget">
                            <div className="kpi-title">Total Budget</div>
                            <div className="kpi-value">{currency(summary.totalBudget)}</div>
                            <div className="kpi-sub">This month</div>
                            <div className="kpi-icon">
                                <i className="bi bi-clipboard2-data"></i>
                            </div>
                        </div>

                        <div className="kpi-card kpi--remaining">
                            <div className="kpi-title">Remaining Budget</div>
                            <div className="kpi-value">{currency(summary.remainingBudget)}</div>
                            <div className="kpi-sub">This month</div>
                            <div className="kpi-icon">
                                <i className="bi bi-piggy-bank"></i>
                            </div>
                        </div>

                        <div className="kpi-card kpi--expense">
                            <div className="kpi-title">Total Expense</div>
                            <div className="kpi-value">{currency(summary.totalExpenses)}</div>
                            <div className="kpi-sub">This month</div>
                            <div className="kpi-icon">
                                <i className="bi bi-receipt"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== MANAGE TABS ===== */}
            <div className="panel">
                <div className="panel-header">
                    <h6 className="panel-header-title">Manage</h6>
                </div>

                <div className="panel-body">
                    <div className="d-flex flex-wrap gap-2 mb-3">
                        {["category", "subCategory", "place", "expense"].map((t) => (
                            <Button
                                key={t}
                                className={formTab === t ? "btn-pill btn-green" : "btn-pill btn-ghost"}
                                onClick={() => setFormTab(t)}
                            >
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </Button>
                        ))}
                    </div>

                    {formTab === "category" && (
                        <CategoryForm
                            name={categoryName}
                            budget={categoryBudget}
                            onName={(e) => setCategoryName(e.target.value)}
                            onBudget={(e) => setCategoryBudget(e.target.value)}
                            onSubmit={handleAddCategory}
                        />
                    )}

                    {formTab === "subCategory" && (
                        <SubCategoryForm
                            categories={categories}
                            selectedCategory={selectedCategory}
                            subCategoryName={subCategoryName}
                            onCategory={(e) => setSelectedCategory(e.target.value)}
                            onName={(e) => setSubCategoryName(e.target.value)}
                            onSubmit={handleAddSubCategory}
                        />
                    )}

                    {formTab === "place" && (
                        <PlaceForm
                            placeName={placeName}
                            onName={(e) => setPlaceName(e.target.value)}
                            onSubmit={handleAddPlace}
                        />
                    )}

                    {formTab === "expense" && (
                        <ExpenseForm
                            form={expenseForm}
                            categories={categories}
                            subCategories={subCategories}
                            places={places}
                            onChange={handleExpenseInput}
                            onSubmit={handleAddExpense}
                        />
                    )}
                </div>
            </div>

            {/* ===== OVERVIEW TABLES ===== */}
            <div className="panel">
                <div className="panel-header">
                    <h6 className="panel-header-title">Overview & Tables</h6>
                </div>

                <div className="panel-body">
                    <div className="d-flex flex-wrap gap-2 mb-3">
                        {["category", "subCategory", "place", "expense"].map((t) => (
                            <Button
                                key={t}
                                className={tableTab === t ? "btn-pill btn-green" : "btn-pill btn-ghost"}
                                onClick={() => setTableTab(t)}
                            >
                                {t.charAt(0).toUpperCase() + t.slice(1)} Table
                            </Button>
                        ))}
                    </div>

                    {tableTab === "category" && (
                        <CategoryTable
                            categories={categories}
                            onEdit={handleEditCategory}
                            onDelete={(id) => handleDelete(id, "category")}
                        />
                    )}

                    {tableTab === "subCategory" && (
                        <SubCategoryTable
                            subCategories={subCategories}
                            categories={categories}
                            onDelete={(id) => handleDelete(id, "subCategory")}
                        />
                    )}

                    {tableTab === "place" && (
                        <PlaceTable places={places} onDelete={(id) => handleDelete(id, "place")} />
                    )}

                    {tableTab === "expense" && (
                        <ExpenseTable
                            expenses={expenses}
                            categoryMap={categoryMap}
                            subCategoryMap={subCategoryMap}
                            placeMap={placeMap}
                            currency={currency}
                            onEdit={handleEditExpense}
                            onDelete={(id) => handleDelete(id, "expense")}
                        />
                    )}

                    <EditExpenseModal
                        show={showEditModal}
                        onClose={() => setShowEditModal(false)}
                        form={editForm}
                        categories={categories}
                        subCategories={subCategories}
                        places={places}
                        onChange={handleEditChange}
                        onSubmit={handleEditSubmit}
                    />

                    <EditCategoryModal
                        show={showCategoryModal}
                        onClose={() => setShowCategoryModal(false)}
                        form={categoryEditForm}
                        onChange={handleCategoryChange}
                        onSubmit={handleCategorySubmit}
                    />
                </div>
            </div>
        </div>
    );
}