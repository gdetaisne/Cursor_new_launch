import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { FoldersPage } from '../pages/FoldersPage';
import { FolderDetailPage } from '../pages/FolderDetailPage';
import { QuotesPage } from '../pages/QuotesPage';
import { QuoteDetailPage } from '../pages/QuoteDetailPage';
import { MoversPage } from '../pages/MoversPage';
import { MoverDetailPage } from '../pages/MoverDetailPage';
import { ClientsPage } from '../pages/ClientsPage';
import { LeadsPage } from '../pages/LeadsPage';
import { PaymentsPage } from '../pages/PaymentsPage';
import { LogsPage } from '../pages/LogsPage';
import { AutomationsPage } from '../pages/AutomationsPage';
import { EmailsPage } from '../pages/EmailsPage';
import { DesignSystemPage } from '../pages/DesignSystemPage';
import WebsitesDashboardPage from '../pages/WebsitesDashboardPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to /admin */}
        <Route path="/" element={<Navigate to="/admin" replace />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="folders" element={<FoldersPage />} />
          <Route path="folders/:folderId" element={<FolderDetailPage />} />
          <Route path="quotes" element={<QuotesPage />} />
          <Route path="quotes/:quoteId" element={<QuoteDetailPage />} />
          <Route path="movers" element={<MoversPage />} />
          <Route path="movers/:moverId" element={<MoverDetailPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="logs" element={<LogsPage />} />
          <Route path="automations" element={<AutomationsPage />} />
          <Route path="emails" element={<EmailsPage />} />
          <Route path="websites" element={<WebsitesDashboardPage />} />
          <Route path="settings" element={<div>Paramètres (Coming soon)</div>} />
          <Route path="design-system" element={<DesignSystemPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<div>404 - Page not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

