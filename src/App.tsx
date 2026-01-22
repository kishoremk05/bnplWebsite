import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";
import CustomerOverview from "./pages/customer/Overview";
import CustomerPlans from "./pages/customer/Plans";
import CustomerPayments from "./pages/customer/Payments";
import CustomerPaymentMethods from "./pages/customer/PaymentMethods";
import CustomerKYC from "./pages/customer/KYC";
import CustomerProfile from "./pages/customer/Profile";
import MerchantOverview from "./pages/merchant/Overview";
import MerchantTransactions from "./pages/merchant/Transactions";
import MerchantRequests from "./pages/merchant/Requests";
import MerchantAnalytics from "./pages/merchant/Analytics";
import MerchantSettings from "./pages/merchant/Settings";
import AdminOverview from "./pages/admin/Overview";
import AdminUsers from "./pages/admin/Users";
import AdminApprovals from "./pages/admin/Approvals";
import AdminKYCReview from "./pages/admin/KYCReview";
import AdminMerchantApproval from "./pages/admin/MerchantApproval";
import AdminTransactions from "./pages/admin/Transactions";
import AdminCompliance from "./pages/admin/Compliance";
import AdminSettings from "./pages/admin/Settings";
import CheckoutPage from "./pages/CheckoutPage";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CheckoutCancel from "./pages/CheckoutCancel";
import MerchantIntegration from "./pages/merchant/Integration";
import MerchantCustomers from "./pages/merchant/Customers";
import MerchantPayouts from "./pages/merchant/Payouts";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* Premium glow frame effect (Zip.co style) */}
          <div className="fixed inset-0 pointer-events-none z-[9999]">
            <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(139,92,246,0.12),inset_0_0_60px_rgba(99,102,241,0.08)]" />
          </div>
          
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            
            {/* Checkout Routes (Public) */}
            <Route path="/checkout/:sessionToken" element={<CheckoutPage />} />
            <Route path="/checkout/success/:sessionToken" element={<CheckoutSuccess />} />
            <Route path="/checkout/cancel/:sessionToken" element={<CheckoutCancel />} />
            
            {/* Customer Routes */}
            <Route path="/customer/dashboard" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerOverview />
              </ProtectedRoute>
            } />
            <Route path="/customer/plans" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerPlans />
              </ProtectedRoute>
            } />
            <Route path="/customer/payments" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerPayments />
              </ProtectedRoute>
            } />
            <Route path="/customer/payment-methods" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerPaymentMethods />
              </ProtectedRoute>
            } />
            <Route path="/customer/kyc" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerKYC />
              </ProtectedRoute>
            } />
            <Route path="/customer/profile" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerProfile />
              </ProtectedRoute>
            } />
            
            {/* Merchant Routes */}
            <Route path="/merchant/dashboard" element={
              <ProtectedRoute allowedRoles={['merchant']}>
                <MerchantOverview />
              </ProtectedRoute>
            } />
            <Route path="/merchant/transactions" element={
              <ProtectedRoute allowedRoles={['merchant']}>
                <MerchantTransactions />
              </ProtectedRoute>
            } />
            <Route path="/merchant/requests" element={
              <ProtectedRoute allowedRoles={['merchant']}>
                <MerchantRequests />
              </ProtectedRoute>
            } />
            <Route path="/merchant/analytics" element={
              <ProtectedRoute allowedRoles={['merchant']}>
                <MerchantAnalytics />
              </ProtectedRoute>
            } />
            <Route path="/merchant/settings" element={
              <ProtectedRoute allowedRoles={['merchant']}>
                <MerchantSettings />
              </ProtectedRoute>
            } />
            <Route path="/merchant/integration" element={
              <ProtectedRoute allowedRoles={['merchant']}>
                <MerchantIntegration />
              </ProtectedRoute>
            } />
            <Route path="/merchant/customers" element={
              <ProtectedRoute allowedRoles={['merchant']}>
                <MerchantCustomers />
              </ProtectedRoute>
            } />
            <Route path="/merchant/payouts" element={
              <ProtectedRoute allowedRoles={['merchant']}>
                <MerchantPayouts />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminOverview />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/kyc-review" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminKYCReview />
              </ProtectedRoute>
            } />
            <Route path="/admin/merchant-approvals" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminMerchantApproval />
              </ProtectedRoute>
            } />
            <Route path="/admin/transactions" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminTransactions />
              </ProtectedRoute>
            } />
            <Route path="/admin/approvals" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminApprovals />
              </ProtectedRoute>
            } />
            <Route path="/admin/compliance" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminCompliance />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSettings />
              </ProtectedRoute>
            } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
