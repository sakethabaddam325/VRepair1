import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { CanvasThemeProvider } from 'cds-mui-theme';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme.js';
import { AppProvider, useAppContext } from './contexts/AppContext.jsx';
import { GroupSearchProvider } from './contexts/GroupSearchContext.jsx';
import { TabsProvider } from './contexts/TabsContext.jsx';
import TopPanel from './components/TopPanel.jsx';
import VRepairLayout from './layouts/VRepairLayout.jsx';
import { Box, Stack, Typography, Link, Button, Breadcrumbs, CircularProgress, Snackbar, Alert } from '@mui/material';

const DashboardShell = lazy(() => import('./pages/DashboardShell.jsx'));
const TroubleMgtSearchPage = lazy(() => import('./pages/TroubleMgtSearchPage.jsx'));
const GroupTroubleTabs = lazy(() => import('./pages/GroupTroubleTabs.jsx'));
const DsQueryInventory = lazy(() => import('./pages/DsQueryInventory.jsx'));
const EquipmentCircuitDetails = lazy(() => import('./pages/EquipmentCircuitDetails.jsx'));

/* ─── Breadcrumb for Group Trouble route ─── */
const GroupTroubleBreadcrumb = () => {
  const { trNum } = useParams();
  const navigate = useNavigate();
  const items = [
    { id: 'home', label: 'Home' },
    { id: 'worklist', label: 'Worklist' },
    { id: 'ticket', label: trNum || 'Ticket' },
  ];
  const handleClick = (id) => {
    if (id === 'home') navigate('/');
    if (id === 'worklist') navigate('/dashboard');
  };
  return (
    <Breadcrumbs sx={{ px: 2, py: 1 }}>
      {items.map((item) =>
        item.id === 'ticket' ? (
          <Typography key={item.id} color="text.primary" sx={{ fontSize: 14 }}>
            {item.label}
          </Typography>
        ) : (
          <Link
            key={item.id}
            underline="hover"
            color="inherit"
            sx={{ fontSize: 14 }}
            href="#"
            onClick={(e) => { e.preventDefault(); handleClick(item.id); }}
          >
            {item.label}
          </Link>
        )
      )}
    </Breadcrumbs>
  );
};

/* ─── Canvas-Compliant 404 Page ─── */
const NotFound = () => (
  <Box sx={{ p: 4, textAlign: 'center' }}>
    <Typography
      variant="h5"
      sx={{
        fontWeight: 700,
        color: 'text.primary',
        mb: 2,
        fontSize: 24,
      }}
    >
      404 — Page Not Found
    </Typography>
    <Typography
      variant="body1"
      sx={{
        color: 'grey.500',
        mb: 2.5,
        fontSize: 14,
      }}
    >
      The requested page does not exist.
    </Typography>
    <Link href="/" sx={{ textDecoration: 'none' }}>
      <Button variant="contained" size="medium">Return to Home</Button>
    </Link>
  </Box>
);

/* ─── Canvas Loading Fallback ─── */
const CanvasLoader = () => (
  <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '100vh' }}>
    <CircularProgress size={20} />
  </Stack>
);

const AppLayout = ({ children }) => (
  <TopPanel>{children}</TopPanel>
);

/* ─── Toast Overlay (renders toasts from AppContext) ─── */
const VARIANT_SEVERITY_MAP = {
  error: 'error',
  warning: 'warning',
  success: 'success',
  info: 'info',
};

const ToastOverlay = () => {
  const { toasts, dismissToast } = useAppContext();
  return (
    <>
      {toasts.map((t, index) => (
        <Snackbar
          key={t.id}
          open={Boolean(t.message)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ top: `${16 + index * 64}px !important` }}
          autoHideDuration={4000}
          onClose={() => dismissToast(t.id)}
        >
          <Alert
            severity={VARIANT_SEVERITY_MAP[t.variant] ?? 'info'}
            onClose={() => dismissToast(t.id)}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {t.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

const App = () => (
  <CanvasThemeProvider>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <GroupSearchProvider>
          <TabsProvider>
            <BrowserRouter>
            <Suspense fallback={<CanvasLoader />}>
              <Routes>

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Dashboard — operator launchpad + ticket tabs (single-page shell) */}
              <Route
                path="/dashboard"
                element={
                  <VRepairLayout>
                    <DashboardShell />
                  </VRepairLayout>
                }
              />

              {/* Ticket detail — opens inside DashboardShell with ticket sub-tab */}
              <Route
                path="/ticket/:trNum"
                element={
                  <VRepairLayout>
                    <DashboardShell />
                  </VRepairLayout>
                }
              />

              {/* Trouble Management Search — uses VRepairLayout */}
              <Route
                path="/trouble-mgt"
                element={
                  <VRepairLayout>
                    <TroubleMgtSearchPage />
                  </VRepairLayout>
                }
              />

              {/* Group Trouble Report — base route (legacy TopPanel) */}
              <Route
                path="/group-trouble"
                element={
                  <AppLayout>
                    <GroupTroubleTabs />
                  </AppLayout>
                }
              />

              {/* Group Trouble Report — specific TR number */}
              <Route
                path="/group-trouble/:trNum"
                element={
                  <VRepairLayout pageNav={<GroupTroubleBreadcrumb />}>
                    <GroupTroubleTabs />
                  </VRepairLayout>
                }
              />

              {/* DS Inventory (legacy TopPanel) */}
              <Route
                path="/inventory"
                element={
                  <AppLayout>
                    <DsQueryInventoryRoute />
                  </AppLayout>
                }
              />

              {/* Equipment / Circuit Details (legacy TopPanel) */}
              <Route
                path="/equipment-circuit-details"
                element={
                  <AppLayout>
                    <EquipmentCircuitDetailsRoute />
                  </AppLayout>
                }
              />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>

            {/* Canvas Toast Container — replaces react-toastify */}
            <ToastOverlay />
            </BrowserRouter>
          </TabsProvider>
        </GroupSearchProvider>
      </AppProvider>
    </ThemeProvider>
  </CanvasThemeProvider>
);

const DsQueryInventoryRoute = () => {
  const params = new URLSearchParams(window.location.search);
  const sessionUniqueKey = sessionStorage.getItem('sessionUniqueKey') || '';
  return (
    <DsQueryInventory
      sessionUniqueKey={sessionUniqueKey}
      trNum={params.get('trNum') || ''}
    />
  );
};

const EquipmentCircuitDetailsRoute = () => {
  const params = new URLSearchParams(window.location.search);
  const sessionUniqueKey = sessionStorage.getItem('sessionUniqueKey') || '';
  return (
    <EquipmentCircuitDetails
      sessionUniqueKey={sessionUniqueKey}
      sourceLink={params.get('sourceLink') || 'GTRM'}
      groupType={params.get('group') || 'IPR'}
      isAddProd={params.get('isAddProd') === 'true'}
      isNoMatch={params.get('isNoMatch') === 'Y'}
      equipSearchType={params.get('equipSearchType') || ''}
      groupName={params.get('groupName') || ''}
    />
  );
};

export default App;
