import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SessionPage } from './pages/Session';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminSessionView } from './pages/AdminSessionView';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SessionPage />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/session/:id" element={<AdminSessionView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
