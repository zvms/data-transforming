export enum V3VolunteerStatus {
  UNAUDITED = 1,
  ACCEPTED = 2,
  REJECTED = 3,
  SPECIAL = 4,
}

export enum V3UserVolunteerStatus {
  WAITING_FOR_SIGNUP_AUDIT = 1,
  DRAFT = 2,
  WAITING_FOR_FIRST_AUDIT = 3,
  WAITING_FOR_FINAL_AUDIT = 4,
  ACCEPTED = 5,
  REJECTED = 6,
  SPIKE = 7,
}

export enum V3VolunteerMode {
  INSIDE = 1,
  OUTSIDE = 2,
  LARGE = 3,
}

export enum V3VolunteerType {
  INSIDE = 1,
  APPOINTED = 2,
  SPECIAL = 3,
}

export interface V3Volunteer {
  id: number;
  name: string;
  description: string;
  status: V3VolunteerStatus;
  holder: number;
  type: V3VolunteerType;
  reward: number; // minutes
  time: string; // Date
}

export interface V3UserVolunteer {
  userid: number;
  volid: number;
  status: V3UserVolunteerStatus;
  thought: string;
  reward: number; // minutes
}

export interface V3ClassVolunteer {
  classid: number;
  volid: number;
  max: number;
}

export interface V3User {
  userid: number;
  username: string;
  password: string; // md5
  permission: number;
  classid: number;
}

export interface V3Picture {
  userid: number;
  volid: number;
  filename: string;
}

export interface V3Class {
  id: number;
  name: string;
}
