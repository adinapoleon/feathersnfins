import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TranslationProvider } from './context/TranslationContext';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import CustomerPage from './pages/CustomerPage';
import ManagerPage from './pages/ManagerPage';
import CashierPage from './pages/CashierPage';
import KitchenPage from './pages/KitchenPage';
import PreviousOrdersPage from './pages/KitchenPreviousOrders';
import GoogleCallback from './pages/auth/GoogleCallback';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <TranslationProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/customer" element={<CustomerPage />} />
            <Route path="/auth/google/callback" element={<GoogleCallback />} />

            {/* Protected Routes */}
            <Route
              path="/manager"
              element={
                <ProtectedRoute>
                  <ManagerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cashier"
              element={
                <ProtectedRoute>
                  <CashierPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/kitchen"
              element={
                <ProtectedRoute>
                  <KitchenPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/previous-orders"
              element={
                <ProtectedRoute>
                  <PreviousOrdersPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </TranslationProvider>
    </AuthProvider>
  );
}

export default App;