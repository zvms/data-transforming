import { Database } from 'sqlite3'
import { resolve } from 'path'
import { writeFileSync } from 'fs'

function connectToSqlite() {
  const pth = resolve('database', 'zvms.db')
  return new Database(pth)
}

const tables = [
  'volunteer',
  'user',
  'class',
  'class_vol',
  'user_vol',
  'picture',
  'issue',
  'notice',
  'user_notice',
  'class_notice'
]

function exportTables(db: Database): Promise<{ key: string; value: unknown[] }[]> {
  const promises = tables.map((table: string) => {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM ${table}`, (err: Error, rows: unknown[]) => {
        if (err) {
          reject(err)
        }
        resolve({
          key: table,
          value: rows
        } as { key: string; value: unknown[] })
      })
    })
  }) as Promise<{ key: string; value: unknown[] }>[]
  return Promise.all(promises)
}

export async function exportToJSON() {
  const db = connectToSqlite()
  const folder = resolve('data', 'export')
  const tables = await exportTables(db)
  tables.forEach((table: { key: string; value: unknown[] }) => {
    console.log('Exporting table', table.key)
    writeFileSync(resolve(folder, table.key + '.json'), JSON.stringify(table.value, null, 2))
  })
}
