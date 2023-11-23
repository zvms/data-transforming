import { ObjectId } from "mongodb";
import { getStatus, getType, getUserStatus } from "./enum2str";
import type { V3Picture, V3UserVolunteer, V3Volunteer } from "./v3";
import type { Activity, ActivityMember } from "./v4-types/activity";
import dayjs from "dayjs";
import { findUser } from "./user";
import { readFile, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

export function transformLinearStructure(activities: V3Volunteer[]) {
  return activities.map((activity) => {
    const status = getStatus(activity.status);
    const type = getType(activity.type, activity.status);
    return {
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
    } as Activity<ObjectId> & {
      oid: number;
    };
  });
}

export function transformActivityMember(
  member: V3UserVolunteer,
  duration?: number,
  images: string[] = []
) {
  const status = getUserStatus(member.status);
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
  activities: (Activity<ObjectId> & { oid: number })[],
  members: V3UserVolunteer[],
  images: V3Picture[] = []
) {
  members.map((member) => {
    const idx = activities.findIndex((x) => x.oid === member.volid);
    if (idx) {
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
  return activities.filter((x) => x.members.length !== 0);
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
  const transformed = transformLinearStructure(parsed);
  const appended = appendMemberIntoActivity(
    transformed,
    user_parsed,
    image_parsed
  );
  writeFileSync(
    resolve("data", "handler", "activity-transformed.json"),
    JSON.stringify(appended, null, 2)
  );
}
