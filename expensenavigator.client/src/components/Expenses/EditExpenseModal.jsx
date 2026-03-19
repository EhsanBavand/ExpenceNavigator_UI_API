
import { Modal, Button, Form } from "react-bootstrap";
import React from "react";

// ===================================================
// EditExpenseModal.jsx
// ===================================================
export function EditExpenseModal({ show, onClose, form, categories, subCategories, places, onChange, onSubmit }) {
    return (
        <Modal show={show} onHide={onClose} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Edit Expense</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <div className="row g-2">
                    <div className="col-12 col-md-6">
                        <Form.Control type="date" value={form.date || ""} onChange={(e) => onChange("date", e.target.value)} />
                    </div>

                    <div className="col-12 col-md-6">
                        <Form.Select value={form.categoryId || ""} onChange={(e) => onChange("categoryId", e.target.value)}>
                            <option value="">Choose Category</option>
                            {categories.map((c) => (
                                <option key={c.catId} value={c.catId}>{c.name}</option>
                            ))}
                        </Form.Select>
                    </div>

                    <div className="col-12 col-md-6">
                        <Form.Select
                            value={form.subCategoryId || ""}
                            onChange={(e) => onChange("subCategoryId", e.target.value)}
                            disabled={!form.categoryId}
                        >
                            <option value="">Choose SubCategory</option>
                            {subCategories
                                .filter((sc) => String(sc.categoryId) === String(form.categoryId))
                                .map((sc) => (
                                    <option key={sc.id} value={sc.id}>{sc.name}</option>
                                ))}
                        </Form.Select>
                    </div>

                    <div className="col-12 col-md-6">
                        <Form.Select
                            value={form.placeId || ""}
                            onChange={(e) => onChange("placeId", e.target.value)}
                        >
                            <option value="">Choose Place</option>
                            {places.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </Form.Select>
                    </div>

                    <div className="col-12 col-md-6">
                        <Form.Control
                            type="number"
                            value={form.amount || ""}
                            onChange={(e) => onChange("amount", e.target.value)}
                        />
                    </div>

                    <div className="col-12 col-md-6">
                        <Form.Control
                            type="text"
                            placeholder="Paid For"
                            value={form.paidFor || ""}
                            onChange={(e) => onChange("paidFor", e.target.value)}
                        />
                    </div>

                    <div className="col-12 col-md-6">
                        <Form.Control
                            type="text"
                            placeholder="Item Name"
                            value={form.itemName || ""}
                            onChange={(e) => onChange("itemName", e.target.value)}
                        />
                    </div>

                    <div className="col-12">
                        <Form.Control
                            as="textarea"
                            placeholder="Note"
                            value={form.note || ""}
                            onChange={(e) => onChange("note", e.target.value)}
                        />
                    </div>

                    <div className="col-12">
                        <Form.Check
                            type="checkbox"
                            label="Fixed Expense"
                            checked={!!form.isFixed}
                            onChange={(e) => onChange("isFixed", e.target.checked)}
                        />
                    </div>
                </div>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button variant="primary" onClick={onSubmit}>Save Changes</Button>
            </Modal.Footer>
        </Modal>
    );
}
