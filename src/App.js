import './App.css';
import './pages/Auth.css';
import './pages/Page.css';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useState, useEffect } from 'react';
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
import Statistics from './pages/admin/Statistics';
import Settings from './pages/admin/Settings';
import ManageCategories from './pages/admin/ManageCategories';
import VehicleManager from './pages/admin/VehicleManager';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import Categories from './pages/Categories';
import Footer from './pages/Footer';
import SearchOverlay from './components/SearchOverlay';
import ScrollToTop from './components/ScrollToTop';
import { useAuth } from './context/AuthContext';
import { auth } from './firebase';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user } = useAuth(); // Correctly get the user from context

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = '';
  };

  const toggleSearch = (e) => {
    e.preventDefault();
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <HelmetProvider>
      <Router>
        <ScrollToTop />
        <div className="App">
          <nav className="navbar">
            <Link to="/" className="navbar-brand">
              <img src="/logo.png" alt="Sabari Cars" />
              Sabari Cars
            </Link>

            <div className="navbar-links">
              <Link to="/">Home</Link>
              <Link to="/categories">Categories</Link>
              <Link to="/wishlist">Wishlist</Link>
              <Link to="/profile">Profile</Link>
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/request-vehicle" className="desktop-only">Request Vehicle</Link>
              <Link to="/sell-vehicle" className="desktop-only">Sell Vehicle</Link>
              {!user ? (
                <Link to="/login" className="login-btn">Login</Link>
              ) : (
                <button className="logout-btn" onClick={() => auth.signOut()}>Logout</button>
              )}
            </div>

            <button
              className={`hamburger ${isMenuOpen ? 'active' : ''}`}
              onClick={toggleMenu}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </button>
          </nav>
          {/* Mobile Menu Drawer */}
          <div className={`drawer ${isMenuOpen ? 'open' : ''}`}>
            <Link to="/" onClick={closeMenu}>Home</Link>
            <Link to="/categories" onClick={closeMenu}>Categories</Link>
            <Link to="/wishlist" onClick={closeMenu}>Wishlist</Link>
            <Link to="/profile" onClick={closeMenu}>Profile</Link>
            <Link to="/about" onClick={closeMenu}>About Us</Link>
            <Link to="/contact" onClick={closeMenu}>Contact Us</Link>
            <Link to="/request-vehicle" onClick={closeMenu}>Request a Vehicle</Link>
            <Link to="/sell-vehicle" onClick={closeMenu}>Sell Your Vehicle</Link>
            {!user ? (
              <Link to="/login" className="login-btn" onClick={closeMenu}>Login</Link>
            ) : (
              <button className="logout-btn" onClick={() => { auth.signOut(); closeMenu(); }}>Logout</button>
            )}
          </div>
          <div
            className={`drawer-backdrop ${isMenuOpen ? 'active' : ''}`}
            onClick={closeMenu}
            aria-hidden="true"
          />
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
              }>
                <Route index element={<AdminPanel />} />
                <Route path="vehicles" element={<AdminPanel />} />
                <Route path="categories" element={<AdminPanel />} />
              </Route>

              {/* Keep old routes for backward compatibility */}
              <Route path="/admin" element={
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
              <Route path="/admin/register-admin" element={
                <AdminRoute>
                  <RegisterAdmin />
                </AdminRoute>
              } />
              <Route path="/admin/statistics" element={
                <AdminRoute>
                  <Statistics />
                </AdminRoute>
              } />
              <Route path="/admin/settings" element={
                <AdminRoute>
                  <Settings />
                </AdminRoute>
              } />
              <Route path="/admin/manage-categories" element={
                <AdminRoute>
                  <ManageCategories />
                </AdminRoute>
              } />
              <Route path="/admin/manage-vehicles" element={
                <AdminRoute>
                  <VehicleManager />
                </AdminRoute>
              } />
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
    </HelmetProvider>
  );
}

export default App;