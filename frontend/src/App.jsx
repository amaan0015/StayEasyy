
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import HowItWorks from "./components/HowItWorks";
import AddProperty from "./pages/owner/AddProperty";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import EditProperty from "./pages/owner/EditProperty";
import OwnerEnquiries from "./pages/owner/OwnerEnquiries";

import AdminDashboard from "./pages/admin/AdminDashboard";

import RoleRoute from "./components/RoleRoute";
import SavedProperties from "./pages/SavedProperties";
import ExploreMap from "./pages/ExploreMap";
import Chat from "./pages/Chat";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/:id" element={<PropertyDetails />} />
        <Route path="/explore-map" element={<ExploreMap />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/how-it-works" element={<HowItWorks />} />

        {/* Owner routes */}
        <Route
          path="/owner"
          element={
            <RoleRoute allowedRoles={["owner"]}>
              <OwnerDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/owner/dashboard"
          element={
            <RoleRoute allowedRoles={["owner"]}>
              <OwnerDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/owner/properties/new"
          element={
            <RoleRoute allowedRoles={["owner"]}>
              <AddProperty />
            </RoleRoute>
          }
        />
        <Route
          path="/owner/properties/:id/edit"
          element={
            <RoleRoute allowedRoles={["owner"]}>
              <EditProperty />
            </RoleRoute>
          }
        />
        <Route
          path="/owner/enquiries"
          element={
            <RoleRoute allowedRoles={["owner"]}>
              <OwnerEnquiries />
            </RoleRoute>
          }
        />

        {/* Admin route */}
        <Route
          path="/admin/dashboard"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </RoleRoute>
          }
        />

        {/* Tenant route */}
        <Route
          path="/dashboard/saved"
          element={
            <RoleRoute allowedRoles={["tenant"]}>
              <SavedProperties />
            </RoleRoute>
          }
        />

        {/* Chat route */}
        <Route
          path="/chat"
          element={
            <RoleRoute allowedRoles={["tenant", "owner"]}>
              <Chat />
            </RoleRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
