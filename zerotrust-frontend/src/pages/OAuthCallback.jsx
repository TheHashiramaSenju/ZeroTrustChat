import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Shield } from 'lucide-react';

export default function OAuthCallback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { setUser } = useAuth();
    const [status, setStatus] = useState('processing');

    useEffect(() => {
        const handleOAuthCallback = async () => {
            const token = searchParams.get('token');
            const error = searchParams.get('error');

            console.log('OAuth Callback - Token:', token ? 'Received' : 'Missing');

            if (error) {
                toast.error(`OAuth failed: ${error}`);
                setStatus('error');
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            if (!token) {
                toast.error('No authentication token received');
                setStatus('error');
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            try {
                // Save token
                localStorage.setItem('token', token);
                
                // Fetch user details
                const response = await fetch('https://zerotrust-backend.onrender.com/api/v1/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user details');
                }

                const data = await response.json();
                const user = data.user;

                // Update auth context
                if (setUser) {
                    setUser(user);
                }

                // Check if user has set password
                if (!user.passwordHash || user.passwordHash.startsWith('GOOGLE_OAUTH')) {
                    toast.success('Welcome! Please set your password to continue.');
                    setStatus('success');
                    setTimeout(() => navigate('/setup-password'), 1500);
                } else {
                    toast.success('Welcome back! Redirecting to chat...');
                    setStatus('success');
                    setTimeout(() => navigate('/chat'), 1500);
                }
            } catch (err) {
                console.error('OAuth callback error:', err);
                toast.error('Authentication failed. Please try again.');
                localStorage.removeItem('token');
                setStatus('error');
                setTimeout(() => navigate('/login'), 2000);
            }
        };

        handleOAuthCallback();
    }, [searchParams, navigate, setUser]);

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-center">
                <Shield size={48} className="mx-auto mb-4 text-green-500 animate-pulse" />
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-slate-400 text-sm">COMPLETING AUTHENTICATION...</p>
            </div>
        </div>
    );
}
