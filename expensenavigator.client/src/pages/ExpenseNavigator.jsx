import { useNavigate } from "react-router-dom";

function ExpenseNavigator() {
    const navigate = useNavigate();

    return (
        <div>
            <h1>Expense Navigator</h1>
            <p>
                Track your monthly income and expenses using a secure web application.
            </p>

            <button onClick={() => navigate("/login")}>
                Login to Web App
            </button>
        </div>
    );
}

export default ExpenseNavigator;