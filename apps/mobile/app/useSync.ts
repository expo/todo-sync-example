import { useEffect, useRef, useState } from "react";
import PartySocket from "partysocket";
import { db } from "./db/init";

function createPartySocket() {
  return new PartySocket({
    host: "localhost:1999", // for local development
    // host: "my-party.username.partykit.dev", // for production
    room: "my-room",
  });
}

async function handleMessageAsync(e: MessageEvent<string>) {
  const data = JSON.parse(e.data);
  const rows = data[0].rows;

  for (const row of rows) {
    const { pk, ...rest } = row;
    const sql = `INSERT INTO crsql_changes ("table", 'pk', 'cid', 'val', 'col_version', 'db_version', 'site_id') VALUES (?, ${pk}, ?, ?, ?, ?, ?)`;
    try {
      await db.execAsync(
        [
          {
            sql,
            args: Object.values(rest),
          },
        ],
        false
      );
    } catch (e) {
      console.log(e);
    }
  }
}

export function useSync() {
  const socket = useRef(createPartySocket()).current;
  const [syncEnabled, setSyncEnabled] = useState(true);

  useEffect(() => {
    const handleMessage = (e: MessageEvent<string>) => {
      if (!syncEnabled) return;
      handleMessageAsync(e);
    };

    socket.addEventListener("message", handleMessage);

    if (syncEnabled) {
      // Send an init message to get the latest changes
      socket.send("init");
    }

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket, syncEnabled]);

  useEffect(() => {
    const maybeSendChanges = async () => {
      if (syncEnabled) {
        const changes = await requestChanges();
        socket.send(JSON.stringify(changes));
      }
    };

    // Subscribe to changes
    const subscription = db.onDatabaseChange(async (result) => {
      if (result.tableName.includes("__crsql_")) return;
      maybeSendChanges();
    });

    // Also maybe send them right away, in case changes happened while sync was
    // disabled
    maybeSendChanges();

    return () => subscription.remove();
  }, [syncEnabled]);

  return {
    syncEnabled,
    setSyncEnabled,
  };
}

async function requestChanges() {
  return await db.execAsync(
    [
      {
        sql: `SELECT "table", quote(pk) as pk, cid, val, col_version, db_version, site_id FROM crsql_changes where db_version > -1`,
        args: [],
      },
    ],
    false
  );
}
