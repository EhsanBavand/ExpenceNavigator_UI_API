// ===================================================
// SubCategoryForm.jsx
// ===================================================
export function SubCategoryForm({ categories, selectedCategory, subCategoryName, onSubmit, onCategory, onName }) {
    return (
        <form onSubmit={onSubmit}>
            <div className="row g-2">
                <div className="col-12 col-md-6 required-wrapper">
                    <select className="form-select" value={selectedCategory} onChange={onCategory} required>
                        <option value="">Choose Category</option>
                        {categories.map((c) => (
                            <option key={c.catId} value={c.catId}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div className="col-12 col-md-4 required-wrapper">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="SubCategory Name"
                        value={subCategoryName}
                        onChange={onName}
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
