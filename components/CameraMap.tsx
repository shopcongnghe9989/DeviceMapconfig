
import React, { useEffect, useState, useRef, useImperativeHandle, forwardRef, useMemo } from 'react';
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

const ROTATION_HANDLE_OFFSET = 60; // Khoảng cách xa hơn cho ngón tay dễ xoay

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
  const [localPos, setLocalPos] = useState({ x: cam.x, y: cam.y });
  const [localRot, setLocalRot] = useState(cam.rotation);

  useEffect(() => {
    setLocalPos({ x: cam.x, y: cam.y });
    setLocalRot(cam.rotation);
  }, [cam.x, cam.y, cam.rotation]);

  const color = cam.status === CameraStatus.MAINTENANCE ? '#f59e0b' : '#3b82f6';
  const isCamera = cam.type.toLowerCase().includes('camera');
  const isNetwork = cam.type === CameraType.WIFI || cam.type === CameraType.ROUTER || cam.type === CameraType.SWITCH;
  
  const iconPath = useMemo(() => getDeviceIconPath(cam.type), [cam.type]);

  const handleRotation = (e: any) => {
    if (isReadOnly) return;
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;
    // Account for stage position/scale
    const stageX = stage.x();
    const stageY = stage.y();
    const angle = Math.atan2(pointerPos.y - (localPos.y + stageY), pointerPos.x - (localPos.x + stageX));
    const rotation = (angle * 180) / Math.PI + 90;
    setLocalRot(rotation);
  };

  return (
    <Group 
      x={localPos.x} 
      y={localPos.y}
      onClick={(e) => { e.cancelBubble = true; onClick(); }}
      onTap={(e) => { e.cancelBubble = true; onClick(); }}
      onDblClick={(e) => { e.cancelBubble = true; onDoubleClick(); }}
      onDblTap={(e) => { e.cancelBubble = true; onDoubleClick(); }}
    >
      {(isSelected || isSelectedAsSource) && (
        <Circle radius={38} stroke={isSelectedAsSource ? "#10b981" : "#ffffff"} strokeWidth={isSelected ? 3 : 2} opacity={0.4} />
      )}

      {isCamera && (
        <Wedge radius={120} angle={cam.fov || 90} fill={color} opacity={0.08} rotation={localRot - (cam.fov || 90) / 2} stroke={color} strokeWidth={1} />
      )}

      {isNetwork && (
        <Circle radius={150} fill={color} opacity={0.03} stroke={color} strokeWidth={1} dash={[10, 5]} />
      )}

      <Group 
        rotation={localRot}
        draggable={!isReadOnly}
        onDragMove={(e) => {
          setLocalPos({ x: e.target.x() + localPos.x, y: e.target.y() + localPos.y });
          e.target.position({ x: 0, y: 0 });
        }}
        onDragEnd={() => onUpdate({ ...cam, x: localPos.x, y: localPos.y })}
      >
        <Circle radius={26} fill="white" shadowBlur={isSelected ? 10 : 2} shadowOpacity={0.2} />
        <Circle radius={23} fill={color} />
        <Path data={iconPath} fill="white" scaleX={0.7} scaleY={0.7} offsetX={12} offsetY={12} />
      </Group>

      {isSelected && !isReadOnly && (
        <Group
          x={ROTATION_HANDLE_OFFSET * Math.sin((localRot * Math.PI) / 180)}
          y={-ROTATION_HANDLE_OFFSET * Math.cos((localRot * Math.PI) / 180)}
          draggable
          onDragMove={handleRotation}
          onDragEnd={() => onUpdate({ ...cam, rotation: localRot })}
        >
          {/* Hit area lớn cho mobile */}
          <Circle radius={15} fill="#3b82f6" opacity={0.1} /> 
          <Circle radius={8} fill="white" stroke="#3b82f6" strokeWidth={2} />
        </Group>
      )}

      <Text text={cam.name} y={38} width={140} align="center" offsetX={70} fontSize={11} fill="white" fontStyle="bold" shadowBlur={1} />
    </Group>
  );
};

const CameraMap = forwardRef<any, CameraMapProps>((props, ref) => {
  const { imageUrl, cameras, connections, isAddMode, isConnectionMode, connectionStartId, selectedCameraId, isReadOnly = false, onAddCamera, onUpdateCamera, onSelectCamera, onOpenModal } = props;
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [stageSize, setStageSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const stageRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    getStage: () => stageRef.current
  }));

  useEffect(() => {
    if (imageUrl) {
      const img = new window.Image();
      img.src = imageUrl;
      img.onload = () => setImage(img);
    }
  }, [imageUrl]);

  useEffect(() => {
    const updateSize = () => setStageSize({ width: window.innerWidth, height: window.innerHeight - 64 });
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleInteraction = (e: any) => {
    if (isAddMode) {
        const stage = e.target.getStage();
        const pos = stage.getPointerPosition();
        if (pos) {
            onAddCamera(pos.x - stage.x(), pos.y - stage.y());
        }
    } else if (e.target === e.target.getStage()) {
        onSelectCamera('');
    }
  };

  return (
    <div className="w-full h-full overflow-hidden bg-slate-900 touch-none">
      <Stage 
        ref={stageRef}
        width={stageSize.width} 
        height={stageSize.height}
        draggable={!isAddMode}
        onClick={handleInteraction}
        onTap={handleInteraction}
      >
        <Layer>
          {image && <KonvaImage image={image} />}
          {connections.map(conn => {
            const from = cameras.find(c => c.id === conn.fromId);
            const to = cameras.find(c => c.id === conn.toId);
            if (!from || !to) return null;
            return <Arrow key={conn.id} points={[from.x, from.y, to.x, to.y]} stroke="#64748b" strokeWidth={2} fill="#64748b" opacity={0.4} pointerLength={10} pointerWidth={10} />;
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
    </div>
  );
});

export default CameraMap;
