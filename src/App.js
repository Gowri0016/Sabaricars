import './App.css';
import './pages/Auth.css';
import './pages/Page.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home, About, Contact, Login, Signup } from './pages';
import ProfileComplete from './pages/ProfileComplete';
import VehicleDetails from './pages/VehicleDetails';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';
import AddCategory from './pages/AddCategory';
import AddVehicle from './pages/AddVehicle';
import RegisterAdmin from './pages/RegisterAdmin';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import Search from './pages/Search';
import Categories from './pages/Categories';
import Footer from './pages/Footer';
import { useAuth } from './context/AuthContext';
import { useState } from 'react';
import { auth } from './firebase';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { AuthProvider } from './context/AuthContext';



function App() {
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
  const handleDrawerClose = () => setDrawerOpen(false);

  const handleSearch = async (query) => {
    // Sample search logic: filter vehicles by name (could be improved)
    const querySnapshot = await getDocs(collection(db, 'vehicleDetails'));
    const matches = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      if (data.name && data.name.toLowerCase().includes(query.toLowerCase())) {
        matches.push({ id: doc.id, ...data });
      }
    });
    setSearchResults(matches);
    setShowSearch(false);
  };

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="navbar-brand">Sabari Cars</div>
          <div className="navbar-links desktop-only">
            <Link to="/">Home</Link>
            <Link to="/categories">Categories</Link>
            <Link to="/wishlist">Wishlist</Link>
            <Link to="/profile">Profile</Link>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact Us</Link>
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
          {!user && <Link to="/login" onClick={handleDrawerClose}>Login</Link>}
          {user && <button className="logout-btn" onClick={() => {auth.signOut(); handleDrawerClose();}}>Logout</button>}
        </div>
        {drawerOpen && <div className="drawer-backdrop" onClick={handleDrawerClose}></div>}
        {showSearch && <Search onSearch={handleSearch} />}
        <main>
          <Routes>
            <Route path="/" element={<Home searchResults={searchResults} />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/vehicle/:id" element={<VehicleDetails />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/add-category" element={<AddCategory />} />
            <Route path="/admin/add-vehicle" element={<AddVehicle />} />
            <Route path="/register-admin" element={<RegisterAdmin />} />
            <Route path="/search" element={<Search onSearch={handleSearch} />} />
            <Route path="/profile-complete" element={<ProfileComplete />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
