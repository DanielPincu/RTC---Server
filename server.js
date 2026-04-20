const { WebSocketServer } = require('ws')
const http = require('http')

const server = http.createServer((req, res) => res.end('ok'))

const wss = new WebSocketServer({ server })

let waiting = null

wss.on('connection', (ws) => {
  ws.peer = null

  ws.on('message', (msg) => {
    msg = JSON.parse(msg)

    if (msg.type === 'join') {
      if (waiting && waiting !== ws) {
        ws.peer = waiting
        waiting.peer = ws

        ws.send(JSON.stringify({ type: 'ready', initiator: true }))
        waiting.send(JSON.stringify({ type: 'ready', initiator: false }))

        waiting = null
      } else {
        waiting = ws
      }
    }

    if (['offer', 'answer', 'ice'].includes(msg.type)) {
      ws.peer?.send(JSON.stringify(msg))
    }
  })

  ws.on('close', () => {
    if (waiting === ws) waiting = null
    if (ws.peer) ws.peer.peer = null
  })
})

server.listen(3000)
console.log('ws://localhost:3000')