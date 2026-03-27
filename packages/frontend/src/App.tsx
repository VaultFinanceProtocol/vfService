import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@components/providers/theme-provider';
import { WalletProvider } from '@contexts/wallet-context';
import { Layout } from '@components/layout/Layout';
import { MarketsPage } from '@pages/MarketsPage';
import { MarketDetailPage } from '@pages/MarketDetailPage';
// Legacy page imports removed - functionality moved to Markets Modal
import { PositionsPage } from '@pages/PositionsPage';
import { LiquidationsPage } from '@pages/LiquidationsPage';
import { HistoryPage } from '@pages/HistoryPage';

const swrConfig = {
  refreshInterval: 30000,
  revalidateOnFocus: true,
  errorRetryCount: 3,
};

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <WalletProvider>
        <SWRConfig value={swrConfig}>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/markets" replace />} />
                <Route path="/markets" element={<MarketsPage />} />
                <Route path="/markets/:asset" element={<MarketDetailPage />} />
                {/* Legacy routes redirect to Markets */}
                <Route path="/earn" element={<Navigate to="/markets" replace />} />
                <Route path="/supply" element={<Navigate to="/markets" replace />} />
                <Route path="/supply/:asset" element={<Navigate to="/markets" replace />} />
                <Route path="/borrow" element={<Navigate to="/markets" replace />} />
                <Route path="/borrow/:asset" element={<Navigate to="/markets" replace />} />
                <Route path="/positions" element={<PositionsPage />} />
                <Route path="/liquidations" element={<LiquidationsPage />} />
                <Route path="/history" element={<HistoryPage />} />
              </Routes>
            </Layout>
            <Toaster position="top-right" />
          </Router>
        </SWRConfig>
      </WalletProvider>
    </ThemeProvider>
  );
}

export default App;
