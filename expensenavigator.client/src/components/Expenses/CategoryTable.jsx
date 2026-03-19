
// ===================================================
// CategoryTable.jsx
// ===================================================
export function CategoryTable({ categories, onEdit, onDelete }) {
    return (
        <div className="table-responsive table-rounded">
            <table className="table table-soft table-hover align-middle mb-0">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Budget</th>
                        <th>Active</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((c) => (
                        <tr key={c.id}>
                            <td>{c.name}</td>
                            <td>{c.budget}</td>
                            <td>{c.isActive ? "Yes" : "No"}</td>
                            <td>
                                <button className="btn-action-icon" onClick={() => onEdit(c)}>
                                    <i className="bi bi-pencil icon-edit"></i></button>
                                <button className="btn-action-icon" onClick={() => onDelete(c.catId)}>
                                    <i className="bi bi-trash icon-delete"></i>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
