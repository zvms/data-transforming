import { exportToJSON } from "./export";
import { transformUserToJSON, transformUserToJSONWithMapping } from "./user";
import { transformActivityToJSON } from "./activity";

async function main() {
  console.time("export");
  await exportToJSON();
  transformUserToJSON();
  transformActivityToJSON();
  transformUserToJSONWithMapping();
  console.timeEnd("export");
}

main();
