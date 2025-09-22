import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

export default function MFASetupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setupMFA();
  }, []);

  const setupMFA = async () => {
    try {
      const { data } = await api.post('/security/mfa/setup');
      console.log('MFA Data:', data);
      
      if (data.qrCodeUrl) {
        setQrCodeUrl(data.qrCodeUrl);
        setSecret(data.secret);
      }
    } catch (error) {
      console.error('MFA setup failed:', error);
      toast.error('Failed to setup MFA');
    } finally {
      setLoading(false);
    }
  };

  const enableMFA = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Enter 6-digit code');
      return;
    }

    try {
      const { data } = await api.post('/security/mfa/enable', { token: verificationCode });
      setBackupCodes(data.backupCodes || []);
      setStep(2);
      toast.success('MFA enabled successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid code');
    }
  };

  const downloadCodes = () => {
    const text = backupCodes.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading MFA setup...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8">
        {step === 1 && (
          <div>
            <h1 className="text-3xl font-bold mb-4">Setup 2FA</h1>
            <p className="text-gray-600 mb-6">
              Secure your account with Two-Factor Authentication
            </p>

            {qrCodeUrl ? (
              <>
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <h2 className="font-semibold mb-4">Step 1: Scan QR Code</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Open Google Authenticator and scan this code
                  </p>
                  <div className="flex justify-center mb-4 bg-white p-4 rounded">
                    <QRCodeSVG value={qrCodeUrl} size={220} />
                  </div>
                  <p className="text-xs text-gray-500 break-all">
                    Manual entry: {secret}
                  </p>
                </div>

                <div className="mb-6">
                  <h2 className="font-semibold mb-2">Step 2: Verify Code</h2>
                  <input
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full px-4 py-3 border rounded-lg text-center text-3xl tracking-widest"
                  />
                </div>

                <button
                  onClick={enableMFA}
                  disabled={verificationCode.length !== 6}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
                >
                  Enable 2FA
                </button>
              </>
            ) : (
              <div className="text-center text-red-600">
                Failed to generate QR code. Please try again.
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-3xl font-bold text-green-600 mb-2">2FA Enabled!</h1>
              <p className="text-gray-600">Your account is now secured</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h2 className="font-semibold mb-3 text-yellow-800">⚠️ Save Backup Codes</h2>
              <p className="text-sm text-yellow-700 mb-4">
                These codes can be used if you lose access to your authenticator
              </p>
              <div className="bg-white rounded-lg p-4">
                <div className="grid grid-cols-2 gap-3 font-mono text-sm">
                  {backupCodes.map((code, i) => (
                    <div key={i} className="bg-gray-50 p-3 rounded border text-center">
                      {code}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={downloadCodes}
                className="w-full px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
              >
                📥 Download Backup Codes
              </button>
              <button
                onClick={() => navigate('/chat')}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                Go to Chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
