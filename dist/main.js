'use strict';

var sqlite3 = require('sqlite3');
var path = require('path');
var fs = require('fs');
var mongodb = require('mongodb');
var promises = require('fs/promises');
var bcrypt = require('bcrypt');

function connectToSqlite() {
  const pth = path.resolve('database', 'zvms.db');
  return new sqlite3.Database(pth)
}

const tables = [
  'volunteer',
  'user',
  'class',
  'class_vol',
  'user_vol',
  'picture',
  'issue',
  'notice',
  'user_notice',
  'class_notice'
];

function exportTables(db) {
  const promises = tables.map((table) => {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM ${table}`, (err, rows) => {
        if (err) {
          reject(err);
        }
        resolve({
          key: table,
          value: rows
        } );
      });
    })
  }); 
  return Promise.all(promises)
}

async function exportToJSON() {
  const db = connectToSqlite();
  const folder = path.resolve('data', 'export');
  const tables = await exportTables(db);
  tables.forEach((table) => {
    console.log('Exporting table', table.key);
    fs.writeFileSync(path.resolve(folder, table.key + '.json'), JSON.stringify(table.value, null, 2));
  });
}

function _optionalChain$2(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }













class Class {
   __init() {this.studentList = [];}
   __init2() {this.codeStart = 0;}
   __init3() {this.classid = 0;}
  constructor(cid) {Class.prototype.__init.call(this);Class.prototype.__init2.call(this);Class.prototype.__init3.call(this);
    const year = Math.floor(cid / 100);
    const classid = cid % 100;
    const yearInCode = year % 100;
    this.classid = cid;
    const specialCodeMap = {
      9: {
        schoolId: 39,
        classId: 1
      },
      10: {
        schoolId: 39,
        classId: 2
      },
      11: {
        schoolId: 9,
        classId: 9
      },
      12: {
        schoolId: 9,
        classId: 10
      }
    }; 
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
   appendUser(user) {
    this.studentList.push(user);
    console.log('Stored user with id', user.id, 'in _id', user._id, 'into class', this.classid);
  }
   removeUser(_id) {
    this.studentList = this.studentList.filter((x) => x._id !== _id);
  }
   getUserCode(_id) {
    const idx = this.studentList.findIndex((x) => x._id === _id);
    return this.codeStart * 100 + idx + 1
  }
   getUser(_id) {
    return this.studentList.find((x) => x._id === _id)
  }
}

class ZhenhaiHighSchool {
   __init4() {this.classList = [];}
  constructor() {ZhenhaiHighSchool.prototype.__init4.call(this);
    for (let y = 2022; y <= 2023; y++) {
      for (let i = 1; i <= 17; i++) {
        this.classList.push(new Class(y * 100 + i));
      }
    }
  }
   appendUser(user) {
    console.log('Append user', user.id, 'into class', Math.floor(user.id / 100));
    const idx = this.classList.findIndex((x) => x.classid === Math.floor(user.id / 100));
    if (idx !== -1) this.classList[idx].appendUser(user);
  }
   removeUser(_id, classid) {
    const cls = this.classList.find((x) => x.classid === classid);
    _optionalChain$2([cls, 'optionalAccess', _ => _.removeUser, 'call', _2 => _2(_id)]);
  }
   getUserCode(_id, classid) {
    const idx = this.classList.findIndex((x) => x.classid === classid);
    if (idx !== -1) return this.classList[idx].getUserCode(_id)
  }
   studentExchange(change) {
    const oldClassId = Math.floor(change.previous / 100);
    const newClassId = change.toClass;
    const oldClass = this.classList.find((x) => x.classid === oldClassId);
    const newClass = this.classList.find((x) => x.classid === newClassId);
    if (oldClass && newClass) {
      const old = oldClass.getUser(change._id);
      if (old) {
        oldClass.removeUser(change._id);
        newClass.appendUser(old);
        console.log(
          'Student',
          change._id,
          'exchanged from',
          oldClassId,
          'to',
          newClassId,
          'with new code',
          this.getUserCode(change._id, newClassId)
        );
      }
    }
  }
   getClassStudentList(year, classid) {
    const cls = this.classList.find((x) => x.classid === year * 100 + classid);
    return _optionalChain$2([cls, 'optionalAccess', _3 => _3.studentList])
  }
   getClassWithCode(code) {
    const cls = this.classList.find((x) => x.codeStart === Math.floor(code / 100));
    return _optionalChain$2([cls, 'optionalAccess', _4 => _4.classid])
  }
}

const groups = []; 

function v3NameToV4Name(name) {
  if (name.length !== 4) {
    return name
  }
  const prefix = name.slice(0, 2);
  const suffix = name.slice(3);
  const dgst = name.slice(2, 3); 
  const digestMap = {
    一: '1',
    二: '2',
    三: '3',
    四: '4',
    五: '5',
    六: '6',
    七: '7',
    八: '8',
    九: '9',
    十: '10'
  };
  const result = `${prefix} ${digestMap[dgst]} ${suffix}`;
  return result
}

function exportClassToGroup() {
  const classes = fs.readFileSync(path.resolve('data', 'export', 'class.json'), 'utf-8');
  const parsed = JSON.parse(classes); 
  const existsed = [
    {
      _id: new mongodb.ObjectId().toString(),
      name: '团支书',
      description:
        '团支书是班级的团支部书记, 有权管理班级的义工, 审核班内学生创建的义工, 填报以班级为单位在校内进行的义工等.',
      permissions: ['secretary'],
      type: 'permission'
    },
    {
      _id: new mongodb.ObjectId().toString(),
      name: '实践部',
      description:
        '实践部是学校学生会的部门之一, 负责管理学生的社会实践活动, 可以创建除数据库操作有关的义工, 审核团支书创建的义工, 并且发布获奖填报和社会实践等.',
      permissions: ['department'],
      type: 'permission'
    },
    {
      _id: new mongodb.ObjectId().toString(),
      name: '审计部',
      description:
        '审计部是义管会 (目前隶属于实践部) 的部门之一, 负责审核学生义工的感想, 统计纸质义工时长, 发放义工时间.',
      permissions: ['auditor'],
      type: 'permission'
    },
    {
      _id: new mongodb.ObjectId().toString(),
      name: '监督员',
      description: '监督员为使用平台的管理教师, 负责查看义工平台的相关活动, 有权查看各项数据.',
      permissions: ['inspector'],
      type: 'permission'
    },
    {
      _id: new mongodb.ObjectId().toString(),
      name: '管理员',
      description:
        '管理员是平台的管理者, 有权查看平台的所有数据, 并且有权对平台进行设置. 该权限必须为开发组成员才能使用.',
      permissions: ['admin'],
      type: 'permission'
    },
    {
      _id: new mongodb.ObjectId().toString(),
      name: '系统管理员',
      description:
        '系统管理员是平台的最高管理者, 有权查看平台的所有数据, 并且有权对平台进行设置. 该权限必须为开发组成员才能使用.',
      permissions: ['system'],
      type: 'permission'
    }
  ]; 
  const mapped = parsed.filter(x => x.id.toString() !== '0').map((x) => {
    return {
      _id: new mongodb.ObjectId().toString(),
      name: v3NameToV4Name(x.name),
      description: x.id.toString(),
      permissions: ['student'],
      type: 'class'
    }
  }); 
  while (groups.length) {
    groups.pop();
  }
  groups.push(...existsed);
  groups.push(...mapped);
  fs.writeFileSync(
    path.resolve('data', 'handler', 'group-transformed.json'),
    JSON.stringify(groups, null, 2),
    'utf-8'
  );
}

function getUserGroups(user) {
  const perm = getUserPosition(user.permission);
  const result = perm
    .map((x) => {
      return groups.find((y) => y.type !== 'class' && y.permissions.includes(x))
    })
    .filter((x) => x !== undefined); 
  const userGroup = groups.find((x) => x.description === user.classid.toString());
  if (userGroup) {
    result.push(userGroup);
  }
  const ids = new Set(result.map((x) => x._id));
  return Array.from(ids)
}

function findClassId(id) {
  const result = groups.filter((x) => id.includes(x._id));
  if (result) {
    return result[0].description
  }
  return undefined
}

function _nullishCoalesce$2(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain$1(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
const userDataTable = JSON.parse(
  fs.readFileSync(
    path.resolve('database', 'user_id.json'),
  ).toString()
) ;

const zhzx = new ZhenhaiHighSchool();

function getUserPosition(permission) {
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
    ] 
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

function UserTransform(user) {
  const result = {
    _id: new mongodb.ObjectId().toString(),
    id: user.userid,
    name: user.username,
    sex: "unknown" ,
    group: getUserGroups(user)
  } ;
  console.log("Transformed user", user.userid, "with id", result._id);
  return result;
}
function transformUser(users) {
  return users
    .map((user) => {
      return UserTransform(user);
    })
}

function transformUserToJSON() {
  const users = fs.readFileSync(path.resolve("data", "export", "user.json"), "utf-8");
  const parsed = JSON.parse(users);
  const transformed = transformUser(parsed);
  fs.writeFileSync(
    path.resolve("data", "handler", "user-transformed.json"),
    JSON.stringify(transformed, null, 2)
  );
  const interclassMap = getUserWhoseNumberIsNotStartsWithClassId(parsed);
  const class2Grade2023 = resortNumberListInClass2Grade2023();
  const maps = [interclassMap, class2Grade2023].flat(1);
  fs.writeFileSync(
    path.resolve("data", "handler", "mappings.json"),
    JSON.stringify(
      maps.filter((x) => _optionalChain$1([x, 'optionalAccess', _2 => _2.code]) && x),
      null,
      2
    )
  );
  fs.writeFileSync(
    path.resolve("data", "handler", "classid-changed.json"),
    JSON.stringify(getUserWhoseNumberIsNotStartsWithClassId(parsed), null, 2)
  );
  fs.writeFileSync(
    path.resolve("data", "handler", "class2-2023.json"),
    JSON.stringify(resortNumberListInClass2Grade2023(), null, 2)
  );
}

const userMap = [];

function findUser(user) {
  if (userMap.length === 0) {
    const list = fs.readFileSync(
      path.resolve("data", "handler", "user-transformed.json"),
      "utf-8"
    );
    userMap.push(...(JSON.parse(list) ));
  }
  const result = _optionalChain$1([userMap, 'access', _3 => _3.find, 'call', _4 => _4((u) => u.id === user), 'optionalAccess', _5 => _5._id]) 

;
  if (result) {
    console.log("Found user", user, "with id", result);
    return new mongodb.ObjectId(result);
  } else {
    throw new Error("User not found");
  }
}

function getUserWhoseNumberIsNotStartsWithClassId(users) {
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

function resortNumberListInClass2Grade2023() {
  const studentList = _optionalChain$1([zhzx
, 'access', _6 => _6.getClassStudentList, 'call', _7 => _7(2023, 2)
, 'optionalAccess', _8 => _8.map, 'call', _9 => _9((x) => {
      const code = _nullishCoalesce$2(zhzx.getUserCode(x._id, 202302), () => ( 0));
      return {
        _id: x._id,
        id: 20230200 + (code % 100),
        name: x.name,
        code,
      };
    })
, 'access', _10 => _10.sort, 'call', _11 => _11((a, b) => a.code - b.code)]);
  return studentList;
}








function mappingUser(users, mappings) {
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
  }) 
}

function transformUserToJSONWithMapping() {
  const users = fs.readFileSync(
    path.resolve("data", "handler", "user-transformed.json"),
    "utf-8"
  );
  const maps = fs.readFileSync(
    path.resolve("data", "handler", "mappings.json"),
    "utf-8"
  );
  const parsed = JSON.parse(users);
  const mapsParsed = JSON.parse(maps);
  const mapped = mappingUser(
    parsed ,
    mapsParsed 
  ).map((x) => {
    const userData = userDataTable.find(user => user.name === x.name);
    if (userData) {
      x.id = userData.id;
    }
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
  fs.writeFileSync(
    path.resolve("data", "handler", "user-transformed-mapped.json"),
    JSON.stringify(mapped, null, 2)
  );
}

var V3VolunteerStatus; (function (V3VolunteerStatus) {
  const UNAUDITED = 1; V3VolunteerStatus[V3VolunteerStatus["UNAUDITED"] = UNAUDITED] = "UNAUDITED";
  const ACCEPTED = 2; V3VolunteerStatus[V3VolunteerStatus["ACCEPTED"] = ACCEPTED] = "ACCEPTED";
  const REJECTED = 3; V3VolunteerStatus[V3VolunteerStatus["REJECTED"] = REJECTED] = "REJECTED";
  const SPECIAL = 4; V3VolunteerStatus[V3VolunteerStatus["SPECIAL"] = SPECIAL] = "SPECIAL";
})(V3VolunteerStatus || (V3VolunteerStatus = {}));

var V3UserVolunteerStatus; (function (V3UserVolunteerStatus) {
  const WAITING_FOR_SIGNUP_AUDIT = 1; V3UserVolunteerStatus[V3UserVolunteerStatus["WAITING_FOR_SIGNUP_AUDIT"] = WAITING_FOR_SIGNUP_AUDIT] = "WAITING_FOR_SIGNUP_AUDIT";
  const DRAFT = 2; V3UserVolunteerStatus[V3UserVolunteerStatus["DRAFT"] = DRAFT] = "DRAFT";
  const WAITING_FOR_FIRST_AUDIT = 3; V3UserVolunteerStatus[V3UserVolunteerStatus["WAITING_FOR_FIRST_AUDIT"] = WAITING_FOR_FIRST_AUDIT] = "WAITING_FOR_FIRST_AUDIT";
  const WAITING_FOR_FINAL_AUDIT = 4; V3UserVolunteerStatus[V3UserVolunteerStatus["WAITING_FOR_FINAL_AUDIT"] = WAITING_FOR_FINAL_AUDIT] = "WAITING_FOR_FINAL_AUDIT";
  const ACCEPTED = 5; V3UserVolunteerStatus[V3UserVolunteerStatus["ACCEPTED"] = ACCEPTED] = "ACCEPTED";
  const REJECTED = 6; V3UserVolunteerStatus[V3UserVolunteerStatus["REJECTED"] = REJECTED] = "REJECTED";
  const SPIKE = 7; V3UserVolunteerStatus[V3UserVolunteerStatus["SPIKE"] = SPIKE] = "SPIKE";
})(V3UserVolunteerStatus || (V3UserVolunteerStatus = {}));

var V3VolunteerMode; (function (V3VolunteerMode) {
  const INSIDE = 1; V3VolunteerMode[V3VolunteerMode["INSIDE"] = INSIDE] = "INSIDE";
  const OUTSIDE = 2; V3VolunteerMode[V3VolunteerMode["OUTSIDE"] = OUTSIDE] = "OUTSIDE";
  const LARGE = 3; V3VolunteerMode[V3VolunteerMode["LARGE"] = LARGE] = "LARGE";
})(V3VolunteerMode || (V3VolunteerMode = {}));

var V3VolunteerType; (function (V3VolunteerType) {
  const INSIDE = 1; V3VolunteerType[V3VolunteerType["INSIDE"] = INSIDE] = "INSIDE";
  const APPOINTED = 2; V3VolunteerType[V3VolunteerType["APPOINTED"] = APPOINTED] = "APPOINTED";
  const SPECIAL = 3; V3VolunteerType[V3VolunteerType["SPECIAL"] = SPECIAL] = "SPECIAL";
})(V3VolunteerType || (V3VolunteerType = {}));

const v4ActivityStatus = ['', 'pending', 'effective', 'refused', 'effective'];

const v4ActivityType = ['', 'specified', 'social', 'scale', 'special'];

const v4ActivityClassify = ['', 'on-campus', 'off-campus', 'social-practice'];

const v4ActivityMemberStatus = [
  '',
  'draft',
  'draft',
  'pending',
  'pending',
  'effective',
  'refused',
  'rejected'
];

function getStatus(status) {
  return v4ActivityStatus[status] 
}

function getType(
  type,
  status,
  isCreatedBySystem = false
) {
  if (status === V3VolunteerStatus.SPECIAL || isCreatedBySystem) {
    return 'special'
  }
  return v4ActivityType[type] 
}

function getMode(mode) {
  return v4ActivityClassify[mode] 
}

function getUserStatus(status) {
  return v4ActivityMemberStatus[status] 
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var dayjs_min = {exports: {}};

(function (module, exports) {
  !function (t, e) {
    module.exports = e() ;
  }(commonjsGlobal, function () {

    var t = 1e3,
      e = 6e4,
      n = 36e5,
      r = "millisecond",
      i = "second",
      s = "minute",
      u = "hour",
      a = "day",
      o = "week",
      c = "month",
      f = "quarter",
      h = "year",
      d = "date",
      l = "Invalid Date",
      $ = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,
      y = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,
      M = {
        name: "en",
        weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
        months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
        ordinal: function (t) {
          var e = ["th", "st", "nd", "rd"],
            n = t % 100;
          return "[" + t + (e[(n - 20) % 10] || e[n] || e[0]) + "]";
        }
      },
      m = function (t, e, n) {
        var r = String(t);
        return !r || r.length >= e ? t : "" + Array(e + 1 - r.length).join(n) + t;
      },
      v = {
        s: m,
        z: function (t) {
          var e = -t.utcOffset(),
            n = Math.abs(e),
            r = Math.floor(n / 60),
            i = n % 60;
          return (e <= 0 ? "+" : "-") + m(r, 2, "0") + ":" + m(i, 2, "0");
        },
        m: function t(e, n) {
          if (e.date() < n.date()) return -t(n, e);
          var r = 12 * (n.year() - e.year()) + (n.month() - e.month()),
            i = e.clone().add(r, c),
            s = n - i < 0,
            u = e.clone().add(r + (s ? -1 : 1), c);
          return +(-(r + (n - i) / (s ? i - u : u - i)) || 0);
        },
        a: function (t) {
          return t < 0 ? Math.ceil(t) || 0 : Math.floor(t);
        },
        p: function (t) {
          return {
            M: c,
            y: h,
            w: o,
            d: a,
            D: d,
            h: u,
            m: s,
            s: i,
            ms: r,
            Q: f
          }[t] || String(t || "").toLowerCase().replace(/s$/, "");
        },
        u: function (t) {
          return void 0 === t;
        }
      },
      g = "en",
      D = {};
    D[g] = M;
    var p = "$isDayjsObject",
      S = function (t) {
        return t instanceof _ || !(!t || !t[p]);
      },
      w = function t(e, n, r) {
        var i;
        if (!e) return g;
        if ("string" == typeof e) {
          var s = e.toLowerCase();
          D[s] && (i = s), n && (D[s] = n, i = s);
          var u = e.split("-");
          if (!i && u.length > 1) return t(u[0]);
        } else {
          var a = e.name;
          D[a] = e, i = a;
        }
        return !r && i && (g = i), i || !r && g;
      },
      O = function (t, e) {
        if (S(t)) return t.clone();
        var n = "object" == typeof e ? e : {};
        return n.date = t, n.args = arguments, new _(n);
      },
      b = v;
    b.l = w, b.i = S, b.w = function (t, e) {
      return O(t, {
        locale: e.$L,
        utc: e.$u,
        x: e.$x,
        $offset: e.$offset
      });
    };
    var _ = function () {
        function M(t) {
          this.$L = w(t.locale, null, !0), this.parse(t), this.$x = this.$x || t.x || {}, this[p] = !0;
        }
        var m = M.prototype;
        return m.parse = function (t) {
          this.$d = function (t) {
            var e = t.date,
              n = t.utc;
            if (null === e) return new Date(NaN);
            if (b.u(e)) return new Date();
            if (e instanceof Date) return new Date(e);
            if ("string" == typeof e && !/Z$/i.test(e)) {
              var r = e.match($);
              if (r) {
                var i = r[2] - 1 || 0,
                  s = (r[7] || "0").substring(0, 3);
                return n ? new Date(Date.UTC(r[1], i, r[3] || 1, r[4] || 0, r[5] || 0, r[6] || 0, s)) : new Date(r[1], i, r[3] || 1, r[4] || 0, r[5] || 0, r[6] || 0, s);
              }
            }
            return new Date(e);
          }(t), this.init();
        }, m.init = function () {
          var t = this.$d;
          this.$y = t.getFullYear(), this.$M = t.getMonth(), this.$D = t.getDate(), this.$W = t.getDay(), this.$H = t.getHours(), this.$m = t.getMinutes(), this.$s = t.getSeconds(), this.$ms = t.getMilliseconds();
        }, m.$utils = function () {
          return b;
        }, m.isValid = function () {
          return !(this.$d.toString() === l);
        }, m.isSame = function (t, e) {
          var n = O(t);
          return this.startOf(e) <= n && n <= this.endOf(e);
        }, m.isAfter = function (t, e) {
          return O(t) < this.startOf(e);
        }, m.isBefore = function (t, e) {
          return this.endOf(e) < O(t);
        }, m.$g = function (t, e, n) {
          return b.u(t) ? this[e] : this.set(n, t);
        }, m.unix = function () {
          return Math.floor(this.valueOf() / 1e3);
        }, m.valueOf = function () {
          return this.$d.getTime();
        }, m.startOf = function (t, e) {
          var n = this,
            r = !!b.u(e) || e,
            f = b.p(t),
            l = function (t, e) {
              var i = b.w(n.$u ? Date.UTC(n.$y, e, t) : new Date(n.$y, e, t), n);
              return r ? i : i.endOf(a);
            },
            $ = function (t, e) {
              return b.w(n.toDate()[t].apply(n.toDate("s"), (r ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(e)), n);
            },
            y = this.$W,
            M = this.$M,
            m = this.$D,
            v = "set" + (this.$u ? "UTC" : "");
          switch (f) {
            case h:
              return r ? l(1, 0) : l(31, 11);
            case c:
              return r ? l(1, M) : l(0, M + 1);
            case o:
              var g = this.$locale().weekStart || 0,
                D = (y < g ? y + 7 : y) - g;
              return l(r ? m - D : m + (6 - D), M);
            case a:
            case d:
              return $(v + "Hours", 0);
            case u:
              return $(v + "Minutes", 1);
            case s:
              return $(v + "Seconds", 2);
            case i:
              return $(v + "Milliseconds", 3);
            default:
              return this.clone();
          }
        }, m.endOf = function (t) {
          return this.startOf(t, !1);
        }, m.$set = function (t, e) {
          var n,
            o = b.p(t),
            f = "set" + (this.$u ? "UTC" : ""),
            l = (n = {}, n[a] = f + "Date", n[d] = f + "Date", n[c] = f + "Month", n[h] = f + "FullYear", n[u] = f + "Hours", n[s] = f + "Minutes", n[i] = f + "Seconds", n[r] = f + "Milliseconds", n)[o],
            $ = o === a ? this.$D + (e - this.$W) : e;
          if (o === c || o === h) {
            var y = this.clone().set(d, 1);
            y.$d[l]($), y.init(), this.$d = y.set(d, Math.min(this.$D, y.daysInMonth())).$d;
          } else l && this.$d[l]($);
          return this.init(), this;
        }, m.set = function (t, e) {
          return this.clone().$set(t, e);
        }, m.get = function (t) {
          return this[b.p(t)]();
        }, m.add = function (r, f) {
          var d,
            l = this;
          r = Number(r);
          var $ = b.p(f),
            y = function (t) {
              var e = O(l);
              return b.w(e.date(e.date() + Math.round(t * r)), l);
            };
          if ($ === c) return this.set(c, this.$M + r);
          if ($ === h) return this.set(h, this.$y + r);
          if ($ === a) return y(1);
          if ($ === o) return y(7);
          var M = (d = {}, d[s] = e, d[u] = n, d[i] = t, d)[$] || 1,
            m = this.$d.getTime() + r * M;
          return b.w(m, this);
        }, m.subtract = function (t, e) {
          return this.add(-1 * t, e);
        }, m.format = function (t) {
          var e = this,
            n = this.$locale();
          if (!this.isValid()) return n.invalidDate || l;
          var r = t || "YYYY-MM-DDTHH:mm:ssZ",
            i = b.z(this),
            s = this.$H,
            u = this.$m,
            a = this.$M,
            o = n.weekdays,
            c = n.months,
            f = n.meridiem,
            h = function (t, n, i, s) {
              return t && (t[n] || t(e, r)) || i[n].slice(0, s);
            },
            d = function (t) {
              return b.s(s % 12 || 12, t, "0");
            },
            $ = f || function (t, e, n) {
              var r = t < 12 ? "AM" : "PM";
              return n ? r.toLowerCase() : r;
            };
          return r.replace(y, function (t, r) {
            return r || function (t) {
              switch (t) {
                case "YY":
                  return String(e.$y).slice(-2);
                case "YYYY":
                  return b.s(e.$y, 4, "0");
                case "M":
                  return a + 1;
                case "MM":
                  return b.s(a + 1, 2, "0");
                case "MMM":
                  return h(n.monthsShort, a, c, 3);
                case "MMMM":
                  return h(c, a);
                case "D":
                  return e.$D;
                case "DD":
                  return b.s(e.$D, 2, "0");
                case "d":
                  return String(e.$W);
                case "dd":
                  return h(n.weekdaysMin, e.$W, o, 2);
                case "ddd":
                  return h(n.weekdaysShort, e.$W, o, 3);
                case "dddd":
                  return o[e.$W];
                case "H":
                  return String(s);
                case "HH":
                  return b.s(s, 2, "0");
                case "h":
                  return d(1);
                case "hh":
                  return d(2);
                case "a":
                  return $(s, u, !0);
                case "A":
                  return $(s, u, !1);
                case "m":
                  return String(u);
                case "mm":
                  return b.s(u, 2, "0");
                case "s":
                  return String(e.$s);
                case "ss":
                  return b.s(e.$s, 2, "0");
                case "SSS":
                  return b.s(e.$ms, 3, "0");
                case "Z":
                  return i;
              }
              return null;
            }(t) || i.replace(":", "");
          });
        }, m.utcOffset = function () {
          return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
        }, m.diff = function (r, d, l) {
          var $,
            y = this,
            M = b.p(d),
            m = O(r),
            v = (m.utcOffset() - this.utcOffset()) * e,
            g = this - m,
            D = function () {
              return b.m(y, m);
            };
          switch (M) {
            case h:
              $ = D() / 12;
              break;
            case c:
              $ = D();
              break;
            case f:
              $ = D() / 3;
              break;
            case o:
              $ = (g - v) / 6048e5;
              break;
            case a:
              $ = (g - v) / 864e5;
              break;
            case u:
              $ = g / n;
              break;
            case s:
              $ = g / e;
              break;
            case i:
              $ = g / t;
              break;
            default:
              $ = g;
          }
          return l ? $ : b.a($);
        }, m.daysInMonth = function () {
          return this.endOf(c).$D;
        }, m.$locale = function () {
          return D[this.$L];
        }, m.locale = function (t, e) {
          if (!t) return this.$L;
          var n = this.clone(),
            r = w(t, e, !0);
          return r && (n.$L = r), n;
        }, m.clone = function () {
          return b.w(this.$d, this);
        }, m.toDate = function () {
          return new Date(this.valueOf());
        }, m.toJSON = function () {
          return this.isValid() ? this.toISOString() : null;
        }, m.toISOString = function () {
          return this.$d.toISOString();
        }, m.toString = function () {
          return this.$d.toUTCString();
        }, M;
      }(),
      k = _.prototype;
    return O.prototype = k, [["$ms", r], ["$s", i], ["$m", s], ["$H", u], ["$W", a], ["$M", c], ["$y", h], ["$D", d]].forEach(function (t) {
      k[t[1]] = function (e) {
        return this.$g(e, t[0], t[1]);
      };
    }), O.extend = function (t, e) {
      return t.$i || (t(e, _, O), t.$i = !0), O;
    }, O.locale = w, O.isDayjs = S, O.unix = function (t) {
      return O(1e3 * t);
    }, O.en = D[g], O.Ls = D, O.p = {}, O;
  });
})(dayjs_min);
var dayjs_minExports = dayjs_min.exports;
var dayjs = /*@__PURE__*/getDefaultExportFromCjs(dayjs_minExports);

function _nullishCoalesce$1(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }
const activityOidMap = new Map();
const activityList = [];

function init() {
  if (activityList.length === 0) {
    const activities = fs.readFileSync(path.resolve('data', 'export', 'volunteer.json'), 'utf-8');
    const parsed = JSON.parse(activities); 
    activityList.push(...parsed);
  }
}

function getActivityOid(activity) {
  if (activity.description.startsWith('append to #')) {
    const lines = activity.description
      .replaceAll('\\n', '\n')
      .split('\n')
      .map((x) => x.trim());
    const oid = parseInt(lines[0].split('#')[1]);
    if (isNaN(oid)) return activity.id
    function isInActivityList(oid) {
      return activityList.findIndex((x) => x.id === oid) !== -1
    }
    if (!isInActivityList(oid)) return activity.id
    if (activityOidMap.has(oid)) return activityOidMap.get(oid)
    activityOidMap.set(activity.id, oid);
    return oid
  } else return activity.id
}

function checkActivityOid(oid) {
  console.log('Checking activity oid', oid);
  if (activityOidMap.has(oid)) return activityOidMap.get(oid)
  else return oid
}

function transformLinearStructure(activities) {
  return activities.map((activity) => {
    console.log('Transforming activity', activity.id, 'with status', activity.status);
    const status = getStatus(activity.status); 
    const type =
      activity.holder === 0 ? 'special' : getType(activity.type, activity.status);
    const result = {
      _id: new mongodb.ObjectId().toString(),
      type,
      name: activity.name
        .replaceAll('（其他）', '')
        .replaceAll('（社团）', '')
        .replaceAll('（获奖）', '')
        .trim(),
      description: activity.description.replaceAll('自提交义工：', '').trim(),
      members: [],
      duration: activity.reward / 60,
      date: dayjs(activity.time).toISOString(),
      createdAt: dayjs().toISOString(),
      updatedAt: dayjs().toISOString(),
      creator: findUser(activity.holder).toString(),
      status,
      oid: getActivityOid(activity),
      special:
        type === 'special'
          ? {
              classify:
                activity.holder === 0
                  ? 'import'
                  : activity.name.endsWith('（其他）')
                  ? 'other'
                  : activity.name.endsWith('（社团）')
                  ? 'club'
                  : 'other'
            }
          : undefined,
      registration:
        type === 'specified'
          ? {
              place: '可莉不知道哦',
              deadline: dayjs(activity.time).toISOString(),
              classes: []
            }
          : undefined
    }; 


    const special = {
      classify:
        activity.holder === 0
          ? 'import'
          : activity.name.endsWith('（其他）')
          ? 'other'
          : activity.name.endsWith('（社团）')
          ? 'club'
          : 'other',
    }; 
    const registration = {
      place: '可莉不知道哦',
      deadline: dayjs(activity.time).toISOString(),
      duration: activity.reward / 60,
      classes: []
    }; 
    if (result.type === 'specified') {
      console.log('It is a specified activity.');
      return {
        ...result,
        registration: registration
      } 


    }
    if (result.type === 'special') {
      console.log('It is a special activity.');
      return {
        ...result,
        special
      } 


    }
    return result
  })
}

function transformActivityMember(
  member,
  mode,
  duration,
  images = []
) {
  const status = getUserStatus(member.status);
  console.log('Transforming member', member.userid, 'with status', status);
  return {
    _id: findUser(member.userid).toString(),
    status,
    mode,
    impression: member.thought,
    duration: _nullishCoalesce$1(member.reward / 60, () => ( duration)),
    history: [],
    images
  } 
}

function getActivityMode(oid) {
  const idx = activityList.findIndex((x) => x.id === oid);
  if (idx === -1) return 'on-campus'
  else return getMode(activityList[idx].type )
}

function appendMemberIntoActivity(
  activities,
  members,
  images = [],
  classes = []
) {
  members.map((member) => {
    const volid = checkActivityOid(member.volid);
    const idx = activities.findIndex((x) => x.oid === volid);
    if (idx) {
      console.log('Appending member', member.userid, 'into activity', idx);
      const activity = activities[idx]; 
      const image = images
        .filter((x) => x.volid === member.volid && x.userid === member.userid)
        .map((x) => x.filename);
      const mode = getActivityMode(member.volid);
      console.log('Appending member', member.userid, 'with mode', mode);
      if (activity.type === 'special')
        activity.members.push(
          transformActivityMember(member, mode, member.reward / 60, image) 
        );
      else if (
        activity.members.findIndex((x) => x._id === findUser(member.userid).toString()) === -1
      )
        activity.members.push(
          transformActivityMember(member, mode, member.reward / 60, image) 
        );
      else {
        console.log('Member', member.userid, 'already exists in activity', idx);
        const record = activity.members.find((x) => x._id === findUser(member.userid).toString());
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
          if (record.status === 'effective') {
            record.impression += '\n' + member.thought;
          } else if (record.status === 'refused' || record.status === 'rejected') {
            record.impression = member.thought;
            record.status =
              getUserStatus(member.status) === 'effective' ? 'effective' : record.status;
          }
        }
      }
    }
  });
  return activities
    .map((activity) => {
      const cls = classes.filter((x) => x.volid === activity.oid);
      if (cls.length === 0) console.log('No classes found for activity', activity.oid);
      else
        console.log(
          'Appending classes',
          cls.map((x) => x.classid).join(', '),
          'into activity',
          activity.oid
        );
      if (cls.length !== 0 && activity.type === 'specified') {
        return {
          ...activity,
          registration: {
            ...activity.registration,
            classes: cls.map((x) => ({
              class: x.classid,
              min: 0,
              max: x.max
            }))
          }
        }
      } else return activity
    })
    .filter(
      (x) =>
        x.members.length !== 0 &&
        !x.description.includes('.ignore') &&
        !x.description.includes('测试') &&
        !x.name.includes('测试')
    )
    .map((x) => {
      // @ts-ignore
      delete x.oid;
      return x
    })
}

function transformActivityToJSON() {
  init();
  const activities = fs.readFileSync(path.resolve('data', 'export', 'volunteer.json'), 'utf-8');
  const parsed = JSON.parse(activities);
  const members = fs.readFileSync(path.resolve('data', 'export', 'user_vol.json'), 'utf-8');
  const user_parsed = JSON.parse(members); 
  const images = fs.readFileSync(path.resolve('data', 'export', 'picture.json'), 'utf-8');
  const image_parsed = JSON.parse(images); 
  const classes = fs.readFileSync(path.resolve('data', 'export', 'class_vol.json'), 'utf-8');
  const class_parsed = JSON.parse(classes); 
  const transformed = transformLinearStructure(parsed);
  const appended = appendMemberIntoActivity(transformed, user_parsed, image_parsed, class_parsed);
  fs.writeFileSync(
    path.resolve('data', 'handler', 'activity-transformed.json'),
    JSON.stringify(appended, null, 2)
  );
}

function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
async function groupTransformToImportableData() {
  const file = await promises.readFile(path.resolve('data', 'handler', 'group-transformed.json'), 'utf-8');
  const parsed = JSON.parse(file);
  const mapped = parsed.map((x) => {
    return {
      ...x,
      _id: {
        $oid: x._id
      }
    }
  });
  await promises.writeFile(path.resolve('data', 'import', 'groups.json'), JSON.stringify(mapped, null, '\t'));
  console.log('Exported the groups in', path.resolve('data', 'import', 'groups.json'));
}

async function userTransformToImportableData() {
  const file = await promises.readFile(path.resolve('data', 'handler', 'user-transformed-mapped.json'), 'utf-8');
  const parsed = JSON.parse(file);
const existedList = JSON.parse(fs.readFileSync(
  path.resolve("database", 'user_id.json')
).toString()); 




  const mapped = parsed.map(async (x) => {
    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash(x.id.toString(), salt);
    const classid = findClassId(x.group);
    return {
      ...x,
      password,
      _id: {
        $oid: x._id
      },
      id: _nullishCoalesce(_optionalChain([existedList, 'access', _ => _.find, 'call', _2 => _2(l => x.id === l.id && l.classid === classid), 'optionalAccess', _3 => _3.id]), () => ( x.id)),
    }
  });
  const promised = await Promise.all(mapped);
  await promises.writeFile(path.resolve('data', 'import', 'users.json'), JSON.stringify(promised, null, '\t'));
  console.log('Exported the users in', path.resolve('data', 'import', 'users.json'));
}

async function activityTransformToImportableData() {
  const file = await promises.readFile(path.resolve('data', 'handler', 'activity-transformed.json'), 'utf-8');
  const parsed = JSON.parse(file);
  const mapped = parsed.map((x) => {
    return {
      ...x,
      _id: {
        $oid: x._id
      }
    }
  });
  await promises.writeFile(path.resolve('data', 'import', 'activities.json'), JSON.stringify(mapped, null, '\t'));
  console.log('Exported the activities in', path.resolve('data', 'import', 'activities.json'));
  console.log(
    'Now you can import the data into MongoDB using `mongoimport` with the following command:'
  );
  console.log('mongoimport --db <database> --collection <collection> --file <file> --jsonArray');
  console.log('Example:');
  console.log('mongoimport --db test --collection users --file users.json --jsonArray');
}

async function main() {
  console.time('export');
  // await copyZVMSSqliteDatabase();
  await exportToJSON();
  exportClassToGroup();
  transformUserToJSON();
  transformActivityToJSON();
  transformUserToJSONWithMapping();
  await groupTransformToImportableData();
  await userTransformToImportableData();
  await activityTransformToImportableData();
  console.timeEnd('export');
}

main();
