import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleOAuthCallback = useCallback(async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log('OAuth Session:', session);
      console.log('OAuth Error:', sessionError);
      
      if (sessionError) {
        setError(sessionError.message);
        throw sessionError;
      }
      
      if (session?.access_token) {
        console.log('Sending access token to backend...');
        const response = await authService.oauthCallback(session.access_token);
        console.log('Backend response:', response);
        
        toast.success('Google login successful!');
        navigate('/chat');
      } else {
        throw new Error('No session found after OAuth');
      }
    } catch (err) {
      console.error('OAuth callback error:', err);
      setError(err.message);
      toast.error('OAuth login failed: ' + err.message);
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [navigate]);

  useEffect(() => {
    handleOAuthCallback();
  }, [handleOAuthCallback]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md">
        {!error ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Completing Google login...</p>
          </>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-700 font-medium mb-2">OAuth Error</p>
            <p className="text-red-600 text-sm">{error}</p>
            <p className="text-gray-600 text-sm mt-2">Redirecting to login...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
