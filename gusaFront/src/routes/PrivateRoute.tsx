import { Navigate, Outlet } from 'react-router-dom';
import { isAdmin } from '../utils/token';

const PrivateRoute = () => {
  if (!isAdmin()) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
};

export default PrivateRoute;
