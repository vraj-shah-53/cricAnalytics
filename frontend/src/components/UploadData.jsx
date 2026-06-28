import React, { useState } from 'react';
import { uploadMatchData } from '../utils/api';
import { UploadCloud, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export default function UploadData() {
  const [infoFile, setInfoFile] = useState(null);
  const [delivFile, setDelivFile] = useState(null);
  
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleUpload(e) {
    e.preventDefault();
    if (!infoFile || !delivFile) {
      setErrorMsg("Please select both Match Info and Deliveries CSV files.");
      return;
    }
    
    setUploading(true);
    setMessage('');
    setErrorMsg('');
    
    try {
      const res = await uploadMatchData(infoFile, delivFile);
      if (res.data.success) {
        setMessage(res.data.message);
        // Clear files
        setInfoFile(null);
        setDelivFile(null);
        // Reset file inputs in DOM
        document.getElementById('infoFileInput').value = '';
        document.getElementById('delivFileInput').value = '';
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "An error occurred during file upload. Check file formats.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 className="page-title">Upload Match Data</h1>
        <p className="page-subtitle">Upload new match datasets dynamically to update the analytics database.</p>
      </div>

      <div className="glass-card">
        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Match Info CSV */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#e2e8f0', display: 'block', marginBottom: '8px' }}>
              1. Match Info CSV file (`[id]_info.csv`)
            </label>
            <div style={{ position: 'relative', border: '2px dashed rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', background: 'rgba(15, 23, 42, 0.2)', textAlign: 'center', transition: 'border-color 0.2s ease' }}>
              <input 
                type="file" 
                id="infoFileInput"
                accept=".csv"
                onChange={(e) => setInfoFile(e.target.files[0])}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
              />
              <UploadCloud className="mx-auto w-10 h-10 text-gray-500" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '600' }}>
                {infoFile ? infoFile.name : "Select Match Info CSV"}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Cricsheet info format (key-value schema)</p>
            </div>
          </div>

          {/* Deliveries CSV */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#e2e8f0', display: 'block', marginBottom: '8px' }}>
              2. Match Deliveries CSV file (`[id].csv`)
            </label>
            <div style={{ position: 'relative', border: '2px dashed rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', background: 'rgba(15, 23, 42, 0.2)', textAlign: 'center', transition: 'border-color 0.2s ease' }}>
              <input 
                type="file" 
                id="delivFileInput"
                accept=".csv"
                onChange={(e) => setDelivFile(e.target.files[0])}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
              />
              <UploadCloud className="mx-auto w-10 h-10 text-gray-500" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '600' }}>
                {delivFile ? delivFile.name : "Select Deliveries CSV"}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Cricsheet ball-by-ball table</p>
            </div>
          </div>

          {/* Alert Messages */}
          {message && (
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--color-emerald)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <CheckCircle2 className="w-5 h-5" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{message}</div>
            </div>
          )}

          {errorMsg && (
            <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--color-red)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <AlertTriangle className="w-5 h-5" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{errorMsg}</div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading || !infoFile || !delivFile}
            className="btn-primary"
            style={{ width: '100%', padding: '14px 20px' }}
          >
            {uploading ? (
              <>
                <RefreshCw className="animate-spin w-5 h-5" />
                Parsing and Appending Match Data...
              </>
            ) : (
              <>
                <UploadCloud className="w-5 h-5" />
                Update League Database
              </>
            )}
          </button>
        </form>
      </div>

      <div className="info-highlight-box" style={{ marginTop: '32px' }}>
        <p className="info-highlight-title">Upload Guidelines</p>
        The platform expects standard <strong className="text-white">Cricsheet CSV</strong> format files. Ensure the match ID does not already exist in the database. When uploading, the backend will dynamically parse the files, append them to the compiled master datasets, and refresh the Pandas data analytics engine in memory without requiring a server reboot.
      </div>
    </div>
  );
}
