import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleSignIn() {
    await signInWithGoogle();
    navigate('/');
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 flex flex-col items-center gap-6 shadow-xl">
        <h1 className="text-2xl font-bold text-white">Sign in to continue</h1>
        <p className="text-gray-400 text-sm">Google sign-in is required to access Finance.</p>
        <button
          onClick={handleSignIn}
          className="flex items-center gap-3 bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.1 33.9 29.5 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.4-.1-2.7-.5-4z"/>
            <path fill="#34A853" d="M6.3 14.7l7 5.1C15 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6-6C34.6 5.1 29.6 3 24 3c-7.7 0-14.4 4.4-17.7 11.7z"/>
            <path fill="#FBBC05" d="M24 45c5.4 0 10.3-1.8 14.1-4.9l-6.5-5.3C29.5 36.3 26.9 37 24 37c-5.4 0-10-3.5-11.7-8.3l-7 5.4C8.7 41.1 15.8 45 24 45z"/>
            <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-.8 2.3-2.2 4.2-4.1 5.5l6.5 5.3C42.1 36.2 45 30.6 45 24c0-1.4-.2-2.7-.5-4z"/>
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
