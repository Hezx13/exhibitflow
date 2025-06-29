import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import TablesPage from './components/tablesPage';
import DashboardPage from './pages/dashboardPage';
import ProjectsPage from './pages/projectsPage';
import ReportsPage from './pages/ReportsPage';
import Login from './pages/loginPage';
import Register from './pages/registerPage';
import ManagementPage from './pages/ManagementPage';
import SavedMaterialsPage from './pages/SavedMaterialsPage';
import MainLayout from './components/layout/MainLayout';
import { useGetUserDataQuery } from './store/api/userApi';
import { CircularProgress } from '@mui/material';
import Library from './pages/Library';
import UnauthorizedLayout from './components/layout/UnauthorizedLayout';
import { RootState, useAppSelector } from './store';
import DocumentPage from './pages/DocumentPage';
import { YDocProvider } from '@y-sweet/react';
import LogsPage from './pages/LogsPage';

const PrivateRoute = ({ children, roles }) => {
  const { data: userData, isLoading: userDataLoading } = useGetUserDataQuery();
  const { token } = useAppSelector((state) => state.auth);
  if (userDataLoading) return <CircularProgress />;
  if (!token) return <Navigate to="/login" />;
  if (!userData?.role || !roles.includes(userData.role)) {
    return <Navigate to="/library" />;
  }

  return children;
};
const guestRoutes = [
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
];
// Routes configuration
const routes = [
  {
    path: '/table',
    element: <TablesPage />,
  },
  {
    path: '/projects/:id',
    element: <ProjectsPage />,
    protected: true,
    allowedRoles: ['Admin', 'Manager', 'User'],
  },
  // Protected routes
  {
    path: '/library',
    element: <Library />,
    protected: true,
    allowedRoles: ['Admin', 'Manager', 'User'],
  },
  {
    path: '/documents/:id',
    element: <DocumentPage />,
    protected: false,
    allowedRoles: ['Admin', 'Manager', 'User'],
  },
  {
    path: '/',
    element: <DashboardPage />,
    protected: true,
    allowedRoles: ['Admin'],
  },
  {
    path: '/management',
    element: <ManagementPage />,
    protected: true,
    allowedRoles: ['Admin'],
  },
  {
    path: '/saved',
    element: <SavedMaterialsPage />,
    protected: true,
    allowedRoles: ['Admin'],
  },
  {
    path: '/reports',
    element: <ReportsPage />,
    protected: true,
    allowedRoles: ['Admin'],
  },
  {
    path: '/logs',
    element: <LogsPage />,
    protected: true,
    allowedRoles: ['Admin'],
  },
];

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route element={<UnauthorizedLayout />}>
          {guestRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>
        <Route element={<MainLayout />}>
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                route.protected ? (
                  <PrivateRoute roles={route.allowedRoles}>{route.element}</PrivateRoute>
                ) : (
                  route.element
                )
              }
            />
          ))}
          <Route path="*" element={<Navigate to="/library" />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
