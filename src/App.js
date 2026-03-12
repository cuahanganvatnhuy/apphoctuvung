import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { VocabularyProvider } from './context/VocabularyContext';
import './App.css';

// Import components
import AddWord from './components/AddWord/AddWord';
import WordList from './components/WordList/WordList';
import Quiz from './components/Quiz/Quiz';
import SliderView from './components/SliderView/SliderView';
import Dashboard from './components/Dashboard/DashboardNew';
import LuyenTap from './pages/LuyenTap/LuyenTap';
import HocTuVung from './pages/HocTuVung/HocTuVung';
import Sidebar from './components/Sidebar/Sidebar';

// Import Essay components
import Essay from './pages/Essay/Essay';
import AddEssay from './pages/Essay/AddEssay';
import EssayDetail from './pages/Essay/EssayDetail';
import EditEssay from './pages/Essay/EditEssay';
import EssayCategories from './pages/Essay/EssayCategories';
import AddEssayCategory from './pages/Essay/AddEssayCategory';
import EditEssayCategory from './pages/Essay/EditEssayCategory';

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
                <Route path="/hoc-tu-vung" element={<HocTuVung />} />
                
                {/* Essay Management Routes */}
                <Route path="/essays" element={<Essay />} />
                <Route path="/essays/add" element={<AddEssay />} />
                <Route path="/essays/:id" element={<EssayDetail />} />
                <Route path="/essays/edit/:id" element={<EditEssay />} />
                
                {/* Essay Category Management Routes */}
                <Route path="/essay-categories" element={<EssayCategories />} />
                <Route path="/essay-categories/add" element={<AddEssayCategory />} />
                <Route path="/essay-categories/edit/:id" element={<EditEssayCategory />} />
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
