export function ExpenseForm({ form, onChange, onSubmit, categories, subCategories, places }) {
    return (
        <form onSubmit={onSubmit} className="responsive-form">
            <div className="row g-2">

                <div className="col-12 col-md-6">
                    <input
                        type="date"
                        name="date"
                        className="form-control"
                        value={form.date}
                        onChange={onChange}
                        required
                    />
                </div>

                <div className="col-12 col-md-3 required-wrapper">
                    <select
                        name="categoryId"          // <-- changed
                        className="form-select"
                        value={form.categoryId}    // <-- changed
                        onChange={onChange}
                        required
                    >
                        <option value="">Category</option>
                        {categories.map(c => (
                            <option key={c.catId} value={c.catId}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div className="col-12 col-md-3 ">
                    <select
                        name="subCategoryId"        // <-- changed
                        className="form-select"
                        value={form.subCategoryId}  // <-- changed
                        onChange={onChange}
                        disabled={!form.categoryId}
                    >
                        <option value="">SubCategory</option>
                        {subCategories
                            .filter(sc => sc.categoryId === form.categoryId)
                            .map(sc => (
                                <option key={sc.id} value={sc.id}>{sc.name}</option>
                            ))}
                    </select>
                </div>

                <div className="col-12 col-md-6">
                    <select
                        name="placeId"             // <-- changed
                        className="form-select"
                        value={form.placeId}       // <-- changed
                        onChange={onChange}
                    >
                        <option value="">Place</option>
                        {places.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <div className="col-12 col-md-6 required-wrapper">
                    <input
                        type="number"
                        name="amount"
                        className="form-control"
                        placeholder="Amount"
                        value={form.amount}
                        onChange={onChange}
                        required
                    />
                </div>

                <div className="col-12 col-md-6">
                    <input
                        type="text"
                        name="paidFor"
                        className="form-control"
                        placeholder="Paid For"
                        value={form.paidFor}
                        onChange={onChange}
                    />
                </div>

                <div className="col-12 col-md-6">
                    <input
                        type="text"
                        name="itemName"
                        className="form-control"
                        placeholder="Item Name"
                        value={form.itemName}
                        onChange={onChange}
                    />
                </div>

                <div className="col-12">
                    <textarea
                        name="note"
                        className="form-control"
                        placeholder="Note"
                        value={form.note}
                        onChange={onChange}
                    />
                </div>

                <div className="col-12">
                    <div className="form-check mb-2">
                        <input
                            type="checkbox"
                            name="isFixed"
                            className="form-check-input"
                            checked={form.isFixed}
                            onChange={onChange}
                        />
                        <label className="form-check-label">
                            Fixed Expense
                        </label>
                    </div>
                </div>

                <div className="col-12">
                    <button type="submit" className="btn btn-success w-100">
                        Add Expense
                    </button>
                </div>

            </div>
        </form>
    );
}
