import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import PublicNavbar from "./PublicNavbar";
import Footer from "../pages/Footer";


function PublicLayout() {
    useEffect(() => {
        document.body.classList.add("public-page");
        return () => document.body.classList.remove("public-page");
    }, []);

    return (
        <>
            <PublicNavbar />
            <main className="p-0 m-0">
                <Outlet />
            </main>
            <Footer />
        </>
    );
}

export default PublicLayout;