import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Layout.css';
import RightSidebar from './RightSidebar';

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
