
import React, { useState } from 'react';
import { ProjectData } from '../types';

interface HeaderProps {
  project: ProjectData;
  setProject: (p: ProjectData) => void;
  isReadOnly?: boolean;
}

const Header: React.FC<HeaderProps> = ({ project, setProject, isReadOnly = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(project.projectName);

  const handleSave = () => {
    setProject({ ...project, projectName: tempName });
    setIsEditing(false);
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {isEditing && !isReadOnly ? (
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={tempName} 
              onChange={(e) => setTempName(e.target.value)}
              className="bg-slate-800 border border-blue-500 rounded px-3 py-1 text-lg font-semibold focus:outline-none"
              autoFocus
            />
            <button onClick={handleSave} className="text-green-500 hover:text-green-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </button>
          </div>
        ) : (
          <h1 
            className={`text-xl font-bold text-slate-100 ${!isReadOnly ? 'cursor-pointer hover:text-blue-400 transition-colors' : ''}`}
            onClick={() => !isReadOnly && setIsEditing(true)}
          >
            {project.projectName}
          </h1>
        )}
        <div className="flex gap-2 items-center">
            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
            {project.cameras.length} Thiết bị
            </span>
            {isReadOnly && (
                <span className="text-[10px] uppercase font-bold text-blue-400 border border-blue-400/30 bg-blue-400/10 px-2 py-0.5 rounded tracking-wider">
                    Chỉ xem
                </span>
            )}
        </div>
      </div>
      
      <div className="text-sm text-slate-400 flex items-center gap-4">
        <span className="hidden md:inline">
          Cập nhật cuối: {new Date(project.lastUpdated).toLocaleString('vi-VN')}
        </span>
      </div>
    </header>
  );
};

export default Header;
