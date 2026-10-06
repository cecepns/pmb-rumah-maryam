import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import Layout from '@/components/layout/Layout';
import DashboardPage from '@/pages/DashboardPage';
import PatientsPage from '@/pages/PatientsPage';
import ServicesPage from '@/pages/ServicesPage';
import RegistrationsPage from '@/pages/RegistrationsPage';
import FinancePage from '@/pages/FinancePage';
import InvoicesPage from '@/pages/InvoicesPage';
import SettingsPage from '@/pages/SettingsPage';
import UsersPage from '@/pages/UsersPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Application Routes (Wajib Login) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="pasien" element={<PatientsPage />} />
            <Route path="kunjungan" element={<RegistrationsPage />} />
            <Route path="layanan" element={<ServicesPage />} />
            <Route path="keuangan" element={<FinancePage />} />
            <Route path="tagihan" element={<InvoicesPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="pengaturan" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
