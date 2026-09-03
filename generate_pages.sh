#!/bin/bash

# A script to generate the basic frontend pages to get it compiling

cat << 'INNER_EOF' > frontend/src/pages/Login.tsx
import React from 'react';
export default function Login() { return <div>Login Page</div>; }
INNER_EOF

cat << 'INNER_EOF' > frontend/src/pages/Register.tsx
import React from 'react';
export default function Register() { return <div>Register Page</div>; }
INNER_EOF

cat << 'INNER_EOF' > frontend/src/pages/HospitalDashboard.tsx
import React from 'react';
export default function HospitalDashboard() { return <div>Hospital Dashboard</div>; }
INNER_EOF

cat << 'INNER_EOF' > frontend/src/pages/BloodBankDashboard.tsx
import React from 'react';
export default function BloodBankDashboard() { return <div>Blood Bank Dashboard</div>; }
INNER_EOF

cat << 'INNER_EOF' > frontend/src/pages/BloodRequest.tsx
import React from 'react';
export default function BloodRequest() { return <div>Blood Request</div>; }
INNER_EOF

cat << 'INNER_EOF' > frontend/src/pages/RequestStatus.tsx
import React from 'react';
export default function RequestStatus() { return <div>Request Status</div>; }
INNER_EOF

cat << 'INNER_EOF' > frontend/src/pages/Inventory.tsx
import React from 'react';
export default function Inventory() { return <div>Inventory Management</div>; }
INNER_EOF

cat << 'INNER_EOF' > frontend/src/pages/RequestsManagement.tsx
import React from 'react';
export default function RequestsManagement() { return <div>Requests Management</div>; }
INNER_EOF

cat << 'INNER_EOF' > frontend/src/pages/EmergencyPanel.tsx
import React from 'react';
export default function EmergencyPanel() { return <div>Emergency Panel</div>; }
INNER_EOF

cat << 'INNER_EOF' > frontend/src/pages/ContactsManager.tsx
import React from 'react';
export default function ContactsManager() { return <div>Contacts Manager</div>; }
INNER_EOF

cat << 'INNER_EOF' > frontend/src/pages/DonationRecord.tsx
import React from 'react';
export default function DonationRecord() { return <div>Donation Record</div>; }
INNER_EOF

cat << 'INNER_EOF' > frontend/src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import HospitalDashboard from './pages/HospitalDashboard';
import BloodBankDashboard from './pages/BloodBankDashboard';
import BloodRequest from './pages/BloodRequest';
import RequestStatus from './pages/RequestStatus';
import Inventory from './pages/Inventory';
import RequestsManagement from './pages/RequestsManagement';
import EmergencyPanel from './pages/EmergencyPanel';
import ContactsManager from './pages/ContactsManager';
import DonationRecord from './pages/DonationRecord';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <div className="flex-1 container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
              <Route path="/hospital/request" element={<BloodRequest />} />
              <Route path="/hospital/requests" element={<RequestStatus />} />
              <Route path="/bloodbank/dashboard" element={<BloodBankDashboard />} />
              <Route path="/bloodbank/inventory" element={<Inventory />} />
              <Route path="/bloodbank/requests" element={<RequestsManagement />} />
              <Route path="/bloodbank/emergency" element={<EmergencyPanel />} />
              <Route path="/bloodbank/contacts" element={<ContactsManager />} />
              <Route path="/bloodbank/donations" element={<DonationRecord />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
INNER_EOF
