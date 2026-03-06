import axios from "axios";

// Local Host
const API_BASE_URL = "/api"; // proxy to https://localhost:7037

// // // Server Host
// const API_BASE_URL = "https://www.maisonwebapp.com/api";

export const login = async (credentials) => {
    // console.log("Calling login API:", `${API_BASE_URL}/auth/login`);
    // console.log("Credentials:", credentials);
    const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
    // console.log("Login response:", response);
    return response;
};
export const register = async (userInfo) => {
    return await axios.post(`${API_BASE_URL}/auth/register`, userInfo);
};
export const forgotPassword = async (email) => {
    // ✅ wrap email in object { email: email } to match backend
    return await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
};
export const resetPassword = async (data) => {
    return await axios.post(`${API_BASE_URL}/auth/reset-password`, data);
};

// =====================
// Income API
// =====================
export const getIncomes = async (userId) => {
    return await axios.get(`${API_BASE_URL}/income/user/${userId}`);
};
export const getIncomesByMonth = (userId, month, year) => {
    return axios.get(`${API_BASE_URL}/income/by-month`, {
        params: { userId, month, year },
    });
};
export const addIncome = async (income) => {
    try {
        const payload = {
            id: income.id || undefined, // optional: backend can generate GUID
            userId: income.userId,
            owner: income.owner,
            sourceType: income.sourceType || "Rental", // <-- required now
            incomeSourceId: income.incomeSourceId,
            amount: income.amount,
            date: new Date(income.date).toISOString(),
            month: income.month,
            year: income.year,
            isRecurring: income.frequency !== "None",
            isEstimated: income.isEstimated,
            frequency: income.frequency,
            createdBy: income.createdBy,
            createdDate: new Date().toISOString(),
            modifiedDate: new Date().toISOString(),
            description: income.description || "",
        };

        // console.log("Payload sent to API:", payload);

        const response = await axios.post(`${API_BASE_URL}/income`, payload);

        // console.log("Income added:", response.data);
        return response.data;
    } catch (error) {
        if (error.response) {
            // console.error("API Error:", error.response.data);
        } else {
            // console.error("Error:", error.message);
        }
        throw error;
    }
};
//export const updateIncome = async (income) => {
//  try {
//    const payload = {
//      ...income,
//      sourceType: income.sourceType || "",
//      date: new Date(income.date).toISOString(),
//      createdDate: new Date(income.createdDate).toISOString(),
//      modifiedDate: new Date().toISOString(),
//      frequency: income.frequency.toString(),
//    };

//    // console.log("Payload sent to API:", payload);

//    // const response = await axios.put("http://localhost:5283/api/income",payload,);
//    const response = await axios.put(`${API_BASE_URL}/income`, payload);

//    return response.data;
//  } catch (error) {
//    // console.error("API Error:", error.response?.data || error.message);
//    throw error;
//  }
//};


export const updateIncome = async (income) => {
    const payload = {
        ...income,
        sourceType: income.sourceType || "",
        date: new Date(income.date).toISOString(),
        createdDate: new Date(income.createdDate).toISOString(),
        modifiedDate: new Date().toISOString(),
        frequency: income.frequency.toString(),
    };

    // Send payload to API
    const response = await axios.put(`${API_BASE_URL}/income`, payload);
    
    return response.data;
};

export const deleteIncome = async (id) => {
    return await axios.delete(`${API_BASE_URL}/income/${id}`);
};
export const duplicateIncome = async (id) => {
    return await axios.post(`${API_BASE_URL}/income/${id}/duplicate-next-month`);
};
export const generateNextMonth = (userId, currentMonth, currentYear) =>
    axios.post(`${API_BASE_URL}/generate-next-month`, null, {
        params: { userId, currentMonth, currentYear },
    });
export const copyIncomesByRange = (payload) => {
    // console.log("Payload sent to API:", payload);
    return axios.post(`${API_BASE_URL}/income/copy-range`, payload);
};

