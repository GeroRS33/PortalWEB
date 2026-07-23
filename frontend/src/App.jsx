import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { UserProvider } from './context/UserContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';

// Guards & Layouts
import ProtectedRoute from './components/ProtectedRoute';
import ClienteLayout from './layouts/ClienteLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import Login from './pages/Login';

// Client Pages
import Home from './pages/cliente/Home';
import NuevoPedido from './pages/cliente/NuevoPedido';
import MisPedidos from './pages/cliente/MisPedidos';
import DetallePedido from './pages/cliente/DetallePedido';
import MiStock from './pages/cliente/MiStock';
import Novedades from './pages/cliente/Novedades';

// Admin Pages
import HomeAdmin from './pages/admin/HomeAdmin';
import PedidosAdmin from './pages/admin/PedidosAdmin';
import DetallePedidoAdmin from './pages/admin/DetallePedidoAdmin';
import ClientesAdmin from './pages/admin/ClientesAdmin';
import StockClienteAdmin from './pages/admin/StockClienteAdmin';
import NovedadesAdmin from './pages/admin/NovedadesAdmin';

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <CartProvider>
          <NotificationProvider>
            <Routes>
              {/* Public route */}
              <Route path="/login" element={<Login />} />

              {/* Protected Client Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute allowedRoles={['cliente']}>
                    <ClienteLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Home />} />
                <Route path="nuevo-pedido" element={<NuevoPedido />} />
                <Route path="mis-pedidos" element={<MisPedidos />} />
                <Route path="detalle-pedido/:id" element={<DetallePedido />} />
                <Route path="mi-stock" element={<MiStock />} />
                <Route path="novedades" element={<Novedades />} />
              </Route>

              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<HomeAdmin />} />
                <Route path="inicio" element={<HomeAdmin />} />
                <Route path="pedidos" element={<PedidosAdmin />} />
                <Route path="pedidos/:id" element={<DetallePedidoAdmin />} />
                <Route path="clientes" element={<ClientesAdmin />} />
                <Route path="clientes/:id/stock" element={<StockClienteAdmin />} />
                <Route path="novedades" element={<NovedadesAdmin />} />
              </Route>

              {/* Fallback Redirect */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </NotificationProvider>
        </CartProvider>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
