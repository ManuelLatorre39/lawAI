import { io } from "socket.io-client"

export const socket = io('http://localhost:8005', {
  autoConnect: false,
})
