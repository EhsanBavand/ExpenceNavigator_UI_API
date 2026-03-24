import { Modal, Button, Form } from "react-bootstrap";

export function EditSubCategoryModal({
    show,
    onClose,
    form,
    categories,
    onChange,
    onSubmit
}) {
    return (
        <Modal show={show} onHide={onClose} centered>

            <Modal.Header closeButton>
                <Modal.Title>Edit SubCategory</Modal.Title>
            </Modal.Header>

            <Modal.Body>

                <Form.Select
                    className="mb-3"
                    value={form.categoryId || ""}
                    onChange={(e) =>
                        onChange("categoryId", e.target.value)
                    }
                >
                    <option value="">
                        Select Category
                    </option>

                    {categories.map(c => (

                        <option
                            key={c.catId}
                            value={c.catId}
                        >
                            {c.name}
                        </option>

                    ))}

                </Form.Select>

                <Form.Control
                    type="text"
                    className="mb-3"
                    value={form.name || ""}
                    onChange={(e) =>
                        onChange("name", e.target.value)
                    }
                />

                <Form.Check
                    type="checkbox"
                    label="Active"
                    checked={form.isActive || false}
                    onChange={(e) =>
                        onChange("isActive", e.target.checked)
                    }
                />

            </Modal.Body>

            <Modal.Footer>

                <Button
                    variant="secondary"
                    onClick={onClose}
                >
                    Cancel
                </Button>

                <Button
                    variant="primary"
                    onClick={onSubmit}
                >
                    Save
                </Button>

            </Modal.Footer>

        </Modal>
    );
}