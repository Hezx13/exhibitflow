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

const PrivateRoute = ({ children, roles }) => {
  const { data: userData, isLoading: userDataLoading } = useGetUserDataQuery();

  if (userDataLoading) return <CircularProgress />;
  if (!userData?.role || !roles.includes(userData.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

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
    path: '/library',
    element: <Library />,
    protected: true,
  },
  {
    path: '/',
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
    element: <div>Report</div>,
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
