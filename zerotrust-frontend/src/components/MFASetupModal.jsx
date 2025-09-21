import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

export default function MFASetupModal({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setupMFA();
    }
  }, [isOpen]);

  const setupMFA = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { data } = await api.post('/security/mfa/setup');
      console.log('MFA Setup Response:', data);
      
      if (data.qrCodeUrl && data.qrCodeUrl.startsWith('otpauth://')) {
        setQrCodeUrl(data.qrCodeUrl);
        setSecret(data.secret);
      } else {
        setError('Invalid MFA setup response');
      }
    } catch (error) {
      console.error('MFA setup error:', error);
      setError('Failed to setup MFA: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const enableMFA = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/security/mfa/enable', { token: verificationCode });
      setBackupCodes(data.backupCodes || []);
      setStep(2);
      toast.success('MFA enabled!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zerotrust-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>

        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Secure Your Account</h2>
            <p className="text-gray-600 mb-6">Enable Two-Factor Authentication</p>

            {loading && <div className="text-center py-8">Setting up MFA...</div>}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 text-sm">{error}</p>
                <button 
                  onClick={setupMFA} 
                  className="mt-2 text-red-600 hover:text-red-700 text-sm underline"
                >
                  Try Again
                </button>
              </div>
            )}

            {!loading && !error && qrCodeUrl && (
              <>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold mb-2">Step 1: Scan QR Code</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Open Google Authenticator and scan this code
                  </p>
                  <div className="flex justify-center mb-4 bg-white p-4 rounded">
                    <QRCodeSVG value={qrCodeUrl} size={200} />
                  </div>
                  <p className="text-xs text-gray-500 break-all">
                    Manual entry: {secret}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold mb-2">Step 2: Enter Code</h3>
                  <input
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full px-4 py-2 border rounded-lg text-center text-2xl tracking-wider"
                  />
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={onClose} 
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Skip for now
                  </button>
                  <button
                    onClick={enableMFA}
                    disabled={loading || verificationCode.length !== 6}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Verifying...' : 'Enable 2FA'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-green-600">✅ 2FA Enabled!</h2>
            <p className="text-gray-600 mb-6">
              Save these backup codes in a safe place
            </p>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-3">Backup Codes</h3>
              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {backupCodes.map((code, i) => (
                  <div key={i} className="bg-white p-2 rounded border text-center">
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={downloadBackupCodes} 
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Download Codes
              </button>
              <button
                onClick={() => {
                  onComplete();
                  onClose();
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
