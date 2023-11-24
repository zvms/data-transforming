import { ObjectId } from "mongodb";
import { getStatus, getType, getUserStatus } from "./enum2str";
import type {
  V3ClassVolunteer,
  V3Picture,
  V3UserVolunteer,
  V3Volunteer,
} from "./v3";
import type {
  ActivityInstance,
  ActivityMember,
  Registration,
  SpecifiedActivity,
} from "./v4-types/activity";
import dayjs from "dayjs";
import { findUser } from "./user";
import { readFile, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import chalk from "chalk";

export function transformLinearStructure(activities: V3Volunteer[]) {
  return activities.map((activity) => {
    console.log(
      "Transforming activity",
      activity.id,
      "with status",
      activity.status
    );
    const status = getStatus(activity.status);
    const type = getType(activity.type, activity.status);
    const result = {
      _id: new ObjectId(),
      type,
      name: activity.name,
      description: activity.description,
      members: [],
      duration: activity.reward / 60,
      date: dayjs(activity.time).toISOString(),
      createdAt: dayjs().toISOString(),
      updatedAt: dayjs().toISOString(),
      creator: findUser(activity.holder).toString(),
      status,
      oid: activity.id,
    } as ActivityInstance<ObjectId> & {
      oid: number;
    };
    const registration = {
      place: "可莉不知道哦",
      deadline: dayjs(activity.time).toISOString(),
      classes: [],
    } as Registration;
    if (result.type === "specified") {
      console.log("It is a specified activity.");
      return {
        ...result,
        registration: registration,
      } as SpecifiedActivity<ObjectId> & {
        oid: number;
      };
    } else return result;
  });
}

export function transformActivityMember(
  member: V3UserVolunteer,
  duration?: number,
  images: string[] = []
) {
  const status = getUserStatus(member.status);
  console.log("Transforming member", member.userid, "with status", status);
  return {
    _id: findUser(member.userid).toString(),
    status,
    impression: member.thought,
    duration: member.reward / 60 ?? duration,
    history: [],
    images,
  } as ActivityMember;
}

function appendMemberIntoActivity(
  activities: (ActivityInstance<ObjectId> & { oid: number })[],
  members: V3UserVolunteer[],
  images: V3Picture[] = [],
  classes: V3ClassVolunteer[] = []
) {
  members.map((member) => {
    const idx = activities.findIndex((x) => x.oid === member.volid);
    if (idx) {
      console.log("Appending member", member.userid, "into activity", idx);
      const activity = activities[idx];
      const image = images
        .filter((x) => x.volid === member.volid && x.userid === member.userid)
        .map((x) => x.filename);
      activity.members.push(
        transformActivityMember(
          member,
          activity.duration,
          image
        ) as ActivityMember
      );
    }
  });
  return activities
    .map((activity) => {
      const cls = classes.filter((x) => x.volid === activity.oid);
      console.log(
        "Appending classes",
        cls.map((x) => x.classid),
        "into activity",
        activity.oid
      );
      if (cls.length !== 0 && activity.type === "specified") {
        return {
          ...activity,
          registration: {
            ...activity.registration,
            classes: cls.map((x) => ({
              class: x.classid,
              min: 0,
              max: x.max,
            })),
          },
        };
      } else return activity;
    })
    .filter(
      (x) =>
        x.members.length !== 0 &&
        !x.description.includes(".ignore") &&
        !x.description.includes("测试") &&
        !x.name.includes("测试")
    );
}

export function transformActivityToJSON() {
  const activities = readFileSync(
    resolve("data", "export", "volunteer.json"),
    "utf-8"
  );
  const parsed = JSON.parse(activities);
  const members = readFileSync(
    resolve("data", "export", "user_vol.json"),
    "utf-8"
  );
  const user_parsed = JSON.parse(members) as V3UserVolunteer[];
  const images = readFileSync(
    resolve("data", "export", "picture.json"),
    "utf-8"
  );
  const image_parsed = JSON.parse(images) as V3Picture[];
  const classes = readFileSync(
    resolve("data", "export", "class_vol.json"),
    "utf-8"
  );
  const class_parsed = JSON.parse(classes) as V3ClassVolunteer[];
  const transformed = transformLinearStructure(parsed);
  const appended = appendMemberIntoActivity(
    transformed,
    user_parsed,
    image_parsed,
    class_parsed
  );
  writeFileSync(
    resolve("data", "handler", "activity-transformed.json"),
    JSON.stringify(appended, null, 2)
  );
}
