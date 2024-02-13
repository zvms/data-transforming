import {
  V3UserVolunteerStatus,
  V3VolunteerMode,
  V3VolunteerStatus,
  V3VolunteerType,
} from "./v3";
import {
  ActivityMode,
  ActivityStatus,
  ActivityType,
  MemberActivityStatus,
} from "./v4-types/activity";

const v4ActivityStatus = ["", "pending", "effective", "refused", "effective"];

const v4ActivityType = ["", "specified", "social", "scale", "special"];

const v4ActivityClassify = ["", "on-campus", "off-campus", "social-practice"];

const v4ActivityMemberStatus = [
  "",
  "draft",
  "draft",
  "pending",
  "pending",
  "effective",
  "refused",
  "rejected",
];

export function getStatus(status: V3VolunteerStatus) {
  return v4ActivityStatus[status] as ActivityStatus;
}

export function getType(
  type: V3VolunteerType,
  status: V3VolunteerStatus,
  isCreatedBySystem: boolean = false
): ActivityType {
  if (status === V3VolunteerStatus.SPECIAL || isCreatedBySystem) {
    return "special";
  }
  return v4ActivityType[type] as ActivityType;
}

export function getMode(mode: V3VolunteerMode) {
  return v4ActivityClassify[mode] as ActivityMode;
}

export function getUserStatus(status: V3UserVolunteerStatus) {
  return v4ActivityMemberStatus[status] as MemberActivityStatus;
}
