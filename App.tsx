
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ProjectData, CameraDevice, CameraType, CameraStatus, Connection } from './types';
import Sidebar from './components/Sidebar';
import CameraMap from './components/CameraMap';
import CameraFormModal from './components/CameraFormModal';
import Header from './components/Header';
import PublishModal from './components/PublishModal';
import * as pdfjs from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.10.38/build/pdf.worker.mjs';

const STORAGE_KEY = 'cctv_project_v2';

const App: React.FC = () => {
  const [project, setProject] = useState<ProjectData>({
    projectName: 'Dự án mặc định',
    floorPlanImage: null,
    cameras: [],
    connections: [],
    lastUpdated: new Date().toISOString(),
  });

  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [isConnectionMode, setIsConnectionMode] = useState(false);
  const [connectionStartId, setConnectionStartId] = useState<string | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [publishUrl, setPublishUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const mapRef = useRef<any>(null);

  const toBase64 = (str: string) => btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode(parseInt(p1, 16))));
  const fromBase64 = (str: string) => decodeURIComponent(Array.prototype.map.call(atob(str), (c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#share=')) {
      try {
        const encodedData = hash.replace('#share=', '');
        const decodedData = JSON.parse(fromBase64(encodedData));
        setProject(decodedData);
        setIsReadOnly(true);
        return;
      } catch (e) { console.error(e); }
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) { try { setProject(JSON.parse(saved)); } catch (e) { console.error(e); } }
  }, []);

  const saveProject = useCallback((data: ProjectData) => {
    if (isReadOnly) return;
    const updatedProject = { ...data, lastUpdated: new Date().toISOString() };
    setProject(updatedProject);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProject));
  }, [isReadOnly]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type === 'application/pdf') {
      setIsProcessing(true);
      (async () => {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise;
          saveProject({ ...project, floorPlanImage: canvas.toDataURL('image/png') });
        } catch (e) { alert("Lỗi xử lý PDF"); } finally { setIsProcessing(false); }
      })();
    } else {
      const reader = new FileReader();
      reader.onload = (event) => saveProject({ ...project, floorPlanImage: event.target?.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleExportImage = () => {
    if (mapRef.current) {
        const stage = mapRef.current.getStage();
        const dataURL = stage.toDataURL({ pixelRatio: 2 });
        const link = document.createElement('a');
        link.download = `SODO_${project.projectName}.png`;
        link.href = dataURL;
        link.click();
    }
  };

  const addCamera = (x: number, y: number) => {
    if (isReadOnly) return;
    const newCamera: CameraDevice = { id: `cam_${Date.now()}`, name: `Thiết bị ${project.cameras.length + 1}`, ip: '', mac: '', type: CameraType.DOME, status: CameraStatus.ACTIVE, notes: '', x, y, rotation: 0, fov: 90 };
    saveProject({ ...project, cameras: [...project.cameras, newCamera] });
    setSelectedCameraId(newCamera.id);
    setIsModalOpen(true);
    setIsAddMode(false);
  };

  const handleDeviceClick = (id: string) => {
    if (isConnectionMode) {
      if (!connectionStartId) setConnectionStartId(id);
      else {
        if (connectionStartId !== id) {
          const newConn: Connection = { id: `conn_${Date.now()}`, fromId: connectionStartId, toId: id, type: 'wired' };
          saveProject({ ...project, connections: [...(project.connections || []), newConn] });
        }
        setConnectionStartId(null);
        setIsConnectionMode(false);
      }
    } else setSelectedCameraId(id);
  };

  const deleteCamera = (id: string) => {
    if (isReadOnly) return;
    saveProject({ ...project, cameras: project.cameras.filter(c => c.id !== id), connections: (project.connections || []).filter(c => c.fromId !== id && c.toId !== id) });
    setIsModalOpen(false);
    setSelectedCameraId(null);
  };

  const selectedCamera = project.cameras.find(c => c.id === selectedCameraId) || null;

  return (
    <div className="flex h-screen w-full bg-slate-950 overflow-hidden">
      <Sidebar 
        project={project}
        onFileUpload={handleFileUpload}
        onExport={() => {
            const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${project.projectName}.json`;
            link.click();
        }}
        onExportImage={handleExportImage}
        onPublish={() => setPublishUrl(`${window.location.origin}${window.location.pathname}#share=${toBase64(JSON.stringify(project))}`)}
        onCameraSelect={handleDeviceClick}
        isAddMode={isAddMode}
        setIsAddMode={(v) => { setIsAddMode(v); setIsConnectionMode(false); }}
        isConnectionMode={isConnectionMode}
        setIsConnectionMode={(v) => { setIsConnectionMode(v); setIsAddMode(false); setConnectionStartId(null); }}
        onDeleteConnection={(id) => saveProject({ ...project, connections: project.connections.filter(c => c.id !== id) })}
        isReadOnly={isReadOnly}
        onExitReadOnly={() => { window.location.hash = ''; window.location.reload(); }}
        onReset={() => { if(confirm("Reset?")) saveProject({ ...project, cameras: [], connections: [], floorPlanImage: null }); }}
      />
      <main className="flex-1 flex flex-col min-w-0 relative">
        <Header project={project} setProject={saveProject} isReadOnly={isReadOnly} />
        {isProcessing && <div className="absolute inset-0 z-50 bg-slate-950/60 flex items-center justify-center"><div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 flex flex-col items-center gap-4"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div><p className="text-white font-medium">Đang xử lý...</p></div></div>}
        <div className="flex-1 relative bg-slate-900 overflow-hidden">
          <CameraMap 
            ref={mapRef}
            imageUrl={project.floorPlanImage}
            cameras={project.cameras}
            connections={project.connections || []}
            isAddMode={isAddMode}
            isConnectionMode={isConnectionMode}
            connectionStartId={connectionStartId}
            selectedCameraId={selectedCameraId}
            isReadOnly={isReadOnly}
            onAddCamera={addCamera}
            onUpdateCamera={(cam) => saveProject({ ...project, cameras: project.cameras.map(c => c.id === cam.id ? cam : c) })}
            onSelectCamera={handleDeviceClick}
            onOpenModal={() => setIsModalOpen(true)}
          />
          {!project.floorPlanImage && !isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center flex-col text-slate-400">
              <div className="p-8 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center">
                <svg className="w-16 h-16 mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <p className="text-xl font-medium mb-2">Chưa có bản vẽ hệ thống</p>
                {!isReadOnly && <label className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg cursor-pointer transition-colors shadow-lg">Tải lên bản vẽ (PDF/Ảnh)<input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileUpload} /></label>}
              </div>
            </div>
          )}
        </div>
      </main>
      {isModalOpen && selectedCamera && (
        <CameraFormModal camera={selectedCamera} isReadOnly={isReadOnly} onClose={() => setIsModalOpen(false)} onUpdate={(updatedCam) => { saveProject({ ...project, cameras: project.cameras.map(c => c.id === updatedCam.id ? updatedCam : c) }); setIsModalOpen(false); }} onDelete={deleteCamera} />
      )}
      {publishUrl && <PublishModal url={publishUrl} onClose={() => setPublishUrl(null)} />}
    </div>
  );
};

export default App;
