
export enum CameraType {
  DOME = 'Camera Dome',
  BULLET = 'Camera Bullet',
  PTZ = 'Camera PTZ',
  WIFI = 'Bộ phát WiFi',
  PTP = 'Bắn sóng PTP',
  NVR = 'Đầu ghi NVR',
  SWITCH = 'Switch',
  ROUTER = 'Router'
}

export enum CameraStatus {
  ACTIVE = 'Hoạt động',
  MAINTENANCE = 'Bảo trì'
}

export interface CameraDevice {
  id: string;
  name: string;
  ip: string;
  mac: string;
  type: CameraType;
  status: CameraStatus;
  notes: string;
  x: number;
  y: number;
  rotation: number; // 0-360 degrees
  fov: number;      // 15-180 degrees (for cameras)
}

export interface Connection {
  id: string;
  fromId: string;
  toId: string;
  type: 'wired' | 'wireless';
  label?: string;
}

export interface ProjectData {
  projectName: string;
  floorPlanImage: string | null;
  cameras: CameraDevice[];
  connections: Connection[];
  lastUpdated: string;
}
