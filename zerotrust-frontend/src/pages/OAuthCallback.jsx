import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Shield } from 'lucide-react';

export default function OAuthCallback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (token) {
            localStorage.setItem('token', token);
            toast.success('Login successful!');
            navigate('/chat');
        } else if (error) {
            toast.error('OAuth authentication failed');
            navigate('/login');
        } else {
            navigate('/login');
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-center">
                <Shield size={48} className="text-green-500 mx-auto mb-4 animate-pulse" />
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-slate-400 mono text-sm">COMPLETING AUTHENTICATION...</p>
            </div>
        </div>
    );
}
