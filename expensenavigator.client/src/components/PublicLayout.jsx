import { Outlet } from "react-router-dom";
import PublicNavbar from "./PublicNavbar";

function PublicLayout() {
    return (
        <>
            <PublicNavbar />
            <main style={{ padding: "40px" }}>
                <Outlet />
            </main>
        </>
    );
}

export default PublicLayout;