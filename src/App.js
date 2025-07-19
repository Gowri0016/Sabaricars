import './App.css';
import './pages/Auth.css';
import './pages/Page.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home, About, Contact, Login, Signup } from './pages';
import CarDetails from './pages/CarDetails';
import Footer from './pages/Footer';
import { useEffect, useState } from 'react';
import { auth } from './firebase';



function App() {
  const [user, setUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
  const handleDrawerClose = () => setDrawerOpen(false);

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="navbar-brand">Sabari Cars</div>
          <div className="navbar-links desktop-only">
            <Link to="/">Home</Link>
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
          <Link to="/about" onClick={handleDrawerClose}>About Us</Link>
          <Link to="/contact" onClick={handleDrawerClose}>Contact Us</Link>
          {!user && <Link to="/login" onClick={handleDrawerClose}>Login</Link>}
          {user && <button className="logout-btn" onClick={() => {auth.signOut(); handleDrawerClose();}}>Logout</button>}
        </div>
        {drawerOpen && <div className="drawer-backdrop" onClick={handleDrawerClose}></div>}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/car/:id" element={<CarDetails />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
