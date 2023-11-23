import { ObjectId } from "mongodb";
import type { V3User } from "./v3";
import type { User, UserPosition, WithPassword } from "./v4-types/user";
import { md5 } from "js-md5";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

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
  const isAutidor = permission & 4;
  const isInspector = permission & 8;
  const isAdmin = permission & 16;
  const isSystem = permission & 32;
  return (
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
        isAutidor,
        isInspector,
        isAdmin,
        isSystem,
      ][i]
  );
}

export function UserTransform(user: V3User): User<ObjectId> {
  return {
    _id: new ObjectId(),
    id: user.userid,
    name: user.username,
    sex: "unknown",
    position: getUserPosition(user.permission),
    code: user.classid * 100 + (user.userid % 100),
  };
}

export function withPassword<T>(user: User<T>): WithPassword<User<T>> {
  return {
    ...user,
    password: md5(user.id.toString()),
  };
}

export function transformUser(users: V3User[]): WithPassword<User<ObjectId>>[] {
  return users
    .map((user) => {
      return UserTransform(user);
    })
    .map((user: User<ObjectId>) => {
      return withPassword(user);
    });
}

export function transformUserToJSON() {
  const users = readFileSync(resolve("data", "export", "user.json"), "utf-8");
  const parsed = JSON.parse(users);
  const transformed = transformUser(parsed);
  writeFileSync(
    resolve("data", "handler", "user-transformed.json"),
    JSON.stringify(transformed, null, 2)
  );
}

export function findUser(user: number) {
  const list = readFileSync(
    resolve("data", "handler", "user-transformed.json"),
    "utf-8"
  );
  const parsed = JSON.parse(list) as User<ObjectId>[];
  const result = parsed.find((u: User<ObjectId>) => u.id === user)?._id as
    | ObjectId
    | string;
  if (result) {
    return new ObjectId(result);
  } else {
    throw new Error("User not found");
  }
}
