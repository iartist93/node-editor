import { reactive, type Ref } from 'vue'
import { useEditorStore } from '@/stores'
import { nanoid } from 'nanoid'
import { addConnectionToSocket, removeConnectionFromSocket, type SocketType } from '@/socket'
import { type MousePosition } from '@/mouse'

export interface ConnectionType {
  id: string
  inputSocketId: string | null
  outputSocketId: string | null
}

export const useConnection = (
  inputSocketId: string,
  outputSocketId: string | null
): ConnectionType => {
  return reactive<ConnectionType>({
    id: nanoid(),
    inputSocketId,
    outputSocketId
  })
}

export const drawConnection = (
  ctx: Ref<CanvasRenderingContext2D | null>,
  connection: ConnectionType,
  mouse: MousePosition
) => {
  if (!ctx.value) {
    console.error('You must provide CanvasRenderingContext2D')
    return
  }

  const store = useEditorStore()

  const inputSocket = connection.inputSocketId ? store.getSocket(connection.inputSocketId) : null
  const outputSocket = connection.outputSocketId ? store.getSocket(connection.outputSocketId) : null
  const targetToMouse = !connection.inputSocketId || !connection.outputSocketId

  let sourceX = inputSocket ? inputSocket.x : targetToMouse ? mouse.x : 0
  let sourceY = inputSocket ? inputSocket.y : targetToMouse ? mouse.y : 0
  let targetX = outputSocket ? outputSocket.x : targetToMouse ? mouse.x : 0
  let targetY = outputSocket ? outputSocket.y : targetToMouse ? mouse.y : 0

  console.log('$$ Draw Connection ', mouse)

  // control points
  const cp1X = sourceX + (targetX - sourceX) * (5 / 10)
  const cp2X = sourceX + (targetX - sourceX) * (5 / 10)
  const cp1Y = sourceY
  const cp2Y = targetY

  ctx.value.beginPath()
  ctx.value.moveTo(sourceX, sourceY)
  ctx.value.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, targetX, targetY)
  ctx.value.lineWidth = 3
  ctx.value.strokeStyle = 'white'
  ctx.value.stroke()
  ctx.value.closePath()
}

const startConnection = (connection: ConnectionType, socket: SocketType) => {
  const socketId = socket.id

  if (socket.type === 'input') {
    connection.outputSocketId = socketId
    connection.inputSocketId = null
  } else {
    connection.inputSocketId = socketId
    connection.outputSocketId = null
  }
}

const addSocketToConnection = (connection: ConnectionType, socket: SocketType) => {
  const socketId = socket.id

  if (socket.type === 'input') {
    connection.inputSocketId = socketId
  } else {
    connection.outputSocketId = socketId
  }

  // add connection to the socket
  addConnectionToSocket(socket, connection.id)
}

const removeSocketFromConnection = (connection: ConnectionType, socket: SocketType) => {
  const socketId = socket.id

  if (socket.type === 'input') {
    connection.inputSocketId = null
  } else {
    connection.outputSocketId = null
  }

  // remove connection from the socket
  removeConnectionFromSocket(socket, connection.id)
}
