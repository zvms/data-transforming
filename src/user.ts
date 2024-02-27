import { ObjectId } from "mongodb";
import type { V3User } from "./v3";
import type { User, UserPosition, WithPassword } from "@zvms/zvms4-types";
import { md5 } from "js-md5";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { ZhenhaiHighSchool } from "./studentCode";
import { hashSync } from "bcrypt";
import { getUserGroups } from "./group";


const zhzx = new ZhenhaiHighSchool();

export function getUserPosition(permission: number): UserPosition[] {
  /**
   * 1. Student - 0
   * 2. Secretary - 1
   * 3. Auditor - 2
   * 4. Department - 4
   * 4. Inspector - 8
   * 5. Admin - 16
   * 6. System - 32
   * Stackable, Unique
   */
  const isStudent = true;
  const isSecretary = permission & 1;
  const isDepartment = permission & 2;
  const isAuditor = permission & 4;
  const isInspector = permission & 8;
  const isAdmin = permission & 16;
  const isSystem = permission & 32;
  const result = (
    [
      "student",
      "secretary",
      "department",
      "auditor",
      "inspector",
      "admin",
      "system",
    ] as UserPosition[]
  ).filter(
    (_, i) =>
      [
        isStudent,
        isSecretary,
        isDepartment,
        isAuditor,
        isInspector,
        isAdmin,
        isSystem,
      ][i]
  );
  return result;
}

export function UserTransform(user: V3User): User {
  const result = {
    _id: new ObjectId().toString(),
    id: user.userid,
    name: user.username,
    sex: "unknown" as "unknown",
    group: getUserGroups(user)
  } as User;
  console.log("Transformed user", user.userid, "with id", result._id);
  return result;
}
export function transformUser(users: V3User[]): User[] {
  return users
    .map((user) => {
      return UserTransform(user);
    })
}

export function transformUserToJSON() {
  const users = readFileSync(resolve("data", "export", "user.json"), "utf-8");
  const parsed = JSON.parse(users);
  const transformed = transformUser(parsed);
  writeFileSync(
    resolve("data", "handler", "user-transformed.json"),
    JSON.stringify(transformed, null, 2)
  );
  const interclassMap = getUserWhoseNumberIsNotStartsWithClassId(parsed);
  const class2Grade2023 = resortNumberListInClass2Grade2023();
  const maps = [interclassMap, class2Grade2023].flat(1);
  writeFileSync(
    resolve("data", "handler", "mappings.json"),
    JSON.stringify(
      maps.filter((x) => x?.code && x),
      null,
      2
    )
  );
  writeFileSync(
    resolve("data", "handler", "classid-changed.json"),
    JSON.stringify(getUserWhoseNumberIsNotStartsWithClassId(parsed), null, 2)
  );
  writeFileSync(
    resolve("data", "handler", "class2-2023.json"),
    JSON.stringify(resortNumberListInClass2Grade2023(), null, 2)
  );
}

const userMap: User[] = [];

export function findUser(user: number) {
  if (userMap.length === 0) {
    const list = readFileSync(
      resolve("data", "handler", "user-transformed.json"),
      "utf-8"
    );
    userMap.push(...(JSON.parse(list) as User[]));
  }
  const result = userMap.find((u: User) => u.id === user)?._id as
    | ObjectId
    | string;
  if (result) {
    console.log("Found user", user, "with id", result);
    return new ObjectId(result);
  } else {
    throw new Error("User not found");
  }
}

export function getUserWhoseNumberIsNotStartsWithClassId(users: V3User[]) {
  return users
    .filter((user) => {
      return !user.userid.toString().startsWith(user.classid.toString());
    })
    .map((x) => {
      zhzx.studentExchange({
        _id: findUser(x.userid).toString(),
        toClass: x.classid,
        previous: x.userid,
      });
      // Grade 2022, their `id` is not changed, but in Grade 2023, their `id` is changed.
      const result = {
        _id: findUser(x.userid),
        id: x.userid,
        name: x.username,
        code: zhzx.getUserCode(findUser(x.userid).toString(), x.classid),
      };
      if (x.userid > 20229999 && result.code) {
        const ending = result.code % 100;
        result.id = x.classid * 100 + ending;
      }
      return result;
    });
}

export function resortNumberListInClass2Grade2023() {
  const studentList = zhzx
    .getClassStudentList(2023, 2)
    ?.map((x) => {
      const code = zhzx.getUserCode(x._id, 202302) ?? 0;
      return {
        _id: x._id,
        id: 20230200 + (code % 100),
        name: x.name,
        code,
      };
    })
    .sort((a, b) => a.code - b.code);
  return studentList;
}

interface UserMapping {
  _id: string;
  id: number;
  name: string;
  code: number;
}

export function mappingUser(users: User[], mappings: UserMapping[]) {
  return users.map((user) => {
    if (user.id > 20219999) {
      const map = mappings.find((x) => x._id === user._id.toString());
      if (map) {
        return {
          ...user,
          id: map.id,
          password: map.id,
        };
      } else return user;
    } else return user;
  }) as User[]
}

export function transformUserToJSONWithMapping() {
  const users = readFileSync(
    resolve("data", "handler", "user-transformed.json"),
    "utf-8"
  );
  const maps = readFileSync(
    resolve("data", "handler", "mappings.json"),
    "utf-8"
  );
  const parsed = JSON.parse(users);
  const mapsParsed = JSON.parse(maps);
  const mapped = mappingUser(
    parsed as unknown as User[],
    mapsParsed as UserMapping[]
  ).map((x) => {
    x.name = x.name.replace(/[A-Za-z0-9]+/, "");
    console.log(
      "Mapped user",
      x.id,
      "with id",
      x._id,
      "to name",
      x.name,
    );
    return x;
  });
  writeFileSync(
    resolve("data", "handler", "user-transformed-mapped.json"),
    JSON.stringify(mapped, null, 2)
  );
}
