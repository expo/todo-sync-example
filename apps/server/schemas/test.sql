CREATE TABLE IF NOT EXISTS "todo" (id INTEGER PRIMARY KEY ASC, text, completed INTEGER DEFAULT 0);
SELECT crsql_as_crr('todo');