// =====================
// End Income API
// =====================

export const addSource = async (source) => {
    return await axios.post(`${API_BASE_URL}/IncomeSource`, source);
};
export const getSources = async (userId) => {
    return await axios.get(`${API_BASE_URL}/IncomeSource/${userId}`);
};
export async function updateSource(id, source) {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/IncomeSource/${id}`,
            source,
        );
        return response.data;
    } catch (error) {
        console.error("Error updating source:", error);
        throw error;
    }
}
export async function deleteSource(id) {
    try {
        const response = await axios.delete(`${API_BASE_URL}/IncomeSource/${id}`);
        return response.status === 204; // true if deleted
    } catch (error) {
        console.error("Error deleting source:", error);
        throw error;
    }
}

/* Expense Page */

// =====================
// Categories API
// =====================

export const getCategories = async (userId, month, year) => {
    const res = await axios.get(
        `${API_BASE_URL}/Category/${userId}/${month}/${year}`,
    );
    return res.data;
};
export const getCategoryById = async (userId, id, month, year) => {
    const res = await axios.get(
        `${API_BASE_URL}/Category/${userId}/category/${id}/${month}/${year}`,
    );
    return res.data;
};
export const createCategory = async (userId, name, budget, isRecurring) => {
    const encodedName = encodeURIComponent(name); // Important!
    const res = await axios.post(
        `${API_BASE_URL}/Category/${userId}/${encodedName}/${budget}/${isRecurring}`,
    );
    return res.data;
};
export const updateCategory = async (categoryDto) => {
    const res = await axios.put(`${API_BASE_URL}/Category`, categoryDto, {
        headers: { "Content-Type": "application/json" },
    });
    return res.data;
};
export const deleteCategory = async (id, userId, month, year) => {
    try {
        const res = await axios.delete(
            // `${API_BASE_URL}/Category/${id}`
            `${API_BASE_URL}/Category/${id}?userId=${userId}&month=${month}&year=${year}`,
        );
        return res.status === 204;
    } catch (error) {
        console.error(`Error deleting category ${id}:`, error);
        throw error;
    }
};
export const copyCategoryBudget = (payload) => {
    return axios.post(`${API_BASE_URL}/Category/copy-categorybudget`, payload);
};

// =====================
// SubCategories API
// =====================

export const getSubCategoriesByCategory = async (categoryId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/SubCategory/by-category/${categoryId}`,
        );
        return response.data;
    } catch (error) {
        console.error(
            `Error fetching subcategories for category ${categoryId}:`,
            error,
        );
        throw error;
    }
};
export const getSubCategories = async (userId) => {
    const res = await axios.get(`${API_BASE_URL}/SubCategory?userId=${userId}`);
    console.log("res subcategory:", res);
    return res.data;
};
export const createSubCategory = async (subCategory) => {
    const res = await axios.post(`${API_BASE_URL}/SubCategory`, subCategory);
    return res.data;
};
export const updateSubCategory = async (id, subcategory) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/SubCategory/${id}`,
            subcategory,
        );
        return response.data;
    } catch (error) {
        console.error(`Error updating subcategory ${id}:`, error);
        throw error;
    }
};
export const deleteSubCategory = async (id) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/SubCategory/${id}`);
        return response.status === 204;
    } catch (error) {
        console.error(`Error deleting subcategory ${id}:`, error);
        throw error;
    }
};
export const getSubCategoryById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/SubCategory/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching subcategory ${id}:`, error);
        throw error;
    }
};

// =====================
// Places
// =====================

// ----------------- Place API -----------------
export const getPlaceById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Place/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching place ${id}:`, error);
        throw error;
    }
};
export const getPlaces = async (userId) => {
    const res = await axios.get(`${API_BASE_URL}/Place?userId=${userId}`);
    return res.data;
};

