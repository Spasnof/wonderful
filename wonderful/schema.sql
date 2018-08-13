DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS tables;
DROP TABLE IF EXISTS edges;

CREATE TABLE user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

CREATE TABLE tables (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id INTEGER NOT NULL,
  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  object TEXT NOT NULL,
  description TEXT NOT NULL,
  FOREIGN KEY (owner_id) REFERENCES user (id)
);

CREATE TABLE edges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_table_id INTEGER ,
  to_table_id INTEGER,
  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  description TEXT NOT NULL,
  FOREIGN KEY (from_table_id) REFERENCES tables (id),
  FOREIGN KEY (to_table_id) REFERENCES tables (id)
);



INSERT INTO user VALUES(1,'jp','pbkdf2:sha256:50000$jj2lNTIL$31a1a03c4e693f6a66de462ea214c4a273157703004903eca3ce0ec25a9acdc0');

INSERT INTO tables(owner_id, object, description) VALUES (1,'foo.telemetry', 'button click telemetry'); --id = 1
INSERT INTO tables(owner_id, object, description) VALUES (1,'sys.calendar', 'business calendar'); --id = 2
INSERT INTO tables(owner_id, object, description) VALUES (1,'bar.invoices', 'invoices'); --id = 3
INSERT INTO tables(owner_id, object, description) VALUES (1,'bar.invoice_summary', 'invoices summarized'); --id = 4
INSERT INTO tables(owner_id, object, description) VALUES (1,'kpi.kpi', 'kpis'); --id = 5

INSERT INTO edges(from_table_id, to_table_id, description) VALUES (2,1, 'button click telemetry depends on business calendar');
INSERT INTO edges(from_table_id, to_table_id, description) VALUES (2,3, 'invoices rely on business calendar');
INSERT INTO edges(from_table_id, to_table_id, description) VALUES (3,4, 'invoice summaries rely on invoices ');
INSERT INTO edges(from_table_id, to_table_id, description) VALUES (4,5, 'kpis requires invoices');
INSERT INTO edges(from_table_id, to_table_id, description) VALUES (1,5, 'kpis requires telemetry');

