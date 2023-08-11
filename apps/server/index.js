#!/usr/bin/env node

import * as http from "http";
import { attachWebsocketServer } from "@vlcn.io/ws-server";
import express from "express";
import { existsSync, mkdirSync } from 'fs';

const dbFolder = './dbs';
const port = process.env.PORT || 8080;

const app = express();
const server = http.createServer(app);

if (!existsSync(dbFolder)) {
  mkdirSync(dbFolder);
}

attachWebsocketServer(server, {
  schemaFolder: "./schemas",
  dbFolder,
  pathPattern: /\/sync/,
});

server.listen(port, () => console.log("info", `listening on port ${port}!`));
