import React, { useEffect, useMemo, useState } from "react";
import {
  getAllSavingAsync,
  getExtraMoneyByYear,
  addSavingAsync,
  updateSavingAsync,
  deleteSavingAsync,
} from "../services/api"; // adjust path if needed

const SavingPage = () => {
  const userId = localStorage.getItem("userId"); // must be a GUID string
  const currentYear = new Date().getFullYear();

  // ===============================
  // State
  // ===============================
  const [year, setYear] = useState(String(currentYear));
  const [items, setItems] = useState([]);
  const [extraMoney, setExtraMoney] = useState(0);
  const [allocations, setAllocations] = useState({});
  const [loading, setLoading] = useState(false);

  // Add Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [mItemName, setMItemName] = useState("");
  const [mType, setMType] = useState("saving");
  const [mBalance, setMBalance] = useState("");
  const [mTarget, setMTarget] = useState("");
  const [mAmount, setMAmount] = useState("");

  // Edit Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [eId, setEId] = useState(null);
  const [eItemName, setEItemName] = useState("");
  const [eType, setEType] = useState("saving");
  const [eBalance, setEBalance] = useState("");
  const [eTarget, setETarget] = useState("");
  const [eAmount, setEAmount] = useState("");

  // Delete Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  // ===============================
  // Load data
  // ===============================
  const reload = async (uid, yr) => {
    const [savingData, extraMoneyData] = await Promise.all([
      getAllSavingAsync(uid, yr),
      getExtraMoneyByYear(uid, yr),
    ]);

    setItems(
      savingData.map((x) => ({
        id: x.id,
        name: x.source,
        type: (String(x.type) || "").toLowerCase(),
        balance: Number(x.balance) || 0,
        target: x.target,
        year: x.year,
      })),
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

  // ===============================
  // Calculations
  // ===============================
  const totalAllocated = useMemo(
    () =>
      Object.values(allocations).reduce((sum, v) => sum + (Number(v) || 0), 0),
    [allocations],
  );
  const remaining = Math.max(0, extraMoney - totalAllocated);

  // ===============================
  // Handlers
  // ===============================

  // Save all allocations
  const handleSaveAllAllocations = async () => {
    try {
      const updates = [];

      items.forEach((item) => {
        const addedAmount = allocations[item.id] ?? 0;
        if (addedAmount === 0) return;

        const newBalance = (item.balance ?? 0) + addedAmount;

        updates.push(
          updateSavingAsync(item.id, {
            source: item.name,
            type: item.type,
            balance: newBalance,
            target: item.target,
            year: Number(year),
            userId,
          }),
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
      setMBalance("");
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
    setEAmount(item.balance ?? 0); // <-- set eAmount here
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

  // Delete using modal
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

  // ===============================
  // Utils
  // ===============================
  const currency = (n) =>
    typeof n === "number" && isFinite(n) ? `$${n.toLocaleString()}` : "—";

  const typeLabel = (t) =>
    t === "saving" ? "Saving" : t === "debt" ? "Debt" : "Goal";

  // ===============================
  // Render
  // ===============================
  if (loading) return <div className="p-3">Loading…</div>;

  return (
    <div className="container py-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>
          <i className="bi bi-piggy-bank-fill me-2" />
          Saving
        </h2>
        <button
          className="btn btn-outline-secondary"
          onClick={() => setShowAddModal(true)}
        >
          <i className="bi bi-plus-lg me-1" />
          Add Item
        </button>
      </div>

      {/* Year */}
      <div className="mb-3">
        <label className="form-label">Year</label>
        <select
          className="form-select"
          style={{ width: 150 }}
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

      {/* Extra Money */}
      <div className="mb-3">
        <span className="badge bg-success fs-6">
          Extra Money: <strong>${extraMoney}</strong>
        </span>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Item</th>
              <th>Type</th>
              <th className="text-center">Current / Balance</th>
              <th className="text-center">Left to Reach Target</th>
              <th className="text-center">Target</th>
              <th className="text-center">Add Amount ($)</th>
              <th style={{ width: 120 }} className="text-center">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => {
              const value = allocations[item.id] ?? 0;
              const currentCol = currency(item.balance ?? 0);
              const targetCol =
                item.target != null ? currency(item.target) : "—";
              const remainingToTarget =
                item.target != null
                  ? Math.max(0, (item.target ?? 0) - (item.balance ?? 0))
                  : null;

              return (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td className="text-start">{typeLabel(item.type)}</td>
                  <td className="text-center">{currentCol}</td>
                  <td className="text-center">{remainingToTarget}</td>
                  <td className="text-center">{targetCol}</td>

                  <td className="text-center" style={{ width: 100 }}>
                    <input
                      type="number"
                      className="form-control form-control-sm text-center inoutAmounts"
                      value={value}
                      onChange={(e) =>
                        setAllocations((prev) => ({
                          ...prev,
                          [item.id]: Number(e.target.value) || 0,
                        }))
                      }
                      style={{ maxWidth: 80, margin: "0 auto" }} // small and centered
                    />
                  </td>

                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => openEdit(item)}
                      title="Edit"
                    >
                      <i className="bi bi-pencil-square" />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => confirmDelete(item)}
                      title="Delete"
                    >
                      <i className="bi bi-trash" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Save Allocations */}
      <div className="d-flex justify-content-between align-items-center alert alert-warning">
        <span>
          {totalAllocated > extraMoney ? (
            <>You cannot allocate more than your Extra Money (${extraMoney})!</>
          ) : remaining > 0 ? (
            <>
              You still have <strong>${remaining}</strong> unallocated.
            </>
          ) : (
            <>All Extra Money allocated.</>
          )}
        </span>

        <button
          className="btn btn-success"
          onClick={handleSaveAllAllocations}
          disabled={totalAllocated === 0 || totalAllocated > extraMoney}
        >
          Save All Allocations
        </button>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <>
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <form onSubmit={handleAddSaving}>
                  <div className="modal-header">
                    <h5 className="modal-title">Add Item</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowAddModal(false)}
                    />
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Item Name</label>
                      <input
                        className="form-control"
                        value={mItemName}
                        onChange={(e) => setMItemName(e.target.value)}
                        required
                        placeholder="e.g., TFSA, Europe Trip"
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
                      <label className="form-label">Target</label>
                      <input
                        type="number"
                        className="form-control"
                        value={mTarget}
                        onChange={(e) => setMTarget(e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Amount</label>
                      <input
                        type="number"
                        className="form-control"
                        value={mAmount}
                        onChange={(e) => setMAmount(e.target.value)}
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
                      Add
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <>
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <form onSubmit={handleUpdateSaving}>
                  <div className="modal-header">
                    <h5 className="modal-title">Edit Item</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowEditModal(false)}
                    />
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Item Name</label>
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
                      <label className="form-label">Target</label>
                      <input
                        type="number"
                        className="form-control"
                        value={eTarget}
                        onChange={(e) => setETarget(e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Balance</label>
                      <input
                        type="number"
                        className="form-control"
                        value={eAmount}
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

      {/* Delete Modal */}
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
