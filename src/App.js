import { Routes, Route, Navigate } from "react-router";
import './App.css';
import Upload from './pages/Upload';
import TtsRecordList from './pages/TtsRecordList';
import Login from './pages/Login';
import CreateUser from './pages/CreateUser';

const ProtectedRoute = ({ children }) => {
  const currentUser = localStorage.getItem("tts_currentUser");
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/create-user" element={<CreateUser />} />

      <Route path="/tts/upload" element={
        <ProtectedRoute>
          <Upload />
        </ProtectedRoute>
      } />
      <Route path="/tts/records" element={
        <ProtectedRoute>
          <TtsRecordList />
        </ProtectedRoute>
      } />

      {/* Default redirect to login for unknown or root paths specific to this flow, or just let 404 if not handled. 
          For now, maybe redirect root to login or tts/upload */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App;
