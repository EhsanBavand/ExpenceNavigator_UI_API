
// ===================================================
// ExpenseTable.jsx
// ===================================================
export function ExpenseTable({ expenses, categoryMap, subCategoryMap, placeMap, onEdit, onDelete, currency }) {
    return (
        <div className="table-responsive table-rounded">
            <table className="table table-soft table-hover align-middle mb-0">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Category</th>
                        <th>SubCategory</th>
                        <th>Place</th>
                        <th>Amount</th>
                        <th>Paid For</th>
                        <th>Item</th>
                        <th>Note</th>
                        <th>Fixed</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {expenses.map((e) => (
                        <tr key={e.id}>
                            <td className="expense-date">
                                {e.date?.split("T")[0]}
                            </td>
                            <td className="expense-category">
                                {categoryMap[e.categoryId] || ""}
                            </td>
                            <td>{subCategoryMap[e.subCategoryId] || ""}</td>
                            <td>{placeMap[e.placeId] || ""}</td>
                            <td>{currency(e.amount)}</td>
                            <td>{e.paidFor}</td>
                            <td>{e.itemName}</td>
                            <td className="expense-note" title={e.note}>
                                {e.note}
                            </td>
                            <td>{e.isFixed ? "Yes" : "No"}</td>
                            <td className="expense-actions">
                                <div className="d-flex align-items-center gap-2">
                                    <button
                                        className="btn-action-icon"
                                        onClick={() => onEdit(e)}
                                        title="Edit"
                                    >
                                        <i className="bi bi-pencil icon-edit"></i>
                                    </button>

                                    <button
                                        className="btn-action-icon"
                                        onClick={() => onDelete(e.id)}
                                        title="Delete"
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
