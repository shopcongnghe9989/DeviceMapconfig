
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
    case CameraType.WIFI:
      return "M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a10 10 0 0114.142 0M1.393 8.939a15 15 0 0121.214 0";
    case CameraType.PTP:
      return "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4";
    case CameraType.NVR:
    case CameraType.SWITCH:
    case CameraType.ROUTER:
      return "M5 12h14M5 12a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v3a2 2 0 01-2 2M5 12a2 2 0 00-2 2v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 00-2-2";
    default:
      return "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z";
  }
};

const Sidebar: React.FC<SidebarProps> = ({ 
    project, onFileUpload, onExport, onExportImage, onPublish, onCameraSelect, isAddMode, setIsAddMode,
    isConnectionMode, setIsConnectionMode, onDeleteConnection, onReset, isReadOnly = false, onExitReadOnly
}) => {
  const [activeTab, setActiveTab] = useState<'devices' | 'connections' | 'report'>('devices');

  const getConnectionName = (conn: Connection) => {
    const from = project.cameras.find(c => c.id === conn.fromId)?.name || 'Unknown';
    const to = project.cameras.find(c => c.id === conn.toId)?.name || 'Unknown';
    return `${from} → ${to}`;
  };

  const getBOM = () => {
    const counts: Record<string, number> = {};
    project.cameras.forEach(c => {
      counts[c.type] = (counts[c.type] || 0) + 1;
    });
    return Object.entries(counts);
  };

  return (
    <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col z-20 shadow-2xl">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight">CCTV Manager</span>
        </div>

        <div className="space-y-3">
          {!isReadOnly ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setIsAddMode(!isAddMode)}
                  className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-medium transition-all ${isAddMode ? 'bg-amber-500 text-slate-900 ring-2 ring-amber-500/20' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Thiết bị
                </button>
                <button 
                  onClick={() => setIsConnectionMode(!isConnectionMode)}
                  className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-medium transition-all ${isConnectionMode ? 'bg-emerald-500 text-slate-900 ring-2 ring-emerald-500/20' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  Kết nối
                </button>
              </div>
              
              <label className="w-full py-2 px-4 border border-slate-700 hover:border-slate-500 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors text-slate-300 text-xs">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                Tải bản vẽ (PDF/Ảnh)
                <input type="file" className="hidden" accept="image/*,.pdf" onChange={onFileUpload} />
              </label>

              <button 
                onClick={onPublish}
                className="w-full py-2 px-4 bg-green-600/10 text-green-400 border border-green-600/30 hover:bg-green-600/20 rounded-lg flex items-center justify-center gap-2 transition-all font-medium text-xs"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945" /></svg>
                Gửi khách hàng
              </button>
            </>
          ) : (
            <div className="p-4 bg-blue-900/20 border border-blue-900/30 rounded-lg text-blue-300 text-sm italic">Bạn đang ở chế độ xem.</div>
          )}
        </div>
      </div>

      <div className="flex border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        <button onClick={() => setActiveTab('devices')} className={`flex-1 py-3 border-b-2 transition-colors ${activeTab === 'devices' ? 'border-blue-500 text-blue-400 bg-slate-800/50' : 'border-transparent hover:text-slate-300'}`}>Thiết bị</button>
        <button onClick={() => setActiveTab('connections')} className={`flex-1 py-3 border-b-2 transition-colors ${activeTab === 'connections' ? 'border-blue-500 text-blue-400 bg-slate-800/50' : 'border-transparent hover:text-slate-300'}`}>Kết nối</button>
        <button onClick={() => setActiveTab('report')} className={`flex-1 py-3 border-b-2 transition-colors ${activeTab === 'report' ? 'border-blue-500 text-blue-400 bg-slate-800/50' : 'border-transparent hover:text-slate-300'}`}>Báo cáo</button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {activeTab === 'devices' && (
          <div className="space-y-1">
            {project.cameras.map((cam) => (
              <button key={cam.id} onClick={() => onCameraSelect(cam.id)} className="w-full text-left p-3 rounded-lg hover:bg-slate-800 transition-colors group flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center flex-shrink-0 group-hover:bg-slate-700 transition-colors">
                  <svg className={`w-4 h-4 ${cam.status === CameraStatus.ACTIVE ? 'text-blue-400' : 'text-amber-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getSidebarIcon(cam.type)} /></svg>
                </div>
                <div className="flex-1 min-w-0"><div className="text-sm font-medium truncate text-slate-200">{cam.name}</div><div className="text-[10px] text-slate-500 truncate flex items-center gap-1"><span className={`w-1.5 h-1.5 rounded-full ${cam.status === CameraStatus.ACTIVE ? 'bg-green-500' : 'bg-amber-500'}`} />{cam.type}</div></div>
              </button>
            ))}
          </div>
        )}
        {activeTab === 'connections' && (
          <div className="space-y-1">
            {(project.connections || []).map((conn) => (
              <div key={conn.id} className="w-full p-3 rounded-lg bg-slate-800/30 border border-slate-800 flex items-center justify-between group">
                <div className="flex-1 min-w-0"><div className="text-sm font-medium truncate text-slate-300">{getConnectionName(conn)}</div><div className="text-[10px] text-slate-500">Kết nối vật lý</div></div>
                {!isReadOnly && <button onClick={() => onDeleteConnection(conn.id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded opacity-0 group-hover:opacity-100"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>}
              </div>
            ))}
          </div>
        )}
        {activeTab === 'report' && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-500 px-2">BẢNG KÊ VẬT TƯ (BOM)</h4>
            <div className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800 text-slate-500 uppercase text-[10px]"><tr><th className="p-3">Loại thiết bị</th><th className="p-3 text-right">SL</th></tr></thead>
                <tbody>
                  {getBOM().map(([type, count]) => (
                    <tr key={type} className="border-t border-slate-700">
                      <td className="p-3 font-medium">{type}</td>
                      <td className="p-3 text-right text-blue-400 font-bold">{count}</td>
                    </tr>
                  ))}
                  {getBOM().length === 0 && <tr><td colSpan={2} className="p-6 text-center italic text-slate-500">Chưa có thiết bị</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <button 
          onClick={onExportImage}
          className="w-full py-2 px-4 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-lg flex items-center justify-center gap-2 transition-colors text-xs font-bold border border-blue-600/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          XUẤT ẢNH SƠ ĐỒ (PNG)
        </button>
        {isReadOnly ? (
          onExitReadOnly && <button onClick={onExitReadOnly} className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium">Thoát chế độ xem</button>
        ) : (
          <div className="flex gap-2">
            <button onClick={onExport} className="flex-1 py-2 px-4 border border-slate-700 hover:border-slate-500 rounded-lg text-slate-300 text-[10px] font-bold">LƯU JSON</button>
            <button onClick={onReset} className="py-2 px-3 border border-red-900/30 text-red-400/50 hover:text-red-400 text-[10px] font-bold">RESET</button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
