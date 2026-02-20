import { Routes, Route, Navigate, Link } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import VerifyEmail from './pages/VerifyEmail'
import VerifyOtp from './pages/VerifyOtp'
import Profile from './pages/Profile'
import AddPet from './pages/AddPet'
import PetDetails from './pages/PetDetails'
import Appointments from './pages/Appointments'
import SlotBrowser from './pages/SlotBrowser'
import Marketplace from './pages/Marketplace'
import Cart from './pages/Cart'
import OrderHistory from './pages/OrderHistory'
import EditPet from './pages/EditPet'
import UserApprovals from './pages/admin/UserApprovals'
import InventoryManagement from './pages/admin/InventoryManagement'
import SlotManagement from './pages/admin/SlotManagement'
import AdminOrders from './pages/admin/AdminOrders'
import AdminOrderDetails from './pages/admin/AdminOrderDetails'
import ContactMessages from './pages/admin/ContactMessages'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import LandingPage from './pages/LandingPage'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from './store'
import { logout, setUser } from './features/auth/authSlice'
import { userApi } from './api/userApi'
import { LogOut, Home, Calendar, ShoppingBag, Users, Package, Clock, Loader2, User, MessageSquare } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'

function App() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [appLoading, setAppLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuthenticated && !user) {
        try {
          setAppLoading(true);
          const userData = await userApi.getProfile();
          dispatch(setUser(userData));
        } catch (error) {
          console.error('Failed to fetch profile:', error);
          dispatch(logout());
        } finally {
          setAppLoading(false);
        }
      }
    };
    fetchProfile();
  }, [isAuthenticated, user, dispatch]);

  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  if (appLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <Toaster position="top-center" reverseOrder={false} />
      {isAuthenticated && (
        <nav className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-40 backdrop-blur-md bg-white/80">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/" className="text-xl font-black text-indigo-600 tracking-tighter flex items-center gap-2">
                <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">🐾</div>
                PETWELLNESS
              </Link>
              <div className="hidden md:flex items-center gap-6">
                {!isAdmin ? (
                  <>
                    <Link to="/dashboard" className="text-sm font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-2"><Home size={18} /> Dashboard</Link>
                    <Link to="/appointments" className="text-sm font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-2"><Calendar size={18} /> Appointments</Link>
                    <Link to="/marketplace" className="text-sm font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-2"><ShoppingBag size={18} /> Shop</Link>
                    <Link to="/profile" className="text-sm font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-2"><User size={18} /> Profile</Link>
                  </>
                ) : (
                  <>
                    <Link to="/admin/approvals" className="text-sm font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-2"><Users size={18} /> User Approvals</Link>
                    <Link to="/admin/orders" className="text-sm font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-2"><ShoppingBag size={18} /> Orders</Link>
                    <Link to="/admin/inventory" className="text-sm font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-2"><Package size={18} /> Inventory</Link>
                    <Link to="/admin/slots" className="text-sm font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-2"><Clock size={18} /> Slots</Link>
                    <Link to="/admin/messages" className="text-sm font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-2"><MessageSquare size={18} /> Messages</Link>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold text-slate-900">{user?.username}</span>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  {isAdmin ? '🛡️ SYSTEM ADMIN' : (user?.roles?.[0] || 'USER').replace('ROLE_', '')}
                </span>
              </div>
              <button
                onClick={() => dispatch(logout())}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </nav>
      )}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes - Common */}
          <Route path="/dashboard" element={
            isAuthenticated ? (
              isAdmin ? <Navigate to="/admin/approvals" replace /> : <Dashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          {/* User Specific */}
          <Route path="/pets/add" element={isAuthenticated && !isAdmin ? <AddPet /> : <Navigate to={isAdmin ? "/admin/approvals" : "/login"} replace />} />
          <Route path="/pets/edit/:id" element={isAuthenticated && !isAdmin ? <EditPet /> : <Navigate to={isAdmin ? "/admin/approvals" : "/login"} replace />} />
          <Route path="/pets/:id" element={isAuthenticated && !isAdmin ? <PetDetails /> : <Navigate to="/login" replace />} />
          <Route path="/appointments" element={isAuthenticated && !isAdmin ? <Appointments /> : <Navigate to="/login" replace />} />
          <Route path="/appointments/book" element={isAuthenticated && !isAdmin ? <SlotBrowser /> : <Navigate to="/login" replace />} />
          <Route path="/marketplace" element={isAuthenticated && !isAdmin ? <Marketplace /> : <Navigate to="/login" replace />} />
          <Route path="/marketplace/cart" element={isAuthenticated && !isAdmin ? <Cart /> : <Navigate to="/login" replace />} />
          <Route path="/marketplace/orders" element={isAuthenticated && !isAdmin ? <OrderHistory /> : <Navigate to="/login" replace />} />
          <Route path="/profile" element={isAuthenticated && !isAdmin ? <Profile /> : <Navigate to="/login" replace />} />

          {/* Admin Specific */}
          <Route path="/admin/approvals" element={isAuthenticated && isAdmin ? <UserApprovals /> : <Navigate to="/dashboard" replace />} />
          <Route path="/admin/inventory" element={isAuthenticated && isAdmin ? <InventoryManagement /> : <Navigate to="/dashboard" replace />} />
          <Route path="/admin/slots" element={isAuthenticated && isAdmin ? <SlotManagement /> : <Navigate to="/dashboard" replace />} />
          <Route path="/admin/orders" element={isAuthenticated && isAdmin ? <AdminOrders /> : <Navigate to="/dashboard" replace />} />
          <Route path="/admin/orders/:id" element={isAuthenticated && isAdmin ? <AdminOrderDetails /> : <Navigate to="/dashboard" replace />} />
          <Route path="/admin/messages" element={isAuthenticated && isAdmin ? <ContactMessages /> : <Navigate to="/dashboard" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
