import React, { useEffect, useMemo, useState } from "react";
import {
    getAllSavingAsync,
    getExtraMoneyByYear,
    addSavingAsync,
    updateSavingAsync,
    deleteSavingAsync,
} from "../services/api";

/**
 * Savings Page (modern card + table style)
 * - Goals shown as cards with progress
 * - Extra allocations in a soft, rounded table (uses your panel/table classes)
 * - Reuses your modals/handlers to add/edit/delete items and save allocations
 */
const SavingPage = () => {
    const userId = localStorage.getItem("userId");
    const currentYear = new Date().getFullYear();

    // ===== State =====
    const [year, setYear] = useState(String(currentYear));
    const [items, setItems] = useState([]);
    const [extraMoney, setExtraMoney] = useState(0);
    const [allocations, setAllocations] = useState({});
    const [loading, setLoading] = useState(false);

    // Add Modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [mItemName, setMItemName] = useState("");
    const [mType, setMType] = useState("saving");
    const [mTarget, setMTarget] = useState("");
    const [mAmount, setMAmount] = useState("");

    // Edit Modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [eId, setEId] = useState(null);
    const [eItemName, setEItemName] = useState("");
    const [eType, setEType] = useState("saving");
    const [eAmount, setEAmount] = useState("");
    const [eTarget, setETarget] = useState("");

    // Delete Modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteItem, setDeleteItem] = useState(null);

    // ===== Load data =====
    const reload = async (uid, yr) => {
        const [savingData, extraMoneyData] = await Promise.all([
            getAllSavingAsync(uid, yr),
            getExtraMoneyByYear(uid, yr),
        ]);

        setItems(
            (savingData || []).map((x) => ({
                id: x.id,
                name: x.source,
                type: (String(x.type) || "").toLowerCase(), // "saving" | "goal" | "debt"
                balance: Number(x.balance) || 0,
                target: x.target != null ? Number(x.target) : null,
                year: x.year,
            }))
        );

        setExtraMoney(Number(extraMoneyData ?? 0));
        setAllocations({});
    };

    useEffect(() => {
        if (!userId || !year) return;
        setLoading(true);
        reload(userId, year)
            .catch((err) => console.error("Failed to load savings", err))
            .finally(() => setLoading(false));
    }, [userId, year]);

    // ===== Calculations =====
    const totalAllocated = useMemo(
        () => Object.values(allocations).reduce((sum, v) => sum + (Number(v) || 0), 0),
        [allocations]
    );
    const remaining = Math.max(0, extraMoney - totalAllocated);

    const percent = (balance, target) => {
        if (!target || target <= 0) return 0;
        return Math.min(100, Math.round((Number(balance || 0) / Number(target)) * 100));
    };

    const currency = (n) =>
        typeof n === "number" && isFinite(n) ? `$${n.toLocaleString()}` : "—";

    const typeLabel = (t) => (t === "saving" ? "Saving" : t === "debt" ? "Debt" : "Goal");

    const iconByType = (t) => {
        switch (t) {
            case "goal":
                return "bi-bullseye";
            case "debt":
                return "bi-credit-card";
            default:
                return "bi-coin";
        }
    };

    // ===== Handlers =====
    const handleSaveAllAllocations = async () => {
        try {
            const updates = [];
            items.forEach((item) => {
                const addAmount = allocations[item.id] ?? 0;
                if (!addAmount || addAmount === 0) return;
                const newBalance = (item.balance ?? 0) + addAmount;
                updates.push(
                    updateSavingAsync(item.id, {
                        source: item.name,
                        type: item.type,
                        balance: newBalance,
                        target: item.target,
                        year: Number(year),
                        userId,
                    })
                );
            });

            if (updates.length === 0) return;

            setLoading(true);
            await Promise.all(updates);
            setAllocations({});
            await reload(userId, year);
        } catch (err) {
            console.error("Failed to save allocations", err);
        } finally {
            setLoading(false);
        }
    };

    // Add Saving
    const handleAddSaving = async (e) => {
        e.preventDefault();
        if (!mItemName.trim()) return;

        const payload = {
            source: mItemName.trim(),
            type: mType,
            balance: mAmount ? Number(mAmount) : 0,
            target: mTarget ? Number(mTarget) : null,
            year: Number(year),
            userId,
            createdDate: new Date().toISOString(),
        };

        try {
            await addSavingAsync(payload);
            await reload(userId, year);
            setShowAddModal(false);
            setMItemName("");
            setMType("saving");
            setMTarget("");
            setMAmount("");
        } catch (err) {
            console.error("Add saving failed", err);
        }
    };

    // Edit
    const openEdit = (item) => {
        setEId(item.id);
        setEItemName(item.name || "");
        setEType(item.type || "saving");
        setEAmount(item.balance ?? 0);
        setETarget(item.target ?? null);
        setShowEditModal(true);
    };

    const handleUpdateSaving = async (ev) => {
        ev.preventDefault();
        if (!eId) return;

        const payload = {
            source: eItemName.trim(),
            type: eType,
            balance: eAmount !== "" ? Number(eAmount) : null,
            target: eTarget !== "" ? Number(eTarget) : null,
            year: Number(year),
            userId,
        };

        try {
            await updateSavingAsync(eId, payload);
            await reload(userId, year);
            setShowEditModal(false);
            setEId(null);
        } catch (err) {
            console.error("Update failed", err);
        }
    };

    // Delete
    const confirmDelete = (item) => {
        setDeleteItem(item);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteItem) return;
        try {
            setLoading(true);
            await deleteSavingAsync(deleteItem.id, userId);
            setShowDeleteModal(false);
            setDeleteItem(null);
            await reload(userId, year);
        } catch (err) {
            console.error("Delete failed", err);
            setShowDeleteModal(false);
            setDeleteItem(null);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="container py-4">Loading…</div>;
    }

    return (

        <div className="container mt-4" style={{ margin: "auto" }}>
            {/* Page header */}
            <h4 className="page-title">Savings</h4>
            <div className="page-header-line"></div>

            {/* Filter year + Add Goal */}
            <div className="panel">
                <div className="panel-body">
                    <div className="toolbar stack-sm">
                        <div className="mb-0 w-100-sm">
                            <label className="form-label mb-1">Year</label>
                            <select
                                className="control-pill"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                            >
                                {[0, -1, -2, -3].map((n) => {
                                    const y = currentYear + n;
                                    return (
                                        <option key={y} value={String(y)}>
                                            {y}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <button
                            className="btn btn-pill btn-green full-btn-sm ms-md-auto"
                            onClick={() => setShowAddModal(true)}
                            type="button"
                        >
                            <i className="bi bi-plus-lg"></i>
                            <span className="ms-1">Add Goal</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Savings Goals Grid */}
            <div className="panel">
                <div className="panel-header">
                    <h6 className="panel-title mb-0">Savings Goals</h6>
                </div>

                <div className="panel-body">
                    <div className="savings-grid">
                        {items.map((it) => {
                            const p = percent(it.balance, it.target);
                            return (
                                <div key={it.id} className="saving-card">
                                    <div className="card-top">
                                        <div className="icon-bubble">
                                            <i className={`bi ${iconByType(it.type)}`}></i>
                                        </div>

                                        <div className="actions">
                                            <button className="action-btn" title="Edit" onClick={() => openEdit(it)}>
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button className="action-btn" title="Delete" onClick={() => confirmDelete(it)}>
                                                <i className="bi bi-trash text-danger"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <h6 className="title mb-1">{it.name}</h6>

                                    <div className="value mb-2">
                                        {currency(it.balance)}
                                        {it.target != null && (
                                            <span className="text-muted fw-normal"> / {currency(it.target)}</span>
                                        )}
                                    </div>

                                    {it.target ? (
                                        <>
                                            <div className="progress-track mb-1">
                                                <div className="progress-fill" style={{ width: `${p}%` }} />
                                            </div>
                                            <small className="muted">{p}% complete</small>
                                        </>
                                    ) : (
                                        <small className="muted">No target set</small>
                                    )}
                                </div>
                            );
                        })}

                        {items.length === 0 && (
                            <div className="text-muted">No items yet. Add your first goal.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* ================================
        Extra Allocations (Responsive)
       ================================ */}
            <div className="panel" id="allocations-table">
                <div className="panel-header">
                    <h6 className="panel-title mb-0">Extra Allocations</h6>

                    {/* Save button row (responsive) */}
                    <div className="d-flex gap-2 stack-sm">
                        <span className="badge-soft success w-100-sm text-center py-2 fs-6">
                            Extra Money: <strong className="ms-1">{currency(extraMoney)}</strong>
                        </span>

                        <button
                            type="button"
                            className="btn btn-pill btn-blue full-btn-sm"
                            disabled={totalAllocated === 0 || totalAllocated > extraMoney}
                            onClick={handleSaveAllAllocations}
                        >
                            <i className="bi bi-check2"></i>
                            <span className="ms-1">Save Allocations</span>
                        </button>
                    </div>
                </div>

                <div className="panel-body">
                    {/* remaining notice */}
                    <div
                        className={`alert d-flex justify-content-between flex-wrap ${totalAllocated > extraMoney ? "alert-danger" : "alert-warning"
                            }`}
                    >
                        <span className="w-100-sm mb-2">
                            {totalAllocated > extraMoney ? (
                                <>You cannot allocate more than your Extra Money ({currency(extraMoney)})!</>
                            ) : remaining > 0 ? (
                                <>You still have <strong>{currency(remaining)}</strong> unallocated.</>
                            ) : (
                                <>All Extra Money allocated.</>
                            )}
                        </span>

                        <span className="text-muted w-100-sm text-end">
                            Total Allocated: <strong>{currency(totalAllocated)}</strong>
                        </span>
                    </div>

                    {/* ALLOCATIONS TABLE — Mobile → Card */}
                    <div className="table-responsive table-rounded">
                        <table className="table table-soft table-hover align-middle mb-0">
                            <thead>
                                <tr>
                                    <th>Savings Type</th>
                                    <th className="text-start">Current</th>
                                    <th className="text-start">Target</th>
                                    <th className="text-start" style={{ width: 140 }}>
                                        Add Amount ($)
                                    </th>
                                    <th className="text-center" style={{ width: 120 }}>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => {
                                    const addVal = allocations[item.id] ?? 0;
                                    return (
                                        <tr key={item.id}>
                                            {/* Savings Type */}
                                            <td data-label="Savings Type">
                                                <div className="saving-type">
                                                    <i className={`bi ${iconByType(item.type)} text-primary`}></i>
                                                    <span className="name">{item.name}</span>
                                                    <span className="type text-muted">({typeLabel(item.type)})</span>
                                                </div>
                                            </td>

                                            {/* Current */}
                                            <td data-label="Current" className="text-start">
                                                {currency(item.balance ?? 0)}
                                            </td>

                                            {/* Target */}
                                            <td data-label="Target" className="text-start">
                                                {item.target != null ? currency(item.target) : "—"}
                                            </td>

                                            {/* Add Amount */}
                                            <td data-label="Add Amount">
                                                <div className="amount-input">
                                                    <input
                                                        type="number"
                                                        className="form-control form-control-sm text-center"
                                                        value={addVal}
                                                        onChange={(e) =>
                                                            setAllocations((prev) => ({
                                                                ...prev,
                                                                [item.id]: Number(e.target.value) || 0,
                                                            }))
                                                        }
                                                        min="0"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td data-label="Actions" data-actions="true">
                                                <div className="cell-actions">
                                                    <button
                                                        className="btn btn-ghost btn-sm me-2"
                                                        title="Edit"
                                                        onClick={() => openEdit(item)}
                                                    >
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        title="Delete"
                                                        onClick={() => confirmDelete(item)}
                                                    >
                                                        <i className="bi bi-trash text-danger"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {items.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center py-4 text-muted">
                                            No allocations available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>


            {/* ===== Modals ===== */}

            {/* Add Goal */}
            {showAddModal && (
                <>
                    <div className="modal fade show" style={{ display: "block" }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <form onSubmit={handleAddSaving}>
                                    <div className="modal-header">
                                        <h5 className="modal-title">Add Goal</h5>
                                        <button
                                            type="button"
                                            className="btn-close"
                                            onClick={() => setShowAddModal(false)}
                                        />
                                    </div>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label className="form-label">Name</label>
                                            <input
                                                className="form-control"
                                                value={mItemName}
                                                onChange={(e) => setMItemName(e.target.value)}
                                                required
                                                placeholder="e.g., Emergency Fund"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Type</label>
                                            <select
                                                className="form-select"
                                                value={mType}
                                                onChange={(e) => setMType(e.target.value)}
                                            >
                                                <option value="saving">Saving</option>
                                                <option value="goal">Goal</option>
                                                <option value="debt">Debt</option>
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Target (optional)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={mTarget}
                                                onChange={(e) => setMTarget(e.target.value)}
                                                placeholder="e.g., 10000"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Initial Amount (optional)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={mAmount}
                                                onChange={(e) => setMAmount(e.target.value)}
                                                placeholder="e.g., 500"
                                            />
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-light"
                                            onClick={() => setShowAddModal(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-primary">
                                            Add Goal
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" />
                </>
            )}

            {/* Edit Goal */}
            {showEditModal && (
                <>
                    <div className="modal fade show" style={{ display: "block" }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <form onSubmit={handleUpdateSaving}>
                                    <div className="modal-header">
                                        <h5 className="modal-title">Edit Goal</h5>
                                        <button
                                            type="button"
                                            className="btn-close"
                                            onClick={() => setShowEditModal(false)}
                                        />
                                    </div>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label className="form-label">Name</label>
                                            <input
                                                className="form-control"
                                                value={eItemName}
                                                onChange={(e) => setEItemName(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Type</label>
                                            <select
                                                className="form-select"
                                                value={eType}
                                                onChange={(e) => setEType(e.target.value)}
                                            >
                                                <option value="saving">Saving</option>
                                                <option value="goal">Goal</option>
                                                <option value="debt">Debt</option>
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Target (optional)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={eTarget ?? ""}
                                                onChange={(e) => setETarget(e.target.value)}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Balance</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={eAmount ?? ""}
                                                onChange={(e) => setEAmount(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-light"
                                            onClick={() => setShowEditModal(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-primary">
                                            Save
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" />
                </>
            )}

            {/* Delete */}
            {showDeleteModal && (
                <>
                    <div className="modal fade show" style={{ display: "block" }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Confirm Delete</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowDeleteModal(false)}
                                    />
                                </div>
                                <div className="modal-body">
                                    Are you sure you want to delete{" "}
                                    <strong>{deleteItem?.name}</strong>? This cannot be undone.
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-light"
                                        onClick={() => setShowDeleteModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={handleConfirmDelete}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" />
                </>
            )}
        </div>
    );
};

export default SavingPage;