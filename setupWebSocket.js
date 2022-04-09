// setupWebSocket.js
const { Server } = require("ws");

// accepts an http server (covered later)
const setupWebSocket = (server) => {
  // ws instance

  const wss = new Server({ noServer: true });
  // // handle upgrade of the request
  server.on("upgrade", function upgrade(request, socket, head) {
    try {
       // authentication and some other steps will come here
       // we can choose whether to upgrade or not

       wss.handleUpgrade(request, socket, head, function done(ws) {
        wss.emit("connection", ws, request);
       });
    } catch (err) {
      console.log("upgrade exception", err);
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }
  });
  
  return wss;
}

module.exports = setupWebSocket;