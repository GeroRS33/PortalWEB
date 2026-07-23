import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const AdminLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="app-layout-container admin-theme">
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
    </div>
  );
};

export default AdminLayout;
