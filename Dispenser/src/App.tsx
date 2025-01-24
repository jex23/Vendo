import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SelectionPage from './pages/SelectionPage';
import PrizeSelectionPage from './pages/PrizeSelectionPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SelectionPage />} />
        <Route path="/prizes" element={<PrizeSelectionPage />} />
      </Routes>
    </Router>
  );
};

export default App;
