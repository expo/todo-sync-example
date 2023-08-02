import { useEffect, useRef, useState } from "react";
import { db } from "./db/init";

export function useSync() {
  const ws = useRef(new WebSocket(`ws://localhost:3000`)).current;
  const [syncEnabled, setSyncEnabled] = useState(true);

  useEffect(() => {
    const handleMessage = async (e) => {
      if (!syncEnabled) return;

      const data = JSON.parse(e.data);
      const rows = data[0].rows;

      for (const row of rows) {
        const { pk, ...rest } = row;
        const sql = `INSERT INTO crsql_changes ("table", 'pk', 'cid', 'val', 'col_version', 'db_version', 'site_id') VALUES (?, ${pk}, ?, ?, ?, ?, ?)`;
        await db.execAsync(
          [
            {
              sql,
              args: Object.values(rest),
            },
          ],
          false
        );
      }
    };

    ws.onmessage = handleMessage;
  }, [syncEnabled]);

  useEffect(() => {
    const maybeSendChanges = async () => {
      if (syncEnabled) {
        const changes = await requestChanges();
        ws.send(JSON.stringify(changes));
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
