import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
import {
    getIncomes,
    getIncomesByMonth,
    addIncome,
    updateIncome,
    deleteIncome,
    duplicateIncome,
    addSource,
    getSources,
    updateSource,
    deleteSource,
    copyIncomesByRange,
} from "../services/api";

const IncomePage = () => {
    const [showModal, setShowModal] = useState(false);
    const [incomeList, setIncomeList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingIncome, setEditingIncome] = useState(null);
    const [formData, setFormData] = useState({
        owner: "",
        incomeSourceId: "",
        amount: "",
        date: "",
        frequency: "", // 👈 force choose
        month: "", // 👈 force choose
        year: new Date().getFullYear(),
        isRecurring: false,
        description: "",
    });

    // Total InCome
    // const [incomes, setIncomes] = useState([]);
    // const totalIncome = incomes.reduce((sum, i) => sum + (i.amount || 0), 0);
    const totalIncome = incomeList.reduce(
        (sum, i) => sum + (Number(i.amount) || 0),
        0,
    );

    // Source modal state
    const [showSourceModal, setShowSourceModal] = useState(false);
    const [sourceFormData, setSourceFormData] = useState({
        id: null,
        sourceType: "",
        description: "",
    });
    const [sourceList, setSourceList] = useState([]);
    const [loadingSources, setLoadingSources] = useState(false);

    const [userId, setUserId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [sourceToDelete, setSourceToDelete] = useState(null);

    // Add for loading by year and month
    const now = new Date();

    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

    // For Generate Next Month
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [generateRange, setGenerateRange] = useState({
        fromMonth: selectedMonth,
        fromYear: selectedYear,
        toMonth: selectedMonth,
        toYear: selectedYear,
    });

    useEffect(() => {
        setGenerateRange({
            fromMonth: selectedMonth,
            fromYear: selectedYear,
            toMonth: selectedMonth,
            toYear: selectedYear,
        });
    }, [selectedMonth, selectedYear]);

    // Decode JWT
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("User is not authenticated");
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const id =
                decoded[
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
                ] ||
                decoded.sub ||
                null;

            if (!id) setError("User is not authenticated");
            else setUserId(id);
        } catch {
            setError("Invalid token");
        }
    }, []);

    // Fetch incomes
    useEffect(() => {
        if (!userId) return;

        const fetchIncomes = async () => {
            setLoading(true);
            try {
                const now = new Date();
                const response = await getIncomesByMonth(
                    userId,
                    now.getMonth() + 1,
                    now.getFullYear(),
                );
                setIncomeList(response.data);
                setError(null);
            } catch (e) {
                console.error("Failed to load incomes:", e);
                setError("Failed to load incomes.");
            } finally {
                setLoading(false);
            }
        };

        fetchIncomes();
    }, [userId]);

    useEffect(() => {
        if (!userId) return;

        const fetchSources = async () => {
            setLoadingSources(true);
            try {
                const response = await getSources(userId);
                setSourceList(response.data);
            } catch (err) {
                console.error("Failed to load sources:", err);
            } finally {
                setLoadingSources(false);
            }
        };

        fetchSources();
    }, [userId]);

    // Close Alert Message after 20 secs
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 10000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
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
            frequency: "", // ✅ MUST be empty
            month: "", // ✅ MUST be empty
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
            incomeSourceId: income.incomeSourceId, // ✅ store ID
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

        if (!Number.isInteger(month) || month < 1 || month > 12) {
            return setError("Invalid month selected");
        }

        if (!Number.isInteger(year) || year < 2000) {
            return setError("Invalid year");
        }

        const incomePayload = {
            id: formData.id,
            userId,
            owner: formData.owner || userId,
            incomeSourceId: formData.incomeSourceId,
            amount: Number(formData.amount),
            date: formData.date,
            month,
            year,
            // isRecurring: formData.frequency,
            isRecurring: formData.isRecurring,
            isEstimated: formData.isEstimated,
            frequency: formData.frequency,
            description: formData.description || "",
            createdBy: editingIncome?.createdBy || userId,
            createdDate: editingIncome?.createdDate || new Date().toISOString(),
            modifiedDate: new Date().toISOString(),
        };

        try {
            if (editingIncome) {
                await updateIncome(incomePayload, editingIncome.id);
            } else {
                await addIncome(incomePayload);
            }

            const now = new Date();
            // const refresh = await getIncomesByMonth(
            //   userId,
            //   now.getMonth() + 1,
            //   now.getFullYear(),
            // );

            setSelectedMonth(formData.month);
            setSelectedYear(formData.year);

            const refresh = await getIncomesByMonth(
                userId,
                formData.month,
                formData.year,
            );

            setIncomeList(refresh.data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Failed to save income.");
        } finally {
            setShowModal(false);
        }
    };

    const handleDeleteIncome = async (id) => {
        try {
            await deleteIncome(id);
            // const response = await getIncomes(userId);
            const now = new Date();
            const response = await getIncomesByMonth(
                userId,
                now.getMonth() + 1,
                now.getFullYear(),
            );
            setIncomeList(response.data);
        } catch {
            setError("Failed to delete income.");
        }
    };

    // // Add for next month
    // const handleGenerateNextMonth = async () => {
    //   if (!userId) return setError("User is not authenticated");

    //   try {
    //     setLoading(true);
    //     const response = await fetch(
    //       `/api/incomes/generate-next-month/${userId}`,
    //       { method: "POST" },
    //     );
    //     const data = await response.json();

    //     // Refresh current month to include generated incomes if needed
    //     const now = new Date();
    //     const refresh = await getIncomesByMonth(
    //       userId,
    //       now.getMonth() + 1,
    //       now.getFullYear(),
    //     );
    //     setIncomeList(refresh.data);

    //     setError(null);
    //   } catch (err) {
    //     console.error(err);
    //     setError("Failed to generate next month incomes.");
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    // const handleDuplicateIncome = async (id) => {
    //   try {
    //     await duplicateIncome(id);
    //     // const response = await getIncomes(userId);
    //     const now = new Date();
    //     const response = await getIncomesByMonth(
    //       userId,
    //       now.getMonth() + 1,
    //       now.getFullYear(),
    //     );
    //     setIncomeList(response.data);
    //   } catch {
    //     setError("Failed to duplicate income.");
    //   }
    // };

    // // Logout
    // const handleLogout = () => {
    //   localStorage.removeItem("token");
    //   window.location.href = "/login";
    // };

    // Source modal handlers
    const handleShowAddSourceModal = () => {
        setSourceFormData({ id: null, sourceType: "", description: "" });
        setShowSourceModal(true);
    };

    const handleSaveSource = async () => {
        if (!userId) return setError("User is not authenticated");

        const now = new Date().toISOString();
        const payload = {
            Name: sourceFormData.sourceType,
            Description: sourceFormData.description,
            UserId: userId,
            CreatedDate: now,
            ModifiedDate: now,
        };

        try {
            if (sourceFormData.id) {
                await updateSource(sourceFormData.id, payload);
            } else {
                await addSource(payload);
            }

            const response = await getSources(userId);
            setSourceList(response.data);
            setShowSourceModal(false);
            setSourceFormData({ id: null, sourceType: "", description: "" });

            // ✅ Update incomeList with new source names
            setIncomeList((prev) =>
                prev.map((income) => ({
                    ...income,
                    sourceType:
                        response.data.find((s) => s.id === income.incomeSourceId)?.name ||
                        income.sourceType,
                })),
            );

            setError(null);
        } catch (err) {
            console.error("Failed to save source:", err);
            setError("Failed to save source.");
        }
    };

    const handleEditSource = (source) => {
        setSourceFormData({
            id: source.id,
            sourceType: source.name,
            description: source.description,
        });
        setShowSourceModal(true);
    };

    const confirmDeleteSource = (source) => {
        setSourceToDelete(source);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirmed = async () => {
        if (!sourceToDelete) return;

        try {
            const success = await deleteSource(sourceToDelete.id);
            if (success) {
                setSourceList((prev) => prev.filter((s) => s.id !== sourceToDelete.id));
            }
        } catch (error) {
            console.error("Delete failed:", error);
        } finally {
            setShowDeleteModal(false);
            setSourceToDelete(null);
        }
    };

    // Search by year and month
    const handleSearchByMonth = async () => {
        if (!userId) return setError("User is not authenticated");

        try {
            setLoading(true);
            const response = await getIncomesByMonth(
                userId,
                selectedMonth,
                selectedYear,
            );
            setIncomeList(response.data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Failed to load incomes.");
        } finally {
            setLoading(false);
        }
    };

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

    const hasDataToCopy = incomeList.length > 0;

    const buildGeneratePayload = () => ({
        userId,
        sourceYear: selectedYear,
        sourceMonth: selectedMonth,
        targetFromYear: generateRange.fromYear,
        targetFromMonth: generateRange.fromMonth,
        targetToYear: generateRange.toYear,
        targetToMonth: generateRange.toMonth,
    });

    const [sourceMonth, setSourceMonth] = useState(selectedMonth);
    const [sourceYear, setSourceYear] = useState(selectedYear);

    // Delete Modal
    const [showDeleteIncomeModal, setShowDeleteIncomeModal] = useState(false);
    const [incomeToDelete, setIncomeToDelete] = useState(null);

    const confirmDeleteIncome = (income) => {
        setIncomeToDelete(income);
        setShowDeleteIncomeModal(true);
    };

    const handleDeleteIncomeConfirmed = async () => {
        if (!incomeToDelete) return;

        try {
            await deleteIncome(incomeToDelete.id);
            setIncomeList((prev) => prev.filter((i) => i.id !== incomeToDelete.id));
        } catch (err) {
            console.error("Failed to delete income:", err);
            setError("Failed to delete income.");
        } finally {
            setShowDeleteIncomeModal(false);
            setIncomeToDelete(null);
        }
    };

    return (
        <div className="container mt-4" style={{ margin: "auto" }}>
            <div className="d-flex justify-content-between align-items-end mb-3">
                <div className="d-flex gap-3 mb-3 align-items-end">
                    {/* Month */}
                    <Form.Group className="mb-0">
                        <Form.Label className="mb-1">Month</Form.Label>
                        <Form.Select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        >
                            {[
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
                            ].map((m, index) => (
                                <option key={index + 1} value={index + 1}>
                                    {m}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    {/* Year */}
                    <Form.Group className="mb-0">
                        <Form.Label className="mb-1">Year</Form.Label>
                        <Form.Select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                        >
                            {[...Array(5)].map((_, i) => {
                                const year = now.getFullYear() - i;
                                return (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                );
                            })}
                        </Form.Select>
                    </Form.Group>

                    {/* Search Button */}
                    <Button variant="primary" onClick={handleSearchByMonth}>
                        <i className="bi bi-search me-1"></i> Search
                    </Button>
                </div>
            </div>

            {error && (
                <Alert
                    variant="danger"
                    dismissible
                    onClose={() => setError(null)}
                    style={{ border: "2px solid black" }}
                >
                    {error}
                </Alert>
            )}
            {/* Delete Source Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete the source "
                    {sourceToDelete?.Name || sourceToDelete?.name}"?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeleteConfirmed}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Income Sources Section */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mt-4">Income Sources</h5>
                <Button className="me-2" onClick={handleShowAddSourceModal}>
                    <i className="bi bi-plus-circle me-2"></i> Add Source
                </Button>
            </div>

            {/* //#region Source Type */}
            {loadingSources ? (
                <Spinner animation="border" />
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-hover align-middle">
                        <thead className="table-dark">
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th style={{ width: "120px" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sourceList.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="text-center">
                                        No sources found
                                    </td>
                                </tr>
                            ) : (
                                sourceList.map((source) => (
                                    <tr key={source.id}>
                                        <td>{source.name}</td>
                                        <td>{source.description}</td>
                                        <td>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handleEditSource(source)}
                                            >
                                                <i className="bi bi-pencil"></i>
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => confirmDeleteSource(source)}
                                            >
                                                <i className="bi bi-trash"></i>
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* region Income Section*/}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mt-4">Incomes</h5>
                <div className="d-flex gap-2">
                    <Button onClick={handleShowAddModal}>
                        <i className="bi bi-plus-circle"></i> Add Income
                    </Button>
                    {/* <Button variant="outline-success" onClick={handleGenerateNextMonth}>
            <i className="bi bi-calendar-plus"></i> Generate Next Month
          </Button> */}
                    <Button
                        variant="outline-success"
                        onClick={() => setShowGenerateModal(true)}
                    >
                        <i className="bi bi-calendar-range"></i> Copy Incomes to Next Month
                    </Button>
                </div>
            </div>

            {loading ? (
                <Spinner animation="border" />
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-hover">
                        <thead className="table-dark">
                            <tr>
                                <th>Date</th>
                                <th>Owner</th>
                                <th>Source</th>
                                <th>Amount</th>
                                <th>Recurring</th>
                                <th>Year</th>
                                <th>Month</th>
                                <th>Frequency</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {incomeList.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="text-center">
                                        No incomes found
                                    </td>
                                </tr>
                            ) : (
                                incomeList.map((income) => (
                                    <tr key={income.id}>
                                        <td>{new Date(income.date).toLocaleDateString()}</td>
                                        <td>{income.owner}</td>
                                        <td>{income.sourceType}</td>
                                        <td>${income.amount.toFixed(2)}</td>
                                        <td>{income.isRecurring ? "Yes" : "No"}</td>
                                        <td>{income.year}</td>
                                        <td>{income.month}</td>
                                        <td>{income.frequency}</td>
                                        <td>{income.description}</td>
                                        <td>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handleShowEditModal(income)}
                                            >
                                                <i className="bi bi-pencil" title="Edit Income"></i>
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => confirmDeleteIncome(income)}
                                            >
                                                <i className="bi bi-trash" title="Delete Income"></i>
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>

                        {/* ✅ Total row */}
                        {incomeList.length > 0 && (
                            <tfoot className="table-light">
                                <tr>
                                    <td colSpan="3" className="fw-bold text-end">
                                        Total Income:
                                    </td>
                                    <td className="fw-bold text-success fs-5">
                                        ${totalIncome.toFixed(2)}
                                    </td>
                                    <td colSpan="6"></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            )}

            {/* Income Add/Edit Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Form onSubmit={handleSaveIncome}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {editingIncome ? "Edit Income" : "Add New Income"}
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Owner</Form.Label>
                            <Form.Control
                                name="owner"
                                value={formData.owner}
                                onChange={handleFormChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Source Type</Form.Label>
                            <Form.Select
                                name="incomeSourceId"
                                value={formData.incomeSourceId}
                                onChange={handleFormChange}
                                required
                            >
                                <option value="">Choose source</option>
                                {sourceList.map((source) => (
                                    <option key={source.id} value={source.id}>
                                        {source.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Amount</Form.Label>
                            <Form.Control
                                name="amount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.amount}
                                onChange={handleFormChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Date</Form.Label>
                            <Form.Control
                                name="date"
                                type="date"
                                value={formData.date}
                                onChange={handleFormChange}
                                required
                            />
                        </Form.Group>

                        <Form.Select
                            className="mb-3"
                            name="frequency"
                            value={formData.frequency}
                            onChange={handleFormChange}
                            required
                        >
                            <option value="" disabled>
                                Choose recurrence
                            </option>
                            <option value="None">One-time</option>
                            <option value="Weekly">Weekly</option>
                            <option value="ByWeekly">By Weekly</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Yearly">Yearly</option>
                        </Form.Select>

                        {/* Month */}
                        <Form.Group className="mb-3">
                            <Form.Label>Month</Form.Label>
                            <Form.Select
                                name="month"
                                value={formData.month}
                                onChange={handleFormChange}
                                required
                            >
                                <option value="">Choose month</option>
                                {[
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
                                ].map((m, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {m}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        {/* Year */}
                        <Form.Group className="mb-3">
                            <Form.Label>Year</Form.Label>
                            <Form.Control
                                name="year"
                                type="number"
                                min="2000"
                                value={formData.year}
                                onChange={handleFormChange}
                                required
                            />
                        </Form.Group>

                        {/* Recurring checkbox (optional visual indicator) */}
                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                label="Is Recurring?"
                                name="isRecurring"
                                checked={formData.isRecurring}
                                onChange={handleFormChange}
                            />
                        </Form.Group>

                        {/* Description */}
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                name="description"
                                value={formData.description}
                                onChange={handleFormChange}
                            />
                        </Form.Group>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                            {editingIncome ? "Save Changes" : "Add Income"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Add/Edit Source Modal */}
            <Modal show={showSourceModal} onHide={() => setShowSourceModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {sourceFormData.id ? "Edit Source" : "Add Source"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Source Type</Form.Label>
                            <Form.Control
                                type="text"
                                value={sourceFormData.sourceType}
                                onChange={(e) =>
                                    setSourceFormData({
                                        ...sourceFormData,
                                        sourceType: e.target.value,
                                    })
                                }
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                type="text"
                                value={sourceFormData.description}
                                onChange={(e) =>
                                    setSourceFormData({
                                        ...sourceFormData,
                                        description: e.target.value,
                                    })
                                }
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowSourceModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSaveSource}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* modal for nex month */}

            <Modal
                show={showGenerateModal}
                onHide={() => setShowGenerateModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Copy Incomes</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {/* SOURCE MONTH & YEAR */}
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Source Month & Year</Form.Label>
                        <div className="d-flex gap-2">
                            <Form.Select
                                value={sourceMonth}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setSourceMonth(val);

                                    setGenerateRange((p) => ({
                                        ...p,
                                        fromMonth: Math.max(val, p.fromMonth),
                                        toMonth: Math.max(val, p.toMonth),
                                    }));
                                }}
                            >
                                {monthNames.map((m, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {m}
                                    </option>
                                ))}
                            </Form.Select>

                            <Form.Control
                                type="number"
                                value={sourceYear}
                                onChange={(e) => setSourceYear(Number(e.target.value))}
                            />
                        </div>
                    </Form.Group>

                    {!hasDataToCopy && (
                        <Alert variant="warning" className="mb-0">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            There are no incomes in this month to copy.
                        </Alert>
                    )}

                    {hasDataToCopy && (
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Copy to Months</Form.Label>

                            <div className="d-flex gap-2 align-items-center">
                                <Form.Label className="mb-0">From</Form.Label>
                                <Form.Select
                                    value={generateRange.fromMonth}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        setGenerateRange((p) => ({
                                            ...p,
                                            fromMonth: val,
                                            toMonth: Math.max(val, p.toMonth),
                                        }));
                                    }}
                                >
                                    {monthNames
                                        .map((m, i) => ({ label: m, value: i + 1 }))
                                        .filter((m) => m.value >= sourceMonth)
                                        .map((m) => (
                                            <option key={m.value} value={m.value}>
                                                {m.label}
                                            </option>
                                        ))}
                                </Form.Select>

                                <Form.Label className="mb-0">To</Form.Label>
                                <Form.Select
                                    value={generateRange.toMonth}
                                    onChange={(e) =>
                                        setGenerateRange((p) => ({
                                            ...p,
                                            toMonth: Number(e.target.value),
                                        }))
                                    }
                                >
                                    {monthNames
                                        .map((m, i) => ({ label: m, value: i + 1 }))
                                        .filter((m) => m.value >= generateRange.fromMonth)
                                        .map((m) => (
                                            <option key={m.value} value={m.value}>
                                                {m.label}
                                            </option>
                                        ))}
                                </Form.Select>
                            </div>

                            <Alert variant="info" className="mt-2 mb-0">
                                Only the incomes from the selected source month will be copied.
                                Existing incomes in target months will be skipped automatically.
                            </Alert>
                        </Form.Group>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowGenerateModal(false)}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="success"
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

            {/* Delete Modal */}
            <Modal
                show={showDeleteIncomeModal}
                onHide={() => setShowDeleteIncomeModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete the income from "
                    {incomeToDelete?.sourceType}" on{" "}
                    {incomeToDelete && new Date(incomeToDelete.date).toLocaleDateString()}
                    ?
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowDeleteIncomeModal(false)}
                    >
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeleteIncomeConfirmed}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default IncomePage;
