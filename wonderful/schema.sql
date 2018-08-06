DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS tables;

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

INSERT INTO user VALUES(1,'jp','pbkdf2:sha256:50000$jj2lNTIL$31a1a03c4e693f6a66de462ea214c4a273157703004903eca3ce0ec25a9acdc0');

INSERT INTO tables(owner_id, object, description) VALUES (1,'foo', 'foo desc');
INSERT INTO tables(owner_id, object, description) VALUES (1,'foo2', 'foo desc3');
INSERT INTO tables(owner_id, object, description) VALUES (1,'foo2', 'foo desc3');