import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app-store';
import { restoreSessionThunk } from '../app-store/login';
import { LoginView } from '../business-components/login/login-view';
import { WorkspaceView } from '../business-components/workspace/workspace-view';
import { AppHeader } from '../shared-components';

// Route guards are a UX convenience ONLY. Real access control is enforced by the API on every request.
const RequireAuth = ({ children }) => {
  const user = useAppSelector((s) => s.login.user);
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};
const RedirectIfAuthed = ({ children }) => {
  const user = useAppSelector((s) => s.login.user);
  return user ? <Navigate to="/" replace /> : <>{children}</>;
};

export const AppRoutes = () => {
  const dispatch = useAppDispatch();
  const isRestoring = useAppSelector((s) => s.login.isRestoring);
  useEffect(() => {
    void dispatch(restoreSessionThunk());
  }, [dispatch]);
  if (isRestoring) return <p className="muted center">Loading…</p>;
  return (
    <>
      <AppHeader />
      <Routes>
        <Route
          path="/login"
          element={
            <RedirectIfAuthed>
              <LoginView />
            </RedirectIfAuthed>
          }
        />
        <Route
          path="/"
          element={
            <RequireAuth>
              <WorkspaceView />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};
