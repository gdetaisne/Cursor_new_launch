import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { FoldersPage } from '../pages/FoldersPage';
import { FolderDetailPage } from '../pages/FolderDetailPage';
import { QuotesPage } from '../pages/QuotesPage';
import { QuoteDetailPage } from '../pages/QuoteDetailPage';
import { MoversPage } from '../pages/MoversPage';
import { DesignSystemPage } from '../pages/DesignSystemPage';

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
          <Route path="clients" element={<div>Clients (Coming soon)</div>} />
          <Route path="leads" element={<div>Leads (Coming soon)</div>} />
          <Route path="payments" element={<div>Paiements (Coming soon)</div>} />
          <Route path="logs" element={<div>Logs (Coming soon)</div>} />
          <Route path="emails" element={<div>Emails (Coming soon)</div>} />
          <Route path="settings" element={<div>Paramètres (Coming soon)</div>} />
          <Route path="design-system" element={<DesignSystemPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<div>404 - Page not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

