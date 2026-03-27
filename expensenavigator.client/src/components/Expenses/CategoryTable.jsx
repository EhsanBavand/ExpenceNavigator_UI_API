export function CategoryTable({
    categories,
    onEdit,
    onDelete
}) {

    return (
        <div className="table-responsive table-rounded">
            <table className="table table-soft table-hover align-middle mb-0">
                <thead>
                    <tr>
                        <th className="name-col">Name</th>
                        <th className="budget-col">Budget</th>
                        <th className="active-col">Active</th>
                        <th className="action-col">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((c) => (
                        <tr key={c.catId}>
                            <td data-label="Name">
                                {c.name}
                            </td>

                            <td data-label="Budget">
                                {c.budget}
                            </td>

                            <td data-label="Active">
                                {c.isActive ? "Yes" : "No"}
                            </td>

                            <td data-label="Action" className="action-col">
                                <div className="action-buttons">
                                    <button
                                        className="btn-action-icon"
                                        onClick={() => onEdit(c)}
                                    >
                                        <i className="bi bi-pencil icon-edit"></i>
                                    </button>

                                    <button
                                        className="btn-action-icon"
                                        onClick={() => onDelete(c.catId)}
                                    >
                                        <i className="bi bi-trash icon-delete"></i>
                                    </button>
                                </div>
                            </td>
                            
                        </tr>
                    ))}
                </tbody>

            </table>

        </div>
    );
}