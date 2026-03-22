
// ===================================================
// CategoryForm.jsx
// ===================================================
export function CategoryForm({ name, budget, onName, onBudget, onSubmit }) {
    return (
        <form onSubmit={onSubmit} className="responsive-form">
            <div className="row g-2">
                <div className="col-12 col-md-6 required-wrapper">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Category Name"
                        value={name}
                        onChange={onName}
                        required
                    />
                </div>
                <div className="col-12 col-md-4 required-wrapper">
                    <input
                        type="number"
                        className="form-control"
                        placeholder="Budget"
                        value={budget}
                        onChange={onBudget}
                        required
                    />
                </div>
                <div className="col-12 col-md-2">
                    <button type="submit" className="btn btn-success w-100">Add</button>
                </div>
            </div>
        </form>
    );
}
