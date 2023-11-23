import { exportToJSON } from "./export";
import { transformUserToJSON } from "./user";
import { transformActivityToJSON } from "./activity";

async function main() {
  await exportToJSON();
  transformUserToJSON();
  transformActivityToJSON();
}

main();
