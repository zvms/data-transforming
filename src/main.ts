import { exportToJSON } from "./export";
import { transformUserToJSON, transformUserToJSONWithMapping } from "./user";
import { transformActivityToJSON } from "./activity";
import {
  activityTransformToImportableData,
  userTransformToImportableData,
} from "./build";
import { copyZVMSSqliteDatabase } from "./copy";

async function main() {
  console.time("export");
  await copyZVMSSqliteDatabase();
  await exportToJSON();
  transformUserToJSON();
  transformActivityToJSON();
  transformUserToJSONWithMapping();
  await userTransformToImportableData();
  await activityTransformToImportableData();
  console.timeEnd("export");
}

main();
