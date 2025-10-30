import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Login from './components/auth/Login';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Albums from './pages/Albums';
import Artists from './pages/Artists';
import Tracks from './pages/Tracks';
import Invoices from './pages/Invoices';
import Offers from './pages/Offers';
import Tutorials from './pages/Tutorials';
import ConnectionsPage from './pages/ConnectionsPage';
import Settings from './pages/Settings';
import Reports from './pages/Reports';

const AppContent: React.FC = () => {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <Login />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/albums" element={<Albums />} />
          <Route path="/artists" element={<Artists />} />
          <Route path="/tracks" element={<Tracks />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/tutorials" element={<Tutorials />} />
          <Route path="/connections" element={<ConnectionsPage />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;