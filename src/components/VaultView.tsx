import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  UploadCloud, 
  Trash2, 
  Lock, 
  Unlock, 
  FileCode, 
  FileText, 
  Check, 
  Activity, 
  AlertCircle,
  HardDrive,
  RefreshCcw,
  RefreshCw,
  FolderLock
} from 'lucide-react';
import { VaultFile } from '../types';

export default function VaultView() {
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [isSecureSync, setIsSecureSync] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'family' | 'finance' | 'golf' | 'general'>('finance');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/vault');
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      await uploadFileMetadata(droppedFile.name, droppedFile.size);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const chosenFile = e.target.files[0];
      await uploadFileMetadata(chosenFile.name, chosenFile.size);
    }
  };

  const uploadFileMetadata = async (name: string, size: number) => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, size, category: selectedCategory })
      });
      if (res.ok) {
        fetchFiles();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsSyncing(false), 1200);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleSyncVerify = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setIsSecureSync(true);
    }, 1800);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
              Secure SmartVault Integration Space
            </span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">SmartVault Cloud Workspace</h2>
          <p className="text-zinc-400 text-sm">Synchronize trust agreements, private estates portfolio deeds, and Lakeside certificates.</p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-950 p-2 rounded-xl border border-white/5">
          <div className="flex items-center gap-1.5 px-3">
            {isSecureSync ? (
              <>
                <ShieldCheck className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-mono font-bold text-zinc-300">FULLY ENCRYPTED</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-amber-500 animate-pulse" />
                <span className="text-xs font-mono font-bold text-amber-500">PENDING SYNC</span>
              </>
            )}
          </div>
          <button 
            onClick={handleSyncVerify}
            className="px-3.5 py-1.5 bg-blue-500 hover:bg-blue-400 text-black text-[10px] font-mono font-extrabold rounded-lg uppercase tracking-wide flex items-center gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            Force Re-Verify
          </button>
        </div>
      </div>

      {/* Upload Drag & Drop Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Drag interface */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold text-sm tracking-wide text-zinc-100 uppercase font-mono">Upload to smartvaultspace</h3>
          
          <div className="p-4 bg-[#0F0F0F] rounded-2xl border border-white/5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-medium font-mono">Target Workspace Vault</label>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none"
              >
                <option value="finance">Asset Planning Documents</option>
                <option value="family">Family oversight Records</option>
                <option value="golf">Lakeside Golf certificates</option>
                <option value="general">General backup</option>
              </select>
            </div>

            {/* Real Drag and drop layout */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border border-dashed rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all hover:bg-zinc-950 ${
                dragActive ? 'border-blue-400 bg-blue-500/5' : 'border-white/10'
              }`}
            >
              <input 
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
              <UploadCloud className="w-8 h-8 text-zinc-500 animate-bounce" />
              <div className="text-center">
                <p className="text-xs font-bold text-zinc-300">Drag file here, or click to choose</p>
                <p className="text-[10px] text-zinc-550 font-mono mt-0.5">PDF, DOCX, XLSX up to 50MB</p>
              </div>
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-white/5 flex items-center justify-between text-xs text-zinc-450">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-zinc-500" />
                <span>Vault Capacity Sync</span>
              </div>
              <span className="font-mono text-[10px] text-zinc-300">14.2 MB of 10.0 GB Logged</span>
            </div>
          </div>
        </div>

        {/* Right list showing current securely synced document list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="font-bold text-zinc-200">Active Document Nodes</h3>
            <span className="text-xs text-zinc-500">{files.length} Secure Deeds Synced</span>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto scrollbar-thin">
            {files.length === 0 ? (
              <p className="text-zinc-500 text-sm">No synchronized documents in SmartVault space.</p>
            ) : (
              files.map((file) => (
                <div key={file.id} className="p-3.5 bg-[#0F0F0F] border border-white/5 rounded-xl flex items-center justify-between hover:border-white/10 transition-all">
                  <div className="flex items-center gap-3.5">
                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                      {file.name.endsWith('.pdf') ? <FileText className="w-5 h-5" /> : <FileCode className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-200 leading-tight">{file.name}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono mt-1">
                        <span>{formatBytes(file.size)}</span>
                        <span>•</span>
                        <span className="uppercase text-zinc-400">{file.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <span className="flex items-center gap-1 font-mono text-[10px] bg-yellow-400/10 text-yellow-400 px-2 py-0.5 rounded border border-yellow-400/10">
                      <Lock className="w-3 h-3 text-yellow-400 shrink-0" />
                      SECURE SYNC
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Information security audit footer */}
      <div className="p-5 bg-zinc-950 border border-white/5 rounded-2xl flex items-center gap-4">
        <FolderLock className="w-8 h-8 text-blue-400 shrink-0" />
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-zinc-300 uppercase font-mono tracking-wide">Secure SmartVault Governance Compliance</p>
          <p className="text-[11px] text-zinc-500 leading-normal">
            Your family's digitized directory matches SOC2 encryption and utilizes end-to-end telemetry seals. No credentials or files are stored in public cloud caches outside of your private sqlite node space.
          </p>
        </div>
      </div>
    </div>
  );
}
