import { readFile, writeFile } from "fs/promises";
import { resolve } from "path";
import { hash } from "bcrypt";

export async function userTransformToImportableData() {
  const file = await readFile(
    resolve("data", "handler", "user-transformed-mapped.json"),
    "utf-8"
  );
  const parsed = JSON.parse(file);
  const mapped = parsed.map(async (x: any) => {
    const password = await hash(x.password, 10)
    console.log("Hashed password", x.id, "to", password, "for user", x.id);
    return {
      ...x,
      password,
      _id: {
        $oid: x._id,
      },
    };
  });
  const promised = await Promise.all(mapped)
  await writeFile(
    resolve("data", "import", "users.json"),
    JSON.stringify(promised, null, "\t")
  );
  console.log("Exported the users in", resolve("data", "import", "users.json"));
}

export async function activityTransformToImportableData() {
  const file = await readFile(
    resolve("data", "handler", "activity-transformed.json"),
    "utf-8"
  );
  const parsed = JSON.parse(file);
  const mapped = parsed.map((x: any) => {
    return {
      ...x,
      _id: {
        $oid: x._id,
      },
    };
  });
  await writeFile(
    resolve("data", "import", "activities.json"),
    JSON.stringify(mapped, null, "\t")
  );
  console.log(
    "Exported the activities in",
    resolve("data", "import", "activities.json")
  );
  console.log(
    "Now you can import the data into MongoDB using `mongoimport` with the following command:"
  );
  console.log(
    "mongoimport --db <database> --collection <collection> --file <file> --jsonArray"
  );
  console.log("Example:");
  console.log(
    "mongoimport --db test --collection users --file users.json --jsonArray"
  );
}
