import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@components/providers/theme-provider';
import { WalletProvider } from '@contexts/wallet-context';
import { Layout } from '@components/layout/Layout';
import { MarketsPage } from '@pages/MarketsPage';
import { MarketDetailPage } from '@pages/MarketDetailPage';
import { EarnPage } from '@pages/EarnPage';
import { BorrowPage } from '@pages/BorrowPage';
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
    <ThemeProvider defaultTheme="light">
      <WalletProvider>
        <SWRConfig value={swrConfig}>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/markets" replace />} />
                <Route path="/markets" element={<MarketsPage />} />
                <Route path="/markets/:asset" element={<MarketDetailPage />} />
                <Route path="/earn" element={<EarnPage />} />
                <Route path="/borrow" element={<BorrowPage />} />
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
