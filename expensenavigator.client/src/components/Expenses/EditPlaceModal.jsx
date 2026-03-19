
// ===================================================
// EditPlaceModal.jsx
// ===================================================
import { Modal, Button, Form } from "react-bootstrap";
export function EditPlaceModal({ show, onClose, form, subCategories, onChange, onSubmit }) {
    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Edit Place</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form.Control
                    type="text"
                    className="mb-2"
                    placeholder="Place Name"
                    value={form.name || ""}
                    onChange={(e) => onChange("name", e.target.value)}
                />

                <Form.Select
                    className="mb-2"
                    value={form.subCategoryId || ""}
                    onChange={(e) => onChange("subCategoryId", e.target.value)}
                >
                    <option value="">Select SubCategory</option>
                    {subCategories.map((sc) => (
                        <option key={sc.id} value={sc.id}>{sc.name}</option>
                    ))}
                </Form.Select>

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
