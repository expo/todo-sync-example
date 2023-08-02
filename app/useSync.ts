import { useEffect, useRef, useState } from "react";
import { db } from "./db/init";

export function useSync() {
  const ws = useRef(new WebSocket(`ws://localhost:3000`)).current;
  const [syncEnabled, setSyncEnabled] = useState(true);

  useEffect(() => {
    ws.onmessage = async (e) => {
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
  }, [syncEnabled]);

  useEffect(() => {
    const subscription = db.onDatabaseChange(async (result) => {
      if (result.tableName.includes("__crsql_")) return;
      const changes = await requestChanges();
      ws.send(JSON.stringify(changes));
    });

    return () => subscription.remove();
  }, []);

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
