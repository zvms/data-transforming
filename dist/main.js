'use strict';

var sqlite3 = require('sqlite3');
var path = require('path');

function connectToSqlite() {
  const pth = path.resolve("database", "zvms.db");
  return new sqlite3.Database(pth);
}

const tables = [
  "volunteer",
  "user",
  "class",
  "class_vol",
  "user_vol",
  "picture",
  "issue",
  "notice",
  "user_notice",
  "class_notice",
];

function exportTables(db) {
  const promises = tables.map((table) => {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM ${table}`, (err, rows) => {
        if (err) {
          reject(err);
        }
        resolve(rows);
      });
    });
  });
  return Promise.all(promises);
}

function exportToJSON() {
  const db = connectToSqlite();
  path.resolve("data", "export");
  exportTables(db).then((tables) => {
    const data = tables.reduce((acc, table, i) => {
      const tableName = tables[i];
      acc[tableName] = table;
      return acc;
    }, {});
    console.log(data);
  });
}

exportToJSON();
