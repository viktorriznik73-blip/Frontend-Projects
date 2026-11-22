import { useEffect, useState } from 'react';
import './App.css'
interface AuthResponse {
  token?: string;
  message?: string;
}

interface UserPayload {
  userId: number;
  email: string;
  iat: number;
  exp: number;
}


interface ProfileResponse {
  message: string;
  user: UserPayload;
}

const API_URL = import.meta.env.VITE_API_URL;

export function App() {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [profile, setProfile] = useState<UserPayload | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');


 useEffect(() => {
    if (!token) {
      setProfile(null);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          handleLogout();
          return;
        }

        const data: ProfileResponse = await res.json();
        setProfile(data.user);
      } catch {
        setStatusMessage('Failed to connect to the server');
      }
    };

    fetchProfile();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatusMessage('');

    const endpoint = isLogin ? '/login' : '/register';

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data: AuthResponse = await res.json();

      if (!res.ok) {
        setStatusMessage(data.message || 'Request error');
        return;
      }

      if (isLogin && data.token) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setEmail('');
        setPassword('');
      } else {
        setStatusMessage(data.message || 'Registration successful! Now please log in.');
        setIsLogin(true);
        setPassword('');
      }
    } catch {
      setStatusMessage('Network error. Check whether the server is running on port 3000.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setProfile(null);
    setStatusMessage('You have signed out');
  };

  return (
    <main style={{ maxWidth: 420, margin: '60px auto', fontFamily: 'sans-serif' }}>
      <h1>{token ? 'Profile' : isLogin ? 'Login' : 'Registration'}</h1>

      {statusMessage && <p style={{ color: 'red',  marginBottom: '12px' }}>{statusMessage}</p>}

      {token ? (
        <div className='div1'>
          <p className='p1'>Status: authorized via JWT</p>
          {profile && (
            <div>
              <p className='p2'>Email: {profile.email}</p>
              <p className='p3'>ID: {profile.userId}</p>
            </div>
          )}
          <button type="button" onClick={handleLogout} className='button1'>
            Logout
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='input1'
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className='input1'
          />
          <button type="submit" className='button2'>{isLogin ? 'Login' : 'Register'}</button>

          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setStatusMessage('');
            }}
            className='button3'
          >
            {isLogin ? "Don't have an account? Register" : 'Already have an account? Log in'}
          </button>
        </form>
      )}
    </main>
  );
}

export default App;