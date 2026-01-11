
import React, { useState } from 'react';
import { CameraDevice, CameraType, CameraStatus } from '../types';

interface CameraFormModalProps {
  camera: CameraDevice;
  onClose: () => void;
  onUpdate: (cam: CameraDevice) => void;
  onDelete: (id: string) => void;
  isReadOnly?: boolean;
}

const CameraFormModal: React.FC<CameraFormModalProps> = ({ 
  camera, 
  onClose, 
  onUpdate,
  onDelete,
  isReadOnly = false
}) => {
  const [formData, setFormData] = useState<CameraDevice>({
    ...camera,
    rotation: camera.rotation || 0,
    fov: camera.fov || 90
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (isReadOnly) return;
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'rotation' || name === 'fov' ? parseInt(value) : value 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    onUpdate(formData);
  };

  const isCamera = formData.type.toLowerCase().includes('camera');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a2 2 0 002 2h3a1 1 0 011 1v6.71l-5.12 3.84a1 1 0 01-1.2 0l-5.12-3.84V8a1 1 0 011-1h3a2 2 0 002-2V4z" />
            </svg>
            {isReadOnly ? 'Thông tin thiết bị' : 'Chỉnh sửa thiết bị'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-1">Tên Thiết bị</label>
              <input
                type="text"
                name="name"
                disabled={isReadOnly}
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-70 disabled:cursor-not-allowed"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Loại thiết bị</label>
              <select
                name="type"
                disabled={isReadOnly}
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {Object.values(CameraType).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Trạng thái</label>
              <select
                name="status"
                disabled={isReadOnly}
                value={formData.status}
                onChange={handleChange}
                className={`w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed ${formData.status === CameraStatus.ACTIVE ? 'text-green-400' : 'text-amber-400'}`}
              >
                <option value={CameraStatus.ACTIVE}>{CameraStatus.ACTIVE}</option>
                <option value={CameraStatus.MAINTENANCE}>{CameraStatus.MAINTENANCE}</option>
              </select>
            </div>

            <div className="col-span-2 space-y-4 py-2 border-y border-slate-800">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-medium text-slate-400">Hướng xoay ({formData.rotation}°)</label>
                </div>
                <input
                  type="range"
                  name="rotation"
                  min="0"
                  max="360"
                  disabled={isReadOnly}
                  value={formData.rotation}
                  onChange={handleChange}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {isCamera && (
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-sm font-medium text-slate-400">Góc quan sát (FOV: {formData.fov}°)</label>
                  </div>
                  <input
                    type="range"
                    name="fov"
                    min="15"
                    max="180"
                    disabled={isReadOnly}
                    value={formData.fov}
                    onChange={handleChange}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Địa chỉ IP</label>
              <input
                type="text"
                name="ip"
                disabled={isReadOnly}
                placeholder="192.168.x.x"
                value={formData.ip}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Địa chỉ MAC</label>
              <input
                type="text"
                name="mac"
                disabled={isReadOnly}
                placeholder="00:00:00:00:00:00"
                value={formData.mac}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed font-mono text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Ghi chú</label>
            <textarea
              name="notes"
              rows={2}
              disabled={isReadOnly}
              value={formData.notes}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-70 disabled:cursor-not-allowed text-sm"
              placeholder="Vị trí chi tiết, thông tin cấu hình..."
            />
          </div>

          <div className="pt-4 flex items-center justify-between">
            {!isReadOnly ? (
              <button
                type="button"
                onClick={() => {
                  if(confirm("Xóa thiết bị này khỏi sơ đồ?")) onDelete(camera.id);
                }}
                className="text-red-400 hover:text-red-300 font-medium text-sm flex items-center gap-1 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Xóa
              </button>
            ) : (
                <div />
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
              >
                {isReadOnly ? 'Đóng' : 'Hủy'}
              </button>
              {!isReadOnly && (
                <button
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors shadow-lg shadow-blue-900/20"
                >
                    Lưu lại
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CameraFormModal;
