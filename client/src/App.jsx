import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout.jsx';
import { LandingPage } from './pages/LandingPage.jsx';
import { LaboratoriesPage } from './pages/LaboratoriesPage.jsx';
import { PhysicsLabPage } from './pages/PhysicsLabPage.jsx';
import { ExperimentWorkspacePage } from './pages/ExperimentWorkspacePage.jsx';
import { ReportsPage } from './pages/ReportsPage.jsx';
import { ReportDetailPage } from './pages/ReportDetailPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/labs" element={<LaboratoriesPage />} />
          <Route path="/labs/physics" element={<PhysicsLabPage />} />
          <Route path="/labs/physics/:experimentId" element={<ExperimentWorkspacePage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/:reportId" element={<ReportDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
