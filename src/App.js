import './App.css';
import './pages/Auth.css';
import './pages/Page.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home, About, Contact, Login, Signup } from './pages';
import RequestVehicle from './pages/RequestVehicle';
import SellVehicle from './pages/SellVehicle';
import ProfileComplete from './pages/ProfileComplete';
import VehicleDetails from './pages/VehicleDetails';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';
import AddCategory from './pages/AddCategory';
import AddVehicle from './pages/AddVehicle';
import RegisterAdmin from './pages/RegisterAdmin';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import Categories from './pages/Categories';
import Footer from './pages/Footer';
import SearchOverlay from './components/SearchOverlay';

import { useAuth } from './context/AuthContext';
import { useState } from 'react';
import { auth } from './firebase';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { AuthProvider } from './context/AuthContext';

// Helper component for admin route protection
function AdminRoute({ children }) {
  const { user } = useAuth();
  // Check if user is logged in and has admin email
  const isAdmin = user && user.email === 'sabaricarsanthiyur9996@gmail.com';
  
  if (!user) {
    return <AdminLogin />;
  }
  
  if (!isAdmin) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You don't have permission to access the admin panel.</p>
      </div>
    );
  }
  
  return children;
}



function App() {
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setIsSearchOpen(false);
  };

  const toggleSearch = (e) => {
    e.preventDefault();
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="navbar-brand">
            <img src="/logo.png" alt="Sabari Cars Logo" style={{height: '38px', width: '38px', borderRadius: '50%', objectFit: 'cover', verticalAlign: 'middle', marginRight: '10px'}} />
            Sabari Cars
          </div>
          <div className="navbar-links desktop-only">
            <Link to="/">Home</Link>
            <Link to="/categories">Categories</Link>
            <Link to="/wishlist">Wishlist</Link>
            <Link to="/profile">Profile</Link>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/request-vehicle">Request a Vehicle</Link>
            <Link to="/sell-vehicle">Sell Your Vehicle</Link>
            {!user && <Link to="/login">Login</Link>}
            {user && <button className="logout-btn" onClick={() => auth.signOut()}>Logout</button>}
          </div>
          <button className="hamburger mobile-only" onClick={handleDrawerToggle} aria-label="Open menu">
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
        </nav>
        <div className={`drawer ${drawerOpen ? 'open' : ''}`}>
          <button className="close-btn" onClick={handleDrawerClose} aria-label="Close menu">&times;</button>
          <Link to="/" onClick={handleDrawerClose}>Home</Link>
          <Link to="/categories" onClick={handleDrawerClose}>Categories</Link>
          <Link to="/wishlist" onClick={handleDrawerClose}>Wishlist</Link>
          <Link to="/profile" onClick={handleDrawerClose}>Profile</Link>
          <Link to="/about" onClick={handleDrawerClose}>About Us</Link>
          <Link to="/contact" onClick={handleDrawerClose}>Contact Us</Link>
          <Link to="/request-vehicle" onClick={handleDrawerClose}>Request a Vehicle</Link>
          <Link to="/sell-vehicle" onClick={handleDrawerClose}>Sell Your Vehicle</Link>
          {!user && <Link to="/login" onClick={handleDrawerClose}>Login</Link>}
          {user && <button className="logout-btn" onClick={() => {auth.signOut(); handleDrawerClose();}}>Logout</button>}
        </div>
        {drawerOpen && <div className="drawer-backdrop" onClick={handleDrawerClose}></div>}
        <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/vehicle/:id" element={<VehicleDetails />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-panel" element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            } />
            <Route path="/admin/add-category" element={
              <AdminRoute>
                <AddCategory />
              </AdminRoute>
            } />
            <Route path="/admin/add-vehicle" element={
              <AdminRoute>
                <AddVehicle />
              </AdminRoute>
            } />
            <Route path="/register-admin" element={<RegisterAdmin />} />
            <Route path="/profile-complete" element={<ProfileComplete />} />
            <Route path="/request-vehicle" element={<RequestVehicle />} />
            <Route path="/sell-vehicle" element={<SellVehicle />} />
          </Routes>
        </main>
        <Footer />
        {/* Mobile Bottom Navigation */}
        <div className="bottom-nav">
          <Link to="/" className="bottom-nav-item">
            <span className="nav-icon">🏠</span>
            <span>Home</span>
          </Link>
          <Link to="/categories" className="bottom-nav-item">
            <span className="nav-icon">📑</span>
            <span>Categories</span>
          </Link>
          <Link to={{ pathname: '/' }} state={{ focusSearch: true }} className="bottom-nav-item">
            <span className="nav-icon">🔍</span>
            <span>Search</span>
          </Link>
          <Link to="/wishlist" className="bottom-nav-item">
            <span className="nav-icon">❤️</span>
            <span>Wishlist</span>
          </Link>
          <Link to="/request-vehicle" className="bottom-nav-item">
            <span className="nav-icon">🚗</span>
            <span>Request Vehicle</span>
          </Link>
          <Link to="/sell-vehicle" className="bottom-nav-item">
            <span className="nav-icon">💸</span>
            <span>Sell Vehicle</span>
          </Link>
        </div>
      </div>
    </Router>
  );
}

export default App;
