
// ===================================================
// PlaceTable.jsx
// ===================================================
export function PlaceTable({ places, onEdit, onDelete }) {
    return (
        <div className="table-responsive table-rounded">
            <table className="table table-soft table-hover align-middle mb-0">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Active</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {places.map((p) => (
                        <tr key={p.id}>
                            <td>{p.name}</td>
                            <td>{p.isActive ? "Yes" : "No"}</td>
                            <td>
                                <button className="btn-action-icon" onClick={() => onEdit(p)}>
                                    <i className="bi bi-pencil icon-edit"></i></button>
                                <button className="btn-action-icon" onClick={() => onDelete(p.id)}>
                                    <i className="bi bi-trash text-danger"></i></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
