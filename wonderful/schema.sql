DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS tables;
DROP TABLE IF EXISTS edges;

CREATE TABLE user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

-- TODO change "tables" to "nodes" to be consistent with the front end.
CREATE TABLE tables (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id INTEGER NOT NULL,
  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  object TEXT NOT NULL,
  description TEXT NOT NULL,
  visible INTEGER NOT NULL,
  FOREIGN KEY (owner_id) REFERENCES user (id)
);

CREATE TABLE edges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_table_id INTEGER , --TODO remove mentions of table
  to_table_id INTEGER, --TOdO remove mentions of table
  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  description TEXT NOT NULL,
  visible INTEGER NOT NULL,
  FOREIGN KEY (from_table_id) REFERENCES tables (id),
  FOREIGN KEY (to_table_id) REFERENCES tables (id)
);



INSERT INTO user VALUES(1,'jp','pbkdf2:sha256:50000$jj2lNTIL$31a1a03c4e693f6a66de462ea214c4a273157703004903eca3ce0ec25a9acdc0');
INSERT INTO user VALUES(2,'bree','pbkdf2:sha256:50000$Su0tLblM$d6f52ea74ca33f86960f8e0cbe336be919299e0a1b66a6854467bf8b5844303f');
INSERT INTO user VALUES(3,'admin','pbkdf2:sha256:50000$Fz5T8ZaP$84db92251a2e4c3d36cd039730c046d504ad0fe77d57e06dbc7eeebda8c70274');

INSERT INTO tables(owner_id, object, description, visible) VALUES (1,'foo.telemetry', 'button click telemetry',1); --id = 1
INSERT INTO tables(owner_id, object, description, visible) VALUES (1,'sys.calendar', 'business calendar',1); --id = 2
INSERT INTO tables(owner_id, object, description, visible) VALUES (1,'bar.invoices', 'invoices',1); --id = 3
INSERT INTO tables(owner_id, object, description, visible) VALUES (1,'bar.invoice_summary', 'invoices summarized',1); --id = 4
INSERT INTO tables(owner_id, object, description, visible) VALUES (1,'kpi.kpi', 'kpis',1); --id = 5
INSERT INTO tables(owner_id, object, description, visible) VALUES (2,'reporting.report1', 'kpis by month',1); --id = 6
INSERT INTO tables(owner_id, object, description, visible) VALUES (2,'reporting.report2', 'kpis by day',1); --id = 7
INSERT INTO tables(owner_id, object, description, visible) VALUES (3,'crm.crm', 'customer relationship manager',1); --id = 8
INSERT INTO tables(owner_id, object, description, visible) VALUES (3,'dev_machine.test1', 'dev machine, nothing to see here',1); --id = 9

INSERT INTO edges(visible, from_table_id, to_table_id, description) VALUES (1,2,1, 'button click telemetry depends on business calendar');
INSERT INTO edges(visible, from_table_id, to_table_id, description) VALUES (1,2,3, 'invoices rely on business calendar');
INSERT INTO edges(visible, from_table_id, to_table_id, description) VALUES (1,3,4, 'invoice summaries rely on invoices ');
INSERT INTO edges(visible, from_table_id, to_table_id, description) VALUES (1,4,5, 'kpis requires invoices');
INSERT INTO edges(visible, from_table_id, to_table_id, description) VALUES (1,1,5, 'kpis requires telemetry');
INSERT INTO edges(visible, from_table_id, to_table_id, description) VALUES (1,5,6, 'kpis feed report 1');
INSERT INTO edges(visible, from_table_id, to_table_id, description) VALUES (1,5,7, 'kpis feed report 2');
INSERT INTO edges(visible, from_table_id, to_table_id, description) VALUES (1,8,3, 'crm system can alter invoices');



