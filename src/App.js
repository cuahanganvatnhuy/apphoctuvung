import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { VocabularyProvider } from './context/VocabularyContext';
import './App.css';

// Import components
import AddWord from './components/AddWord/AddWord';
import WordList from './components/WordList/WordList';
import Quiz from './components/Quiz/Quiz';
import SliderView from './components/SliderView/SliderView';
import Dashboard from './components/Dashboard/DashboardNew';
import LuyenTap from './pages/LuyenTap/LuyenTap';
import Sidebar from './components/Sidebar/Sidebar';

// Import Essay components
import Essay from './pages/Essay/Essay';
import AddEssay from './pages/Essay/AddEssay';
import EssayDetail from './pages/Essay/EssayDetail';
import EditEssay from './pages/Essay/EditEssay';

const Home = () => (
  <div className="home-page">
    <div className="container">
      <h1>Chào mừng đến với Volaloba</h1>
      <p>Ứng dụng học từ vựng tiếng Anh hiệu quả</p>
    </div>
  </div>
);

const SliderNavigation = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  
  const tabs = [
    { path: '/add', label: 'Thêm từ mới' },
    { path: '/list', label: 'Danh sách' },
    { path: '/slider', label: 'Học từ' },
    { path: '/quiz', label: 'Kiểm tra' }
  ];

  useEffect(() => {
    // Update active tab based on current path
    const currentTabIndex = tabs.findIndex(tab => tab.path === location.pathname);
    if (currentTabIndex !== -1) {
      setActiveTab(currentTabIndex);
      updateIndicator(currentTabIndex);
    } else if (location.pathname === '/') {
      setActiveTab(-1); // Home page
    }
  }, [location.pathname, tabs]);

  const updateIndicator = (tabIndex) => {
    const navLinks = document.querySelectorAll('.nav-links a');
    if (navLinks[tabIndex]) {
      const { offsetLeft, offsetWidth } = navLinks[tabIndex];
      setIndicatorStyle({
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`,
        opacity: 1
      });
    }
  };

  const handleMouseEnter = (e, index) => {
    if (activeTab !== index) {
      const { offsetLeft, offsetWidth } = e.target;
      setIndicatorStyle({
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`,
        opacity: 0.7
      });
    }
  };

  const handleMouseLeave = () => {
    if (activeTab >= 0) {
      updateIndicator(activeTab);
    } else {
      setIndicatorStyle({ opacity: 0 });
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="slider-nav">
      <Link to="/" className="logo">Volaloba</Link>
      <div className="nav-links">
        {tabs.map((tab, index) => (
          <Link 
            key={tab.path}
            to={tab.path}
            className={isActive(tab.path)}
            onMouseEnter={(e) => handleMouseEnter(e, index)}
            onMouseLeave={handleMouseLeave}
          >
            {tab.label}
          </Link>
        ))}
        <span className="nav-indicator" style={indicatorStyle}></span>
      </div>
    </nav>
  );
};

function App() {
  return (
    <VocabularyProvider>
      <Router>
        <div className="app">
          <Sidebar />
          <div className="main-content">
            <main>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/list" element={<WordList />} />
                <Route path="/add" element={<AddWord />} />
                <Route path="/slider" element={<SliderView />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/luyen-tap" element={<LuyenTap />} />
                
                {/* Essay Management Routes */}
                <Route path="/essays" element={<Essay />} />
                <Route path="/essays/add" element={<AddEssay />} />
                <Route path="/essays/:id" element={<EssayDetail />} />
                <Route path="/essays/edit/:id" element={<EditEssay />} />
              </Routes>
            </main>
            <footer>
              <p> {new Date().getFullYear()} Volaloba - Ứng dụng học từ vựng</p>
            </footer>
          </div>
        </div>
      </Router>
    </VocabularyProvider>
  );
}

export default App;
