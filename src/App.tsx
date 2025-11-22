import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Login from './pages/Login';
import { AuthProvider } from './contexts/AuthContext';
import WelcomeAnimation from './components/WelcomeAnimation';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <WelcomeAnimation />
        <div style={{ fontFamily: 'var(--font-main)', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;