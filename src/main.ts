import { exportToJSON } from './export'
import { transformUserToJSON, transformUserToJSONWithMapping } from './user'
import { transformActivityToJSON } from './activity'
import {
  activityTransformToImportableData,
  userTransformToImportableData,
  groupTransformToImportableData
} from './build'
import { copyZVMSSqliteDatabase } from './copy'
import { exportClassToGroup } from './group'

async function main() {
  console.time('export')
  // await copyZVMSSqliteDatabase();
  await exportToJSON()
  exportClassToGroup()
  transformUserToJSON()
  transformActivityToJSON()
  transformUserToJSONWithMapping()
  await groupTransformToImportableData()
  await userTransformToImportableData()
  await activityTransformToImportableData()
  console.timeEnd('export')
}

main()
