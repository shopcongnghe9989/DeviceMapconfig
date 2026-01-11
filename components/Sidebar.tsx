
import React, { useState } from 'react';
import { ProjectData, CameraType, CameraStatus, Connection } from '../types';

interface SidebarProps {
  project: ProjectData;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  onExportImage: () => void;
  onPublish: () => void;
  onCameraSelect: (id: string) => void;
  isAddMode: boolean;
  setIsAddMode: (v: boolean) => void;
  isConnectionMode: boolean;
  setIsConnectionMode: (v: boolean) => void;
  onDeleteConnection: (id: string) => void;
  onReset: () => void;
  isReadOnly?: boolean;
  onExitReadOnly?: () => void;
}

const getSidebarIcon = (type: CameraType) => {
  switch (type) {
    case CameraType.WIFI: return "M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a10 10 0 0114.142 0M1.393 8.939a15 15 0 0121.214 0";
    case CameraType.PTP: return "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4";
    case CameraType.NVR:
    case CameraType.SWITCH:
    case CameraType.ROUTER: return "M5 12h14M5 12a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v3a2 2 0 01-2 2M5 12a2 2 0 00-2 2v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 00-2-2";
    default: return "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z";
  }
};

const Sidebar: React.FC<SidebarProps> = ({ 
    project, onFileUpload, onExport, onExportImage, onPublish, onCameraSelect, isAddMode, setIsAddMode,
    isConnectionMode, setIsConnectionMode, onDeleteConnection, onReset, isReadOnly = false, onExitReadOnly
}) => {
  const [activeTab, setActiveTab] = useState<'devices' | 'connections' | 'report'>('devices');
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 768);

  const getConnectionName = (conn: Connection) => {
    const from = project.cameras.find(c => c.id === conn.fromId)?.name || '...';
    const to = project.cameras.find(c => c.id === conn.toId)?.name || '...';
    return `${from} → ${to}`;
  };

  if (isCollapsed) {
    return (
        <div className="absolute top-20 left-4 z-30">
            <button 
                onClick={() => setIsCollapsed(false)}
                className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-blue-400 shadow-2xl"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
        </div>
    );
  }

  return (
    <aside className="fixed md:relative inset-y-0 left-0 w-80 bg-slate-900 border-r border-slate-800 flex flex-col z-40 shadow-2xl transition-transform">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg></div>
          <span className="font-bold">CCTV Map</span>
        </div>
        <button onClick={() => setIsCollapsed(true)} className="p-2 text-slate-500 hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
      </div>

      <div className="p-4 space-y-2">
        {!isReadOnly && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setIsAddMode(!isAddMode)} className={`py-3 rounded-lg flex flex-col items-center gap-1 text-[10px] font-bold ${isAddMode ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-300'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                + THIẾT BỊ
              </button>
              <button onClick={() => setIsConnectionMode(!isConnectionMode)} className={`py-3 rounded-lg flex flex-col items-center gap-1 text-[10px] font-bold ${isConnectionMode ? 'bg-emerald-500 text-slate-900' : 'bg-slate-800 text-slate-300'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656" /></svg>
                KẾT NỐI
              </button>
            </div>
            <label className="w-full py-2 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center gap-2 cursor-pointer text-xs text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1" /></svg>
                PDF/ẢNH
                <input type="file" className="hidden" accept="image/*,.pdf" onChange={onFileUpload} />
            </label>
          </>
        )}
      </div>

      <div className="flex border-b border-slate-800 text-[10px] font-bold uppercase">
        {['devices', 'connections', 'report'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-3 ${activeTab === tab ? 'border-b-2 border-blue-500 text-blue-400' : 'text-slate-500'}`}>{tab}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {activeTab === 'devices' && (
          <div className="space-y-1">
            {project.cameras.map(cam => (
              <div key={cam.id} onClick={() => { onCameraSelect(cam.id); if(window.innerWidth < 768) setIsCollapsed(true); }} className="p-2 rounded hover:bg-slate-800 flex items-center gap-3 cursor-pointer">
                <div className={`w-8 h-8 rounded bg-slate-800 flex items-center justify-center ${cam.status === CameraStatus.ACTIVE ? 'text-blue-400' : 'text-amber-500'}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getSidebarIcon(cam.type)} /></svg></div>
                <div className="flex-1 min-w-0"><div className="text-xs font-bold truncate text-slate-200">{cam.name}</div><div className="text-[9px] text-slate-500 uppercase">{cam.type}</div></div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'connections' && (
          <div className="space-y-1">
            {project.connections.map(conn => (
              <div key={conn.id} className="p-2 rounded bg-slate-800/30 border border-slate-800 flex items-center justify-between">
                <div className="text-[10px] text-slate-300 truncate">{getConnectionName(conn)}</div>
                {!isReadOnly && <button onClick={() => onDeleteConnection(conn.id)} className="text-red-500 p-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>}
              </div>
            ))}
          </div>
        )}
        {activeTab === 'report' && (
          <div className="p-2 space-y-4">
            <div className="bg-slate-800 rounded p-3">
              <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase">Vật tư dự án</div>
              {Object.entries(project.cameras.reduce((acc: any, c) => { acc[c.type] = (acc[c.type] || 0) + 1; return acc; }, {})).map(([type, count]: any) => (
                <div key={type} className="flex justify-between text-xs py-1 border-b border-slate-700 last:border-0"><span className="text-slate-400">{type}</span><span className="font-bold">{count}</span></div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900 space-y-2">
        <button onClick={onExportImage} className="w-full py-2 bg-blue-600 text-white rounded font-bold text-[10px] uppercase">Xuất ảnh (PNG)</button>
        <div className="flex gap-2">
          <button onClick={onExport} className="flex-1 py-2 border border-slate-700 text-slate-400 text-[9px] font-bold">LƯU JSON</button>
          <button onClick={onPublish} className="flex-1 py-2 border border-green-600/30 text-green-500 text-[9px] font-bold">GỬI SHARE</button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
