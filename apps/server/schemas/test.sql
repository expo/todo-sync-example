CREATE TABLE IF NOT EXISTS "todo" ("id" PRIMARY KEY, "text", "completed" INTEGER DEFAULT 0);
SELECT crsql_as_crr('todo');