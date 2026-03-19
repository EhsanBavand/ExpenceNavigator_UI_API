// ===================================================
// PlaceForm.jsx
// ===================================================
export function PlaceForm({ placeName, onName, onSubmit }) {
    return (
        <form onSubmit={onSubmit}>
            <div className="row g-2">
                <div className="col-12 col-md-10">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Place Name"
                        value={placeName}
                        onChange={onName}
                        required
                    />
                </div>

                <div className="col-12 col-md-2">
                    <button type="submit" className="btn btn-primary w-100">Add</button>
                </div>
            </div>
        </form>
    );
}
