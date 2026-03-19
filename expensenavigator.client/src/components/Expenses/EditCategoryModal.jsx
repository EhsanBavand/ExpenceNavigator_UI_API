
// ===================================================
// EditCategoryModal.jsx
// ===================================================
import { Modal, Button, Form } from "react-bootstrap";
export function EditCategoryModal({ show, onClose, form, onChange, onSubmit }) {
    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Edit Category</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form.Control
                    type="text"
                    className="mb-2"
                    placeholder="Category Name"
                    value={form.name || ""}
                    onChange={(e) => onChange("name", e.target.value)}
                />

                <Form.Control
                    type="number"
                    className="mb-2"
                    placeholder="Budget"
                    value={form.budget || 0}
                    onChange={(e) => onChange("budget", e.target.value)}
                />

                <Form.Check
                    type="checkbox"
                    label="Active"
                    checked={!!form.isActive}
                    onChange={(e) => onChange("isActive", e.target.checked)}
                />
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button variant="primary" onClick={onSubmit}>Save Changes</Button>
            </Modal.Footer>
        </Modal>
    );
}
