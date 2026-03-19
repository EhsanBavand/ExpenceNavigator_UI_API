import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
import {
    getIncomesByMonth,
    addIncome,
    updateIncome,
    deleteIncome,
    addSource,
    getSources,
    updateSource,
    deleteSource,
    copyIncomesByRange,
} from "../services/api";

/** Helpers */
const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const currency = (v) =>
    new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD", // change to "CAD" if preferred
        maximumFractionDigits: 2,
    }).format(Number(v || 0));

const prettyDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const IncomePage = () => {
    // Incomes
    const [incomeList, setIncomeList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingIncome, setEditingIncome] = useState(null);

    // Errors
    const [error, setError] = useState(null);

    // Income form
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        owner: "",
        incomeSourceId: "",
        amount: "",
        date: "",
        frequency: "",
        month: "",
        year: new Date().getFullYear(),
        isRecurring: false,
        isEstimated: false,
        description: "",
    });

    // Sources
    const [sourceList, setSourceList] = useState([]);
    const [loadingSources, setLoadingSources] = useState(false);
    const [showSourceModal, setShowSourceModal] = useState(false);
    const [sourceFormData, setSourceFormData] = useState({ id: null, sourceType: "", description: "" });

    // Delete income modal
    const [showDeleteIncomeModal, setShowDeleteIncomeModal] = useState(false);
    const [incomeToDelete, setIncomeToDelete] = useState(null);

    // Delete source modal
    const [showSourceDeleteModal, setShowSourceDeleteModal] = useState(false);
    const [sourceToDelete, setSourceToDelete] = useState(null);

    // Copy range
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const now = new Date();
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
    const [generateRange, setGenerateRange] = useState({
        fromMonth: selectedMonth, fromYear: selectedYear,
        toMonth: selectedMonth, toYear: selectedYear,
    });
    const [sourceMonth, setSourceMonth] = useState(selectedMonth);
    const [sourceYear, setSourceYear] = useState(selectedYear);

    // Auth
    const [userId, setUserId] = useState(null);

    const totalIncome = incomeList.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const hasDataToCopy = incomeList.length > 0;

    /** Effects */
    useEffect(() => {
        setGenerateRange({
            fromMonth: selectedMonth, fromYear: selectedYear,
            toMonth: selectedMonth, toYear: selectedYear,
        });
        setSourceMonth(selectedMonth);
        setSourceYear(selectedYear);
    }, [selectedMonth, selectedYear]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return setError("User is not authenticated");
        try {
            const decoded = jwtDecode(token);
            const id =
                decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
                decoded.sub ||
                null;
            if (!id) setError("User is not authenticated");
            else setUserId(id);
        } catch {
            setError("Invalid token");
        }
    }, []);

    useEffect(() => {
        if (!userId) return;
        (async () => {
            setLoading(true);
            try {
                const r = await getIncomesByMonth(userId, selectedMonth, selectedYear);
                setIncomeList(r.data);
                console.log(r.data)
                setError(null);
            } catch (e) {
                console.error(e);
                setError("Failed to load incomes.");
            } finally {
                setLoading(false);
            }
        })();
    }, [userId]);

    useEffect(() => {
        if (!userId) return;
        (async () => {
            setLoadingSources(true);
            try {
                const r = await getSources(userId);
                setSourceList(r.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingSources(false);
            }
        })();
    }, [userId]);

    useEffect(() => {
        if (!error) return;
        const t = setTimeout(() => setError(null), 10000);
        return () => clearTimeout(t);
    }, [error]);

    /** Handlers */
    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((p) => ({
            ...p,
            [name]:
                type === "checkbox"
                    ? checked
                    : name === "month" || name === "year"
                        ? Number(value)
                        : value,
        }));
    };

    const handleShowAddModal = () => {
        setEditingIncome(null);
        setFormData({
            owner: "",
            incomeSourceId: "",
            amount: "",
            date: "",
            frequency: "",
            month: "",
            year: new Date().getFullYear(),
            isRecurring: false,
            isEstimated: false,
            description: "",
        });
        setShowModal(true);
    };

    const handleShowEditModal = (income) => {
        setEditingIncome(income);
        setFormData({
            id: income.id,
            userId: income.userId,
            owner: income.owner,
            incomeSourceId: income.incomeSourceId,
            amount: income.amount,
            date: income.date.split("T")[0],
            month: income.month,
            year: income.year,
            isRecurring: income.isRecurring,
            isEstimated: income.isEstimated,
            frequency: income.frequency || "None",
            description: income.description || "",
            createdBy: income.createdBy,
            createdDate: income.createdDate,
            modifiedDate: income.modifiedDate,
        });
        setShowModal(true);
    };

    const handleSaveIncome = async (e) => {
        e.preventDefault();
        if (!userId) return setError("User is not authenticated");

        const month = Number(formData.month);
        const year = Number(formData.year);
        if (!Number.isInteger(month) || month < 1 || month > 12) return setError("Invalid month selected");
        if (!Number.isInteger(year) || year < 2000) return setError("Invalid year");

        const payload = {
            id: formData.id,
            userId,
            owner: formData.owner || userId,
            incomeSourceId: formData.incomeSourceId,
            amount: Number(formData.amount),
            date: formData.date,
            month,
            year,
            isRecurring: formData.isRecurring,
            isEstimated: formData.isEstimated,
            frequency: formData.frequency,
            description: formData.description || "",
            createdBy: editingIncome?.createdBy || userId,
            createdDate: editingIncome?.createdDate || new Date().toISOString(),
            modifiedDate: new Date().toISOString(),
        };

        try {
            if (editingIncome) await updateIncome(payload, editingIncome.id);
            else await addIncome(payload);

            setSelectedMonth(formData.month);
            setSelectedYear(formData.year);
            const refresh = await getIncomesByMonth(userId, formData.month, formData.year);
            setIncomeList(refresh.data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Failed to save income.");
        } finally {
            setShowModal(false);
        }
    };

    const handleSearchByMonth = async () => {
        if (!userId) return setError("User is not authenticated");
        try {
            setLoading(true);
            const r = await getIncomesByMonth(userId, selectedMonth, selectedYear);
            setIncomeList(r.data);
            setError(null);
        } catch (e) {
            console.error(e);
            setError("Failed to load incomes.");
        } finally {
            setLoading(false);
        }
    };

    // Income delete
    const confirmDeleteIncome = (income) => {
        setIncomeToDelete(income);
        setShowDeleteIncomeModal(true);
    };
    const handleDeleteIncomeConfirmed = async () => {
        if (!incomeToDelete) return;
        try {
            await deleteIncome(incomeToDelete.id);
            setIncomeList((prev) => prev.filter((i) => i.id !== incomeToDelete.id));
        } catch (e) {
            console.error(e);
            setError("Failed to delete income.");
        } finally {
            setShowDeleteIncomeModal(false);
            setIncomeToDelete(null);
        }
    };

    // Source CRUD
    const handleShowAddSourceModal = () => {
        setSourceFormData({ id: null, sourceType: "", description: "" });
        setShowSourceModal(true);
    };

    const handleSaveSource = async () => {
        if (!userId) return setError("User is not authenticated");
        const nowISO = new Date().toISOString();
        const payload = {
            Name: sourceFormData.sourceType,
            Description: sourceFormData.description,
            UserId: userId,
            CreatedDate: nowISO,
            ModifiedDate: nowISO,
        };
        try {
            if (sourceFormData.id) await updateSource(sourceFormData.id, payload);
            else await addSource(payload);

            const r = await getSources(userId);
            setSourceList(r.data);
            setShowSourceModal(false);
            setSourceFormData({ id: null, sourceType: "", description: "" });

            // keep table labels in sync
            setIncomeList((prev) =>
                prev.map((income) => ({
                    ...income,
                    sourceType: r.data.find((s) => s.id === income.incomeSourceId)?.name || income.sourceType,
                }))
            );
        } catch (e) {
            console.error(e);
            setError("Failed to save source.");
        }
    };

    const handleEditSource = (source) => {
        setSourceFormData({ id: source.id, sourceType: source.name, description: source.description });
        setShowSourceModal(true);
    };

    const confirmDeleteSource = (source) => {
        setSourceToDelete(source);
        setShowSourceDeleteModal(true);
    };

    const handleDeleteConfirmed = async () => {
        if (!sourceToDelete) return;
        try {
            const success = await deleteSource(sourceToDelete.id);
            if (success) {
                setSourceList((prev) => prev.filter((s) => s.id !== sourceToDelete.id));
            }
        } catch (e) {
            console.error("Delete failed:", e);
        } finally {
            setShowSourceDeleteModal(false);
            setSourceToDelete(null);
        }
    };

    /** Render */
    return (
        <div className="container-fluid px-3 px-md-4 mt-3">
            {/* Page header with very light underline */}
            <h4 className="page-title">Income</h4>
            <div className="page-header-line"></div>

            {/* Filter toolbar */}
            <div className="panel">
                <div className="panel-body">
                    {/* vertical stack on phones */}
                    <div className="toolbar stack-sm">
                        <Form.Group className="mb-0 w-100-sm">
                            <Form.Label className="form-label mb-1">Month</Form.Label>
                            <Form.Select
                                className="control-pill"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            >
                                {monthNames.map((m, i) => (
                                    <option key={i} value={i + 1}>{m}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-0 w-100-sm">
                            <Form.Label className="form-label mb-1">Year</Form.Label>
                            <Form.Select
                                className="control-pill"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                            >
                                {[...Array(5)].map((_, i) => {
                                    const y = now.getFullYear() - i;
                                    return <option key={y} value={y}>{y}</option>;
                                })}
                            </Form.Select>
                        </Form.Group>

                        {/* full width on phones */}
                        <Button className="btn-pill btn-green full-btn-sm" onClick={handleSearchByMonth}>
                            <i className="bi bi-search"></i>
                            <span className="ms-1">Search</span>
                        </Button>
                    </div>
                </div>
            </div>

            {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Income Sources */}
            <div className="panel mb-3">
                <div className="panel-header">
                    <h6 className="panel-header-title">Income Sources</h6>
                    <Button className="btn-pill btn-green" onClick={handleShowAddSourceModal}>
                        <i className="bi bi-plus-lg"></i>
                        <span className="ms-1">Add Source</span>
                    </Button>
                </div>
                <div className="panel-body">
                    {loadingSources ? (
                        <Spinner animation="border" />
                    ) : (
                        <div className="table-responsive table-rounded">
                            <table className="table table-soft table-hover align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th>Source</th>
                                        <th>Description</th>
                                        <th style={{ width: 120 }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sourceList.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="text-center py-4">No sources found</td>
                                        </tr>
                                    ) : (
                                        sourceList.map((s) => (
                                            <tr key={s.id}>
                                                <td data-label="Source" className="fw-semibold d-flex align-items-center gap-2">
                                                    <i className="bi bi-check2-square text-success"></i>
                                                    {s.name}
                                                </td>
                                                <td data-label="Description" className="text-muted">{s.description}</td>
                                                <td data-label="Actions" data-actions="true">
                                                    {/* keep buttons together on phones */}
                                                    <div className="cell-actions">
                                                        <Button
                                                            size="sm"
                                                            className="btn-ghost me-2"
                                                            onClick={() => handleEditSource(s)}
                                                            aria-label="Edit source"
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            className="btn-ghost"
                                                            onClick={() => confirmDeleteSource(s)}
                                                            aria-label="Delete source"
                                                        >
                                                            <i className="bi bi-trash text-danger"></i>
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Income Records */}
            <div className="panel">
                <div className="panel-header">
                    <h6 className="panel-header-title">Income Records</h6>
                    <div className="d-flex gap-2 stack-sm">
                        <Button className="btn-pill btn-blue full-btn-sm" onClick={() => setShowGenerateModal(true)}>
                            <i className="bi bi-calendar-range"></i>
                            <span className="ms-1">Copy Incomes to Next Month</span>
                        </Button>
                        <Button className="btn-pill btn-green full-btn-sm" onClick={handleShowAddModal}>
                            <i className="bi bi-plus-lg"></i>
                            <span className="ms-1">Add Income</span>
                        </Button>
                    </div>
                </div>
                <div className="panel-body">
                    {loading ? (
                        <Spinner animation="border" />
                    ) : (
                        <div className="table-responsive table-rounded">
                            <table className="table table-soft table-hover align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th>Source</th>
                                        <th>Owner</th>
                                        <th>Amount</th>
                                        <th>Date</th>
                                        <th>Note</th>
                                        <th style={{ width: 120 }}>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {incomeList.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center py-4">No incomes found</td>
                                        </tr>
                                    ) : (
                                        incomeList.map((i) => (
                                            <tr key={i.id}>
                                                <td data-label="Source" className="fw-semibold d-flex align-items-center gap-2">
                                                    {i.isRecurring && <span className="badge-soft success">Monthly</span>}
                                                    {i.sourceType}
                                                </td>
                                                <td data-label="Owner" className="fw-bold text-success">{i.owner}</td>
                                                <td data-label="Amount" className="fw-bold text-success">{currency(i.amount)}</td>
                                                <td data-label="Date">{prettyDate(i.date)}</td>
                                                <td data-label="Note" className="text-muted">{i.description}</td>
                                                <td data-label="Actions" data-actions="true">
                                                    {/* keep buttons together on phones */}
                                                    <div className="cell-actions">
                                                        <Button
                                                            size="sm"
                                                            className="btn-ghost me-2"
                                                            onClick={() => handleShowEditModal(i)}
                                                            aria-label="Edit income"
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            className="btn-ghost"
                                                            onClick={() => confirmDeleteIncome(i)}
                                                            aria-label="Delete income"
                                                        >
                                                            <i className="bi bi-trash text-danger"></i>
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>

                                {incomeList.length > 0 && (
                                    <tfoot>
                                        <tr>
                                            <td className="text-end fw-bold" colSpan="2">Total:</td>
                                            <td className="fw-bold text-success">{currency(totalIncome)}</td>
                                            <td colSpan="3"></td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* ===== Modals ===== */}

            {/* Delete Source */}
            <Modal show={showSourceDeleteModal} onHide={() => setShowSourceDeleteModal(false)}>
                <Modal.Header closeButton><Modal.Title>Confirm Delete</Modal.Title></Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete the source "{sourceToDelete?.Name || sourceToDelete?.name}"?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowSourceDeleteModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDeleteConfirmed}>Delete</Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showSourceModal} onHide={() => setShowSourceModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{sourceFormData.id ? "Edit Source" : "Add Source"}</Modal.Title>
                </Modal.Header>

                <Form onSubmit={handleSaveSource}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>
                                Source Type <span style={{ color: "red" }}>*</span>
                            </Form.Label>

                            <Form.Control
                                type="text"
                                value={sourceFormData.sourceType}
                                onChange={(e) => setSourceFormData((p) => ({ ...p, sourceType: e.target.value }))}
                                required
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                type="text"
                                value={sourceFormData.description}
                                onChange={(e) => setSourceFormData((p) => ({ ...p, description: e.target.value }))}
                            />
                        </Form.Group>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowSourceModal(false)}>
                            Cancel
                        </Button>

                        <Button variant="primary" type="submit">
                            Save
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>



            {/* Add/Edit Income */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Form onSubmit={handleSaveIncome}>
                    <Modal.Header closeButton>
                        <Modal.Title>{editingIncome ? "Edit Income" : "Add New Income"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Owner <span style={{ color: "red" }}>*</span></Form.Label>
                            <Form.Control name="owner" value={formData.owner} onChange={handleFormChange} required />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Source Type <span style={{ color: "red" }}>*</span></Form.Label>
                            <Form.Select
                                name="incomeSourceId"
                                value={formData.incomeSourceId}
                                onChange={handleFormChange}
                                required
                            >
                                <option value="">Choose source</option>
                                {sourceList.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Amount <span style={{ color: "red" }}>*</span></Form.Label>
                            <Form.Control
                                name="amount" type="number" step="0.01" min="0"
                                value={formData.amount} onChange={handleFormChange} required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Date <span style={{ color: "red" }}>*</span></Form.Label>
                            <Form.Control name="date" type="date" value={formData.date} onChange={handleFormChange} required />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>
                                Recurrence <span className="text-danger">*</span>
                            </Form.Label>

                            <Form.Select
                                name="frequency"
                                value={formData.frequency}
                                onChange={handleFormChange}
                                required
                            >
                                <option value="" disabled>Choose recurrence</option>
                                <option value="None">One-time</option>
                                <option value="Weekly">Weekly</option>
                                <option value="ByWeekly">Bi-weekly</option>
                                <option value="Monthly">Monthly</option>
                                <option value="Yearly">Yearly</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Month <span style={{ color: "red" }}>*</span></Form.Label>
                            <Form.Select name="month" value={formData.month} onChange={handleFormChange} required>
                                <option value="">Choose month</option>
                                {monthNames.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Year <span style={{ color: "red" }}>*</span></Form.Label>
                            <Form.Control name="year" type="number" min="2000" value={formData.year} onChange={handleFormChange} required />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Check type="checkbox" label="Repeat next month" name="isRecurring" checked={formData.isRecurring} onChange={handleFormChange} />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control as="textarea" rows={2} name="description" value={formData.description} onChange={handleFormChange} />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit" variant="primary">{editingIncome ? "Save Changes" : "Add Income"}</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Copy incomes */}
            <Modal show={showGenerateModal} onHide={() => setShowGenerateModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Copy Incomes</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Source Month &amp; Year</Form.Label>
                        {/* stack on phones for better UX */}
                        <div className="stack-sm">
                            <Form.Select
                                className="w-100-sm"
                                value={sourceMonth}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setSourceMonth(val);
                                    setGenerateRange((p) => ({ ...p, fromMonth: Math.max(val, p.fromMonth), toMonth: Math.max(val, p.toMonth) }));
                                }}
                            >
                                {monthNames.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                            </Form.Select>
                            <Form.Control
                                className="w-100-sm"
                                type="number"
                                value={sourceYear}
                                onChange={(e) => setSourceYear(Number(e.target.value))}
                            />
                        </div>
                    </Form.Group>

                    {!hasDataToCopy ? (
                        <Alert variant="warning" className="mb-0">
                            <i className="bi bi-exclamation-triangle me-2"></i> There are no incomes in this month to copy.
                        </Alert>
                    ) : (
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Copy to Months</Form.Label>
                            {/* stack on phones */}
                            <div className="stack-sm align-items-stretch">
                                <div className="d-flex align-items-center gap-2 w-100-sm">
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
                                            .filter((m) => m.value >= sourceMonth)
                                            .map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                                    </Form.Select>
                                </div>

                                <div className="d-flex align-items-center gap-2 w-100-sm">
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

                            <Alert variant="info" className="mt-2 mb-0">
                                Only the incomes from the selected source month will be copied.
                                Existing incomes in target months will be skipped automatically.
                            </Alert>
                        </Form.Group>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowGenerateModal(false)}>Cancel</Button>
                    <Button
                        className="btn-pill btn-blue"
                        disabled={!hasDataToCopy}
                        onClick={async () => {
                            const payload = {
                                UserId: userId,
                                SourceMonth: sourceMonth,
                                SourceYear: sourceYear,
                                TargetFromMonth: generateRange.fromMonth,
                                TargetFromYear: sourceYear,
                                TargetToMonth: generateRange.toMonth,
                                TargetToYear: sourceYear,
                            };
                            await copyIncomesByRange(payload);
                            setShowGenerateModal(false);
                        }}
                    >
                        Copy
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Delete Income */}
            <Modal show={showDeleteIncomeModal} onHide={() => setShowDeleteIncomeModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Confirm Delete</Modal.Title></Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete the income from "{incomeToDelete?.sourceType}" on{" "}
                    {incomeToDelete && prettyDate(incomeToDelete.date)}?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteIncomeModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDeleteIncomeConfirmed}>Delete</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default IncomePage;