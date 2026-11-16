import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute, { PublicOnly } from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import HeatmapPage from './pages/HeatmapPage.jsx';
import Prediction from './pages/Prediction.jsx';
import Shap from './pages/Shap.jsx';
import Scenarios from './pages/Scenarios.jsx';
import Recommendations from './pages/Recommendations.jsx';
import Reports from './pages/Reports.jsx';
import Profile from './pages/Profile.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnly />}>
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="heatmap" element={<HeatmapPage />} />
          <Route path="prediction" element={<Prediction />} />
          <Route path="shap" element={<Shap />} />
          <Route path="scenarios" element={<Scenarios />} />
          <Route path="recommendations" element={<Recommendations />} />
          <Route path="reports" element={<Reports />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}
