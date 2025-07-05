import { useState } from 'react';
import API from './api';
import { AxiosError } from 'axios';

interface Props {
  onAuthSuccess: (token: string) => void;
}

export default function AuthForm({ onAuthSuccess }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const res = await API.post(endpoint, { email, password });
      const token = res.data.token;
      localStorage.setItem('token', token);
      onAuthSuccess(token);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      setError(axiosErr.response?.data?.message || 'Something went wrong.');
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 bg-gray-800 rounded text-white">
      <h2 className="text-xl font-bold mb-4">{isLogin ? 'Login' : 'Sign Up'}</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 rounded bg-gray-700 text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 rounded bg-gray-700 text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold"
        >
          {isLogin ? 'Login' : 'Sign Up'}
        </button>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </form>
      <p className="mt-4 text-center text-sm text-gray-400">
        {isLogin ? 'New here?' : 'Already have an account?'}{' '}
        <button
          className="text-blue-400 underline"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? 'Sign Up' : 'Login'}
        </button>
      </p>
    </div>
  );
}