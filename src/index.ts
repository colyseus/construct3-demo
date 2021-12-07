import http from "http";
import express from "express";
import path from "path";
import basicAuth from "express-basic-auth";
import { monitor } from "@colyseus/monitor";

import { Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";

import { MyRoom } from "./rooms/MyRoom";

export const port = Number(process.env.PORT || 8080);

const app = express();
const gameServer = new Server({
  transport: new WebSocketTransport({
    server: http.createServer(app)
  })
});

gameServer.define("my_room", MyRoom);

// add colyseus monitor
const auth = basicAuth({ users: { 'admin': 'admin' }, challenge: true });
app.use("/colyseus", auth, monitor());
app.get("/", (req, res) => 
  res.send("Colyseus 0.15.0 - See https://docs.colyseus.io/colyseus/getting-started/construct3-client/"));

gameServer.listen(port).then(() => 
  console.log(`Listening on ${port}`));
