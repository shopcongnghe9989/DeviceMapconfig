
import React, { useEffect, useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Group, Circle, Path, Text, Wedge, Arrow } from 'react-konva';
import { CameraDevice, CameraType, CameraStatus, Connection } from '../types';

interface CameraMapProps {
  imageUrl: string | null;
  cameras: CameraDevice[];
  connections: Connection[];
  isAddMode: boolean;
  isConnectionMode: boolean;
  connectionStartId: string | null;
  selectedCameraId: string | null;
  isReadOnly?: boolean;
  onAddCamera: (x: number, y: number) => void;
  onUpdateCamera: (cam: CameraDevice) => void;
  onSelectCamera: (id: string) => void;
  onOpenModal: () => void;
}

const ROTATION_HANDLE_OFFSET = 45;

const getDeviceIconPath = (type: CameraType) => {
  switch (type) {
    case CameraType.WIFI:
      return "M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a10 10 0 0114.142 0M1.393 8.939a15 15 0 0121.214 0";
    case CameraType.NVR:
    case CameraType.SWITCH:
    case CameraType.ROUTER:
      return "M5 7a2 2 0 012-2h10a2 2 0 012 2v3a2 2 0 01-2 2H7a2 2 0 01-2-2V7zm0 10a2 2 0 012-2h10a2 2 0 012 2v3a2 2 0 01-2 2H7a2 2 0 01-2-2v-3z";
    case CameraType.PTP:
      return "M19 11l-4-4m0 0l-4 4m4-4v12M5 19l4-4m0 0l4 4m-4-4V3";
    default:
      return "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z";
  }
};

const CameraIcon: React.FC<{ 
    cam: CameraDevice; 
    isReadOnly: boolean;
    isSelected: boolean;
    isSelectedAsSource: boolean;
    onUpdate: (cam: CameraDevice) => void;
    onClick: () => void;
    onDoubleClick: () => void;
}> = ({ cam, isReadOnly, isSelected, isSelectedAsSource, onUpdate, onClick, onDoubleClick }) => {
  const isMaintenance = cam.status === CameraStatus.MAINTENANCE;
  const color = isMaintenance ? '#f59e0b' : '#3b82f6';
  const isCamera = cam.type.toLowerCase().includes('camera');
  const isNetwork = cam.type === CameraType.WIFI || cam.type === CameraType.ROUTER || cam.type === CameraType.SWITCH;
  
  const pathData = getDeviceIconPath(cam.type);

  const handleRotation = (e: any) => {
    if (isReadOnly) return;
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;
    const angle = Math.atan2(pointerPos.y - cam.y, pointerPos.x - cam.x);
    const rotation = (angle * 180) / Math.PI + 90;
    onUpdate({ ...cam, rotation: rotation });
  };

  return (
    <Group 
      x={cam.x} 
      y={cam.y}
      onClick={(e) => { e.cancelBubble = true; onClick(); }}
      onTap={(e) => { e.cancelBubble = true; onClick(); }}
      onDblClick={(e) => { e.cancelBubble = true; onDoubleClick(); }}
      onDblTap={(e) => { e.cancelBubble = true; onDoubleClick(); }}
    >
      {(isSelected || isSelectedAsSource) && (
        <Circle
          radius={30}
          stroke={isSelectedAsSource ? "#10b981" : "#ffffff"}
          strokeWidth={isSelected ? 3 : 2}
          opacity={0.5}
          dash={isSelected ? [] : [5, 2]}
        />
      )}

      {isCamera && (
        <Wedge
          radius={120}
          angle={cam.fov || 90}
          fill={color}
          opacity={0.15}
          rotation={(cam.rotation || 0) - (cam.fov || 90) / 2}
          stroke={color}
          strokeWidth={1}
          dash={[5, 5]}
        />
      )}

      {isNetwork && (
        <Circle
            radius={150}
            fill={color}
            opacity={0.05}
            stroke={color}
            strokeWidth={1}
            dash={[10, 5]}
        />
      )}

      <Group 
        rotation={cam.rotation || 0}
        draggable={!isReadOnly}
        onDragMove={(e) => {
          onUpdate({ ...cam, x: e.target.x() + cam.x, y: e.target.y() + cam.y });
          e.target.position({ x: 0, y: 0 });
        }}
      >
        <Circle radius={22} fill="white" shadowBlur={isSelected ? 15 : 5} shadowOpacity={0.3} />
        <Circle radius={20} fill={color} />
        <Path data={pathData} fill="white" scaleX={0.6} scaleY={0.6} offsetX={12} offsetY={12} />
      </Group>

      {isSelected && !isReadOnly && (
        <Group
          x={ROTATION_HANDLE_OFFSET * Math.sin((cam.rotation * Math.PI) / 180)}
          y={-ROTATION_HANDLE_OFFSET * Math.cos((cam.rotation * Math.PI) / 180)}
          draggable
          onDragMove={handleRotation}
        >
          <Circle radius={6} fill="white" stroke="#3b82f6" strokeWidth={2} shadowBlur={5} />
        </Group>
      )}

      <Text text={cam.name} y={32} width={140} align="center" offsetX={70} fontSize={12} fill="white" fontStyle="bold" shadowBlur={4} />
    </Group>
  );
};

const CameraMap = forwardRef<any, CameraMapProps>((props, ref) => {
  const { imageUrl, cameras, connections, isAddMode, isConnectionMode, connectionStartId, selectedCameraId, isReadOnly = false, onAddCamera, onUpdateCamera, onSelectCamera, onOpenModal } = props;
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    getStage: () => stageRef.current
  }));

  useEffect(() => {
    if (imageUrl) {
      const img = new window.Image();
      img.src = imageUrl;
      img.onload = () => { setImage(img); updateSize(); };
    } else {
      setImage(null);
    }
  }, [imageUrl]);

  const updateSize = () => {
    if (containerRef.current) {
      setStageSize({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight
      });
    }
  };

  useEffect(() => {
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleStageClick = (e: any) => {
    if (isReadOnly) return;
    if (isAddMode) {
      const stage = e.target.getStage();
      const pointerPosition = stage.getPointerPosition();
      if (pointerPosition) onAddCamera(pointerPosition.x, pointerPosition.y);
    } else {
      if (e.target === e.target.getStage() || (image && e.target.className === 'Image')) {
        onSelectCamera('');
      }
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full overflow-auto custom-scrollbar relative bg-slate-900 select-none">
      {image && (
        <Stage 
          ref={stageRef}
          width={Math.max(stageSize.width, image.width)} 
          height={Math.max(stageSize.height, image.height)}
          onClick={handleStageClick}
          onTap={handleStageClick}
          className={isAddMode ? 'cursor-crosshair' : 'cursor-default'}
        >
          <Layer>
            <KonvaImage image={image} />
            {connections.map(conn => {
              const from = cameras.find(c => c.id === conn.fromId);
              const to = cameras.find(c => c.id === conn.toId);
              if (!from || !to) return null;
              return (
                <Arrow
                  key={conn.id}
                  points={[from.x, from.y, to.x, to.y]}
                  stroke="#64748b"
                  strokeWidth={2}
                  fill="#64748b"
                  pointerLength={10}
                  pointerWidth={10}
                  opacity={0.7}
                />
              );
            })}
            {cameras.map((cam) => (
              <CameraIcon 
                key={cam.id} 
                cam={cam} 
                isReadOnly={isReadOnly}
                isSelected={selectedCameraId === cam.id}
                isSelectedAsSource={connectionStartId === cam.id}
                onUpdate={onUpdateCamera}
                onClick={() => onSelectCamera(cam.id)}
                onDoubleClick={onOpenModal}
              />
            ))}
          </Layer>
        </Stage>
      )}
      {(isAddMode || isConnectionMode) && !isReadOnly && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-6 py-3 bg-slate-800 text-white rounded-full font-bold shadow-2xl flex items-center gap-2 animate-pulse z-10 border border-slate-700">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isAddMode ? "M12 4v16m8-8H4" : "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"} />
          </svg>
          {isAddMode ? 'Chạm để đặt thiết bị mới' : (connectionStartId ? 'Chọn thiết bị đích' : 'Chọn thiết bị nguồn')}
        </div>
      )}
    </div>
  );
});

export default CameraMap;
