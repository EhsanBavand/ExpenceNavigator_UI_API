
// ===================================================
// SubCategoryTable.jsx
// ===================================================
export function SubCategoryTable({ subCategories, categories, onEdit, onDelete }) {
    return (
        <div className="table-responsive table-rounded">
            <table className="table table-soft table-hover align-middle mb-0">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Active</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {subCategories.map((sc) => (
                        <tr key={sc.id}>
                            <td>{sc.name}</td>
                            <td>{categories.find((c) => c.catId === sc.categoryId)?.name || "-"}</td>
                            <td>{sc.isActive ? "Yes" : "No"}</td>
                            <td>
                                <button className="btn-action-icon" onClick={() => onEdit(sc)}>
                                    <i className="bi bi-pencil icon-edit"></i></button>
                                <button className="btn-action-icon" onClick={() => onDelete(sc.id)}>
                                    <i className="bi bi-trash text-danger"></i></button>

                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