export const createPlace = async (place) => {
    const res = await axios.post(`${API_BASE_URL}/Place`, place);
    return res.data;
};
export const updatePlace = async (id, place) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/Place/${id}`, place);

        return response.data;
    } catch (error) {
        console.error(`Error updating place ${id}:`, error);
        throw error;
    }
};
export const deletePlace = async (id) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/Place/${id}`);

        return response.status === 200;
    } catch (error) {
        console.error(`Error deleting place ${id}:`, error);
        throw error;
    }
};
export const getPlacesForDropdown = async (
    categoryId = null,
    subCategoryId = null,
) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Place/placesdropdown`, {
            params: { categoryId, subCategoryId },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching places for dropdown:", error);
        throw error;
    }
};

// =====================
// Expense
// =====================

// ----------------- Expense API -----------------

export const getExpenses = async (userId, month, year, opts = {}) => {
    const res = await axios.get(
        `${API_BASE_URL}/Expense/${userId}/${month}/${year}`,
        { signal: opts.signal, timeout: 15000 },
    );
    return res.data;
};
export const getExpenseById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Expense/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching expense ${id}:`, error);
        throw error;
    }
};
export const createExpense = async (expense) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/Expense`, expense);
        return response.data;
    } catch (error) {
        console.error("Error creating expense:", error);
        throw error;
    }
};
export const updateExpense = async (id, expense) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/Expense/${id}`, expense);
        return response.data;
    } catch (error) {
        console.error(`Error updating expense ${id}:`, error);
        throw error;
    }
};
export const deleteExpense = async (id) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/Expense/${id}`);
        return response.status === 200;
    } catch (error) {
        console.error(`Error deleting expense ${id}:`, error);
        throw error;
    }
};
export const copyExpenseByRange = (payload) => {
    return axios.post(`${API_BASE_URL}/expense/copy-expense`, payload);
};

// =====================
// Dashboard Summary
// =====================
// Summery
export const getDashboardSummary = async (userId, month, year) => {
    const res = await axios.get(
        `${API_BASE_URL}/dashboard/${userId}/${month}/${year}`,
    );
    return res.data;
};
export const getUserCategoryBudgets = async (userId, month, year) => {
    const res = await axios.get(
        `${API_BASE_URL}/Dashboard/UserCategoryBudgets?userId=${userId}&month=${month}&year=${year}`,
    );
    // console.log(res.data);
    return res.data;
};
export const SubCategoriesByCategory = async (catId, userId, month, year) => {
    const res = await axios.get(
        `${API_BASE_URL}/Dashboard/GetSubCategoriesByCategory?catId=${catId}&userId=${userId}&month=${month}&year=${year}`,
    );
    // console.log(res.data);
    return res.data;
};
export const getMonthlySummary = async (userId, year) => {
    const res = await axios.get(
        `${API_BASE_URL}/Dashboard/GetMonthlySummery?userId=${userId}&year=${year}`,
    );
    // console.log(res.data);
    return res.data;
};

// =====================
// Saving
// =====================
export const getAllSavingAsync = async (userId, year) => {
    const res = await axios.get(`${API_BASE_URL}/Saving/${userId}/${year}`);
    return res.data;
};
export const getExtraMoneyByYear = async (userId, year) => {
    const res = await axios.get(`${API_BASE_URL}/Saving/ExtraMoneyByYear`, {
        params: { userId, year },
    });
    return res.data;
};
export const addSavingAsync = async (payload) => {
    const res = await axios.post(`${API_BASE_URL}/Saving`, payload);
    return res.data;
};

// Saving - Update & Delete (NEW)
// =====================
export const updateSavingAsync = async (id, payload) => {
    const res = await axios.put(`${API_BASE_URL}/Saving/${id}`, payload);
    return res.data; // true/false
};
export const deleteSavingAsync = async (id, userId) => {
    const res = await axios.delete(`${API_BASE_URL}/Saving/${id}`, {
        params: { userId },
    });
    return res.data; // true/false
};
