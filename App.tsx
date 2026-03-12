import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { StoreProvider } from './context/StoreContext';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CreateDecision from './pages/CreateDecision';
import DecisionDetail from './pages/DecisionDetail';
import DoubtSelection from './pages/DoubtSelection';
import Settings from './pages/Settings';

const App: React.FC = () => {
  return (
    <StoreProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/new" element={<CreateDecision />} />
            <Route path="/doubt-selection" element={<DoubtSelection />} />
            <Route path="/decision/:id" element={<DecisionDetail />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </HashRouter>
    </StoreProvider>
  );
};

export default App;