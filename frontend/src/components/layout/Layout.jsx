import { Outlet } from 'react-router-dom';
import './Layout.css';
import RightSidebar from './RightSidebar';
import Sidebar from './Sidebar.jsx'

function Layout() {
    return (
        <div className="layout">
            <Sidebar />
            <main className="main-content">
                <Outlet />
            </main>
            <RightSidebar />
        </div>
    );
}

export default Layout;
