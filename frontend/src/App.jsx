import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Profile from './pages/Profile';
import TweetDetail from './pages/TweetDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';
import { useAuth } from './AuthProvider.jsx';
import Search from './pages/Search.jsx';
function App() {
  const { user } = useAuth();
  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to="/" /> : <Login />
        } />
        <Route path="/register" element={
          user ? <Navigate to="/" /> : <Register />
        } />
        <Route element={user ? <Layout /> : <Navigate to="/login" />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/tweet/:tweetId" element={<TweetDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/search/:query" element={<Search />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
