import { io, Socket } from 'socket.io-client'
import { useUserStore } from '@/stores/user'

let socket: Socket | null = null

export function useSocket() {
  const getSocket = (): Socket | null => {
    if (socket?.connected) return socket

    const userStore = useUserStore()
    const userId = (userStore.user as any)?.id

    socket = io('/pay', {
      path: '/socket.io',
      query: { userId: userId || '' },
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      console.log('[Socket] connected')
    })

    socket.on('disconnect', () => {
      console.log('[Socket] disconnected')
    })

    return socket
  }

  return { getSocket }
}
