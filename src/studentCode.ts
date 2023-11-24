import { findUser } from "./user";

interface User {
  _id: string;
  id: number;
  name: string;
}

interface UserClassChange {
  _id: string;
  toClass: number;
  previous: number;
}

export class Class {
  public studentList: User[] = [];
  private codeStart = 0;
  public classid = 0;
  constructor(cid: number) {
    const year = Math.floor(cid / 100);
    const classid = cid % 100;
    const yearInCode = year % 100;
    this.classid = cid;
    const specialCodeMap = {
      9: {
        schoolId: 39,
        classId: 1,
      },
      10: {
        schoolId: 39,
        classId: 2,
      },
      11: {
        schoolId: 9,
        classId: 9,
      },
      12: {
        schoolId: 9,
        classId: 10,
      },
    } as Record<number, { schoolId: number; classId: number }>;
    if (
      Object.entries(specialCodeMap)
        .map((x) => x[0].toString())
        .includes(classid.toString())
    ) {
      const res = specialCodeMap[classid];
      this.codeStart = res.schoolId * 10000 + yearInCode * 100 + res.classId;
    } else {
      const id = classid % 100;
      if (id < 10) {
        this.codeStart = 90000 + yearInCode * 100 + classid;
      } else {
        this.codeStart = 390000 + yearInCode * 100 + (classid % 10);
      }
    }
  }
  public appendUser(user: User) {
    this.studentList.push(user);
    console.log(
      "Stored user with id",
      user.id,
      "in _id",
      user._id,
      "into class",
      this.classid
    );
  }
  public removeUser(_id: string) {
    this.studentList = this.studentList.filter((x) => x._id !== _id);
  }
  public getUserCode(_id: string) {
    const idx = this.studentList.findIndex((x) => x._id === _id);
    return this.codeStart * 100 + idx + 1;
  }
  public getUser(_id: string) {
    console.log(
      "Getting user",
      _id,
      "from class",
      this.classid,
      this.studentList.find((x) => x._id === _id),
      "in",
      this.studentList
    );
    return this.studentList.find((x) => x._id === _id);
  }
}

export class ZhenhaiHighSchool {
  private classList: Class[] = [];
  constructor() {
    for (let y = 2022; y <= 2023; y++) {
      for (let i = 1; i <= 17; i++) {
        this.classList.push(new Class(y * 100 + i));
      }
    }
  }
  public appendUser(user: User) {
    console.log(
      "Append user",
      user.id,
      "into class",
      Math.floor(user.id / 100)
    );
    const idx = this.classList.findIndex(
      (x) => x.classid === Math.floor(user.id / 100)
    );
    if (idx !== -1) this.classList[idx].appendUser(user);
  }
  public removeUser(_id: string, classid: number) {
    const cls = this.classList.find((x) => x.classid === classid);
    cls?.removeUser(_id);
  }
  public getUserCode(_id: string, classid: number) {
    const idx = this.classList.findIndex((x) => x.classid === classid);
    if (idx !== -1) return this.classList[idx].getUserCode(_id);
  }
  public studentExchange(change: UserClassChange) {
    const oldClassId = Math.floor(change.previous / 100);
    const newClassId = change.toClass;
    const oldClass = this.classList.find((x) => x.classid === oldClassId);
    const newClass = this.classList.find((x) => x.classid === newClassId);
    console.log(oldClass, newClass, oldClass && newClass);
    if (oldClass && newClass) {
      const old = oldClass.getUser(change._id);
      console.log(old, "old 114514", change._id, oldClassId, newClassId);
      if (old) {
        oldClass.removeUser(change._id);
        newClass.appendUser(old);
        console.log(
          "Student",
          change._id,
          "exchanged from",
          oldClassId,
          "to",
          newClassId,
          "with new code",
          this.getUserCode(change._id, newClassId)
        );
      }
    }
  }
  public getClassStudentList(year: number, classid: number) {
    const cls = this.classList.find((x) => x.classid === year * 100 + classid);
    return cls?.studentList;
  }
}
