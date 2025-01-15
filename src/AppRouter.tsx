// AppRouter.js
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAppState } from './state/AppStateContext';
import ListsPage from './pages/listsPage';
import TablesPage from './components/tablesPage';
import ArchivePage from './pages/archivePage';
import DashboardPage from './pages/dashboardPage';
import VerticalTabs from './pages/projectsPage';
import ReportsPage from './pages/ReportsPage';
import ReportDetailedTable from './components/ReportDetailedTable';
import Login from './pages/loginPage';
import Register from './pages/registerPage';
import ManagementPage from './pages/ManagementPage';
import SavedMaterialsPage from './pages/SavedMaterialsPage';
import MainLayout from './components/layout/MainLayout';

const PrivateRoute = ({ children, roles }) => {
  const currentUserRole = useAppState().role;

  if (!currentUserRole || !roles.includes(currentUserRole)) {
    return <Navigate to="/" />;
  }

  return children;
};

// Routes configuration
const routes = [
  {
    path: '/',
    element: <ListsPage />,
  },
  {
    path: '/table',
    element: <TablesPage />,
  },
  {
    path: '/projects',
    element: <VerticalTabs />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  // Protected routes
  {
    path: '/archive',
    element: <ArchivePage />,
    protected: true,
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
    protected: true,
  },
  {
    path: '/management',
    element: <ManagementPage />,
    protected: true,
  },
  {
    path: '/saved',
    element: <SavedMaterialsPage />,
    protected: true,
  },
  {
    path: '/reports',
    element: <ReportsPage />,
    protected: true,
  },
  {
    path: '/report',
    element: <ReportDetailedTable />,
    protected: true,
  },
];

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                route.protected ? (
                  <PrivateRoute roles={['Admin']}>{route.element}</PrivateRoute>
                ) : (
                  route.element
                )
              }
            />
          ))}
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
