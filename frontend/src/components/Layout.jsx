import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Layout.css';

function Layout({ user, onLogout, onUserUpdate }) {
    return (
        <div className="layout">
            <Sidebar user={user} onLogout={onLogout} onUserUpdate={onUserUpdate} />
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;
