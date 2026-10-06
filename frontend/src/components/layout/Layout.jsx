import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import QrisModal from '@/components/qris/QrisModal';
import RegistrationModal from '@/components/registrations/RegistrationModal';
import WAMessagePreviewModal from '@/components/whatsapp/WAMessagePreviewModal';
import { request } from '@/utils/request';
import { API_ENDPOINTS } from '@/utils/endpoints';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isQrisOpen, setIsQrisOpen] = useState(false);
  const [isNewVisitOpen, setIsNewVisitOpen] = useState(false);
  const [preselectedPatient, setPreselectedPatient] = useState(null);
  const [config, setConfig] = useState({});

  // WhatsApp Modal state
  const [waModalState, setWaModalState] = useState({
    isOpen: false,
    initialType: 'invoice_homevisit',
    visit: null,
    patient: null,
  });

  useEffect(() => {
    fetchClinicConfig();
  }, []);

  const fetchClinicConfig = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.CONFIG.GET);
      if (res.success && res.data) {
        setConfig(res.data);
      }
    } catch (err) {
      console.warn('Could not load clinic config:', err);
    }
  };

  const handleOpenWAMessage = ({ visit, patient, type = 'invoice_homevisit' }) => {
    setWaModalState({
      isOpen: true,
      initialType: type,
      visit,
      patient
    });
  };

  const handleOpenNewVisit = (patient = null) => {
    setPreselectedPatient(patient);
    setIsNewVisitOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FFF9FB] flex">
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#ffffff',
            color: '#1e293b',
            fontSize: '13px',
            fontWeight: '600',
            borderRadius: '16px',
            border: '1px solid #FCE7F3',
            boxShadow: '0 10px 25px -5px rgba(190, 24, 93, 0.15)',
            padding: '12px 18px',
          },
          success: {
            iconTheme: {
              primary: '#0D9488',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#E11D48',
              secondary: '#ffffff',
            },
          },
        }}
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenQris={() => setIsQrisOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenNewVisit={() => handleOpenNewVisit(null)}
          onOpenQris={() => setIsQrisOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet
            context={{
              config,
              onOpenQris: () => setIsQrisOpen(true),
              onOpenNewVisit: handleOpenNewVisit,
              onOpenWAMessage: handleOpenWAMessage,
              refreshConfig: fetchClinicConfig
            }}
          />
        </main>
      </div>

      {/* Global QRIS Modal */}
      <QrisModal
        isOpen={isQrisOpen}
        onClose={() => setIsQrisOpen(false)}
        config={config}
      />

      {/* Global Registration / Homevisit Modal */}
      <RegistrationModal
        isOpen={isNewVisitOpen}
        onClose={() => {
          setIsNewVisitOpen(false);
          setPreselectedPatient(null);
        }}
        preselectedPatient={preselectedPatient}
        onTriggerWAMessage={({ visit, patient }) => {
          handleOpenWAMessage({ visit, patient });
        }}
      />

      {/* Global WhatsApp Message Modal */}
      <WAMessagePreviewModal
        isOpen={waModalState.isOpen}
        onClose={() => setWaModalState(prev => ({ ...prev, isOpen: false }))}
        initialType={waModalState.initialType}
        visit={waModalState.visit}
        patient={waModalState.patient}
        config={config}
      />
    </div>
  );
}
