import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'

let io: Server | null = null

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  })

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`)

    // 客户端加入指定门店的房间
    socket.on('joinStore', (storeId: number) => {
      const room = `store:${storeId}`
      socket.join(room)
      console.log(`[Socket.IO] ${socket.id} joined room ${room}`)
    })

    // 客户端离开指定门店的房间
    socket.on('leaveStore', (storeId: number) => {
      const room = `store:${storeId}`
      socket.leave(room)
      console.log(`[Socket.IO] ${socket.id} left room ${room}`)
    })

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`)
    })
  })

  console.log('[Socket.IO] Initialized')
  return io
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.IO not initialized')
  return io
}

/**
 * 向指定门店推送新预警
 */
export function emitAlert(storeId: number, alert: any): void {
  if (io) {
    io.to(`store:${storeId}`).emit('alert:new', alert)
  }
}

/**
 * 向指定门店推送预警更新
 */
export function emitAlertUpdate(storeId: number, alertId: number, status: string): void {
  if (io) {
    io.to(`store:${storeId}`).emit('alert:update', { alertId, status })
  }
}
