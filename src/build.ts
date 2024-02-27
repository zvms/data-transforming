import { readFile, writeFile } from 'fs/promises'
import { resolve } from 'path'
import { genSalt, hash } from 'bcrypt'
import { readFileSync } from 'fs'
import { User } from '@zvms/zvms4-types'
import { findClassId } from './group'

export async function groupTransformToImportableData() {
  const file = await readFile(resolve('data', 'handler', 'group-transformed.json'), 'utf-8')
  const parsed = JSON.parse(file)
  const mapped = parsed.map((x: any) => {
    return {
      ...x,
      _id: {
        $oid: x._id
      }
    }
  })
  await writeFile(resolve('data', 'import', 'groups.json'), JSON.stringify(mapped, null, '\t'))
  console.log('Exported the groups in', resolve('data', 'import', 'groups.json'))
}

export async function userTransformToImportableData() {
  const file = await readFile(resolve('data', 'handler', 'user-transformed-mapped.json'), 'utf-8')
  const parsed = JSON.parse(file)
const existedList = JSON.parse(readFileSync(
  resolve("database", 'user_id.json')
).toString()) as Array<{
  name: string;
  id: number;
  classid?: number;
}>
  const mapped = parsed.map(async (x: User) => {
    const salt = await genSalt()
    const password = await hash(x.id.toString(), salt)
    const classid = findClassId(x.group)
    return {
      ...x,
      password,
      _id: {
        $oid: x._id
      },
      id: existedList.find(l => x.id === l.id && l.classid === classid)?.id ?? x.id,
    }
  })
  const promised = await Promise.all(mapped)
  await writeFile(resolve('data', 'import', 'users.json'), JSON.stringify(promised, null, '\t'))
  console.log('Exported the users in', resolve('data', 'import', 'users.json'))
}

export async function activityTransformToImportableData() {
  const file = await readFile(resolve('data', 'handler', 'activity-transformed.json'), 'utf-8')
  const parsed = JSON.parse(file)
  const mapped = parsed.map((x: any) => {
    return {
      ...x,
      _id: {
        $oid: x._id
      }
    }
  })
  await writeFile(resolve('data', 'import', 'activities.json'), JSON.stringify(mapped, null, '\t'))
  console.log('Exported the activities in', resolve('data', 'import', 'activities.json'))
  console.log(
    'Now you can import the data into MongoDB using `mongoimport` with the following command:'
  )
  console.log('mongoimport --db <database> --collection <collection> --file <file> --jsonArray')
  console.log('Example:')
  console.log('mongoimport --db test --collection users --file users.json --jsonArray')
}
