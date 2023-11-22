import { Database } from "sqlite3";
import { resolve } from "path";
import { writeFileSync } from "fs";

function connectToSqlite() {
  const pth = resolve("database", "zvms.db");
  return new Database(pth);
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

function exportTables(db: Database) {
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

export function exportToJSON() {
  const db = connectToSqlite();
  const folder = resolve("data", "export");
  exportTables(db).then((tables) => {
    const data = tables.reduce((acc: any, table: any, i) => {
      const tableName: any = tables[i];
      acc[tableName] = table;
      return acc;
    }, {});
    console.log(data);
  });
}
