import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import AsistenteDrawer from '../components/AsistenteDrawer';

const ClienteLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="app-layout-container">
      <Header 
        onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)} 
      />
      <div className="app-layout-body">
        <Sidebar 
          isOpen={mobileMenuOpen} 
          onClose={() => setMobileMenuOpen(false)} 
        />
        <main className="app-layout-content">
          <Outlet />
        </main>
      </div>

      {/* Asistente WEB AI Floating Button & Lateral Drawer */}
      <AsistenteDrawer />
    </div>
  );
};

export default ClienteLayout;
