/**
 * 摄像头模拟服务
 * 开发阶段用于模拟摄像头视频流和AI检测
 * 生产环境替换为真实RTSP/摄像头SDK
 */

interface CameraInfo {
  id: number
  name: string
  storeId: number
  rtspUrl: string | null
  status: boolean
}

// 模拟门店默认摄像头布局
export function getDefaultCameras(storeId: number): Array<Omit<CameraInfo, 'id'>> {
  return [
    {
      name: '商品展示区摄像头',
      storeId,
      rtspUrl: null,
      status: true,
    },
    {
      name: '仓库储存区摄像头',
      storeId,
      rtspUrl: null,
      status: true,
    },
    {
      name: '顾客停留区摄像头',
      storeId,
      rtspUrl: null,
      status: true,
    },
    {
      name: '店外出入口摄像头',
      storeId,
      rtspUrl: null,
      status: true,
    },
  ]
}

/**
 * 模拟AI检测结果
 * 在生产环境中，此处会被替换为真实的AI视觉检测调用
 */
export function simulateDetection(
  cameraId: number,
  _cameraName: string,
): {
  personCount: number
  smokeDetected: boolean
  fireDetected: boolean
  outdoorActivity: boolean
} {
  // 开发阶段返回空结果，生产环境接入真实AI
  return {
    personCount: Math.floor(Math.random() * 5), // 0-4 随机人数
    smokeDetected: false,
    fireDetected: false,
    outdoorActivity: false,
  }
}
