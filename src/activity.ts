import { ObjectId } from "mongodb";
import { getMode, getStatus, getType, getUserStatus } from "./enum2str";
import type {
  V3ClassVolunteer,
  V3Picture,
  V3UserVolunteer,
  V3Volunteer,
  V3VolunteerMode,
} from "./v3";
import type {
  Activity,
  ActivityInstance,
  ActivityMember,
  ActivityMode,
  ActivityStatus,
  ActivityType,
  Registration,
  SpecialInstance,
  SpecifiedActivity,
} from "./v4-types/activity";
import dayjs from "dayjs";
import { findUser } from "./user";
import { readFile, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const activityOidMap = new Map<number, number>();
const activityList: V3Volunteer[] = [];

function init() {
  if (activityList.length === 0) {
    const activities = readFileSync(
      resolve("data", "export", "volunteer.json"),
      "utf-8",
    );
    const parsed = JSON.parse(activities) as V3Volunteer[];
    activityList.push(...parsed);
  }
}

export function getActivityOid(activity: V3Volunteer) {
  if (activity.description.startsWith("append to #")) {
    const lines = activity.description
      .replaceAll("\\n", "\n")
      .split("\n")
      .map((x) => x.trim());
    const oid = parseInt(lines[0].split("#")[1]);
    if (isNaN(oid)) return activity.id;
    function isInActivityList(oid: number) {
      return activityList.findIndex((x) => x.id === oid) !== -1;
    }
    if (!isInActivityList(oid)) return activity.id;
    if (activityOidMap.has(oid)) return activityOidMap.get(oid);
    activityOidMap.set(activity.id, oid);
    return oid;
  } else return activity.id;
}

export function checkActivityOid(oid: number) {
  console.log("Checking activity oid", oid);
  if (activityOidMap.has(oid)) return activityOidMap.get(oid);
  else return oid;
}

export function transformLinearStructure(activities: V3Volunteer[]) {
  return activities.map((activity) => {
    console.log(
      "Transforming activity",
      activity.id,
      "with status",
      activity.status,
    );
    const status = getStatus(activity.status) as ActivityStatus;
    const type: ActivityType =
      activity.holder === 0
        ? "special"
        : getType(activity.type, activity.status);
    const result = {
      _id: new ObjectId(),
      type,
      name: activity.name
        .replaceAll("（其他）", "")
        .replaceAll("（社团）", "")
        .replaceAll("（获奖）", "")
        .trim(),
      description: activity.description.replaceAll("自提交义工：", "").trim(),
      members: [],
      duration: activity.reward / 60,
      date: dayjs(activity.time).toISOString(),
      createdAt: dayjs().toISOString(),
      updatedAt: dayjs().toISOString(),
      creator: findUser(activity.holder).toString(),
      status,
      oid: getActivityOid(activity),
    } as ActivityInstance<ObjectId> & {
      oid: number;
    };
    const special = {
      classify:
        activity.holder === 0
          ? "import"
          : activity.name.endsWith("（其他）")
          ? "other"
          : activity.name.endsWith("（社团）")
          ? "club"
          : "other",
      mode: getMode(activity.type as 1 | 2 | 3 as V3VolunteerMode),
    } as SpecialInstance;
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
      } as SpecifiedActivity & {
        oid: number;
      };
    }
    if (result.type === "special") {
      console.log("It is a special activity.");
      return {
        ...result,
        special,
      } as SpecialInstance & {
        oid: number;
      };
    }
    return result;
  });
}

export function transformActivityMember(
  member: V3UserVolunteer,
  mode: ActivityMode,
  duration?: number,
  images: string[] = [],
) {
  const status = getUserStatus(member.status);
  console.log("Transforming member", member.userid, "with status", status);
  return {
    _id: findUser(member.userid).toString(),
    status,
    mode,
    impression: member.thought,
    duration: member.reward / 60 ?? duration,
    history: [],
    images,
  } as ActivityMember;
}

function getActivityMode(oid: number): ActivityMode {
  const idx = activityList.findIndex((x) => x.id === oid);
  if (idx === -1) return "on-campus";
  else return getMode(activityList[idx].type as 1 | 2 | 3 as V3VolunteerMode);
}

function appendMemberIntoActivity(
  activities: (ActivityInstance<ObjectId> & { oid: number })[],
  members: V3UserVolunteer[],
  images: V3Picture[] = [],
  classes: V3ClassVolunteer[] = [],
) {
  members.map((member: V3UserVolunteer) => {
    const volid = checkActivityOid(member.volid);
    const idx = activities.findIndex((x) => x.oid === volid);
    if (idx) {
      console.log("Appending member", member.userid, "into activity", idx);
      const activity = activities[idx] as Activity;
      const image = images
        .filter((x) => x.volid === member.volid && x.userid === member.userid)
        .map((x) => x.filename);
      const mode = getActivityMode(member.volid);
      console.log("Appending member", member.userid, "with mode", mode);
      if (activity.type === "special")
        activity.members.push(
          transformActivityMember(
            member,
            mode,
            activity.duration,
            image,
          ) as ActivityMember,
        );
      else if (
        activity.members.findIndex(
          (x) => x._id === findUser(member.userid).toString(),
        ) === -1
      )
        activity.members.push(
          transformActivityMember(
            member,
            mode,
            activity.duration,
            image,
          ) as ActivityMember,
        );
      else {
        console.log("Member", member.userid, "already exists in activity", idx);
        const record = activity.members.find(
          (x) => x._id === findUser(member.userid).toString(),
        );
        if (record) {
          record.images = record.images.concat(image);
          record.duration += member.reward / 60;
          /**
           * Merge Status and Impression.
           * If the status is "effective", then the impression will be appended.
           * If the status is "refused", then the impression will be replaced.
           * If the status is "rejected", then the impression will be replaced.
           * effective > rejected > pending > refused > draft
           */
          if (record.status === "effective") {
            record.impression += "\n" + member.thought;
          } else if (
            record.status === "refused" ||
            record.status === "rejected"
          ) {
            record.impression = member.thought;
            record.status =
              getUserStatus(member.status) === "effective"
                ? "effective"
                : record.status;
          }
        }
      }
    }
  });
  return activities
    .map((activity) => {
      const cls = classes.filter((x) => x.volid === activity.oid);
      if (cls.length === 0)
        console.log("No classes found for activity", activity.oid);
      else
        console.log(
          "Appending classes",
          cls.map((x) => x.classid).join(", "),
          "into activity",
          activity.oid,
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
        !x.name.includes("测试"),
    )
    .map((x) => {
      delete x.oid;
      return x;
    });
}

export function transformActivityToJSON() {
  init();
  const activities = readFileSync(
    resolve("data", "export", "volunteer.json"),
    "utf-8",
  );
  const parsed = JSON.parse(activities);
  const members = readFileSync(
    resolve("data", "export", "user_vol.json"),
    "utf-8",
  );
  const user_parsed = JSON.parse(members) as V3UserVolunteer[];
  const images = readFileSync(
    resolve("data", "export", "picture.json"),
    "utf-8",
  );
  const image_parsed = JSON.parse(images) as V3Picture[];
  const classes = readFileSync(
    resolve("data", "export", "class_vol.json"),
    "utf-8",
  );
  const class_parsed = JSON.parse(classes) as V3ClassVolunteer[];
  const transformed = transformLinearStructure(parsed);
  const appended = appendMemberIntoActivity(
    transformed,
    user_parsed,
    image_parsed,
    class_parsed,
  );
  writeFileSync(
    resolve("data", "handler", "activity-transformed.json"),
    JSON.stringify(appended, null, 2),
  );
}
