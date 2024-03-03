import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { ObjectId } from 'mongodb'
import type { V3Class, V3User } from './v3'
import type { Group } from '@zvms/zvms4-types'
import { getUserPosition } from './user'

export const groups = [] as Group[]

export function v3NameToV4Name(name: string) {
  if (name.length !== 4) {
    return name
  }
  const prefix = name.slice(0, 2)
  const suffix = name.slice(3)
  const dgst = name.slice(2, 3) as keyof typeof digestMap
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
  }
  const result = `${prefix} ${digestMap[dgst]} ${suffix}`
  return result
}

export function exportClassToGroup() {
  const classes = readFileSync(resolve('data', 'export', 'class.json'), 'utf-8')
  const parsed = JSON.parse(classes) as V3Class[]
  const existsed = [
    {
      _id: new ObjectId().toString(),
      name: '团支书',
      description:
        '团支书是班级的团支部书记, 有权管理班级的义工, 审核班内学生创建的义工, 填报以班级为单位在校内进行的义工等.',
      permissions: ['secretary'],
      type: 'permission'
    },
    {
      _id: new ObjectId().toString(),
      name: '实践部',
      description:
        '实践部是学校学生会的部门之一, 负责管理学生的社会实践活动, 可以创建除数据库操作有关的义工, 审核团支书创建的义工, 并且发布获奖填报和社会实践等.',
      permissions: ['department'],
      type: 'permission'
    },
    {
      _id: new ObjectId().toString(),
      name: '审计部',
      description:
        '审计部是义管会 (目前隶属于实践部) 的部门之一, 负责审核学生义工的感想, 统计纸质义工时长, 发放义工时间.',
      permissions: ['auditor'],
      type: 'permission'
    },
    {
      _id: new ObjectId().toString(),
      name: '监督员',
      description: '监督员为使用平台的管理教师, 负责查看义工平台的相关活动, 有权查看各项数据.',
      permissions: ['inspector'],
      type: 'permission'
    },
    {
      _id: new ObjectId().toString(),
      name: '管理员',
      description:
        '管理员是平台的管理者, 有权查看平台的所有数据, 并且有权对平台进行设置. 该权限必须为开发组成员才能使用.',
      permissions: ['admin'],
      type: 'permission'
    },
    {
      _id: new ObjectId().toString(),
      name: '系统管理员',
      description:
        '系统管理员是平台的最高管理者, 有权查看平台的所有数据, 并且有权对平台进行设置. 该权限必须为开发组成员才能使用.',
      permissions: ['system'],
      type: 'permission'
    }
  ] as Group[]
  const mapped = parsed.filter(x => x.id.toString() !== '0').map((x) => {
    return {
      _id: new ObjectId().toString(),
      name: v3NameToV4Name(x.name),
      description: x.id.toString(),
      permissions: ['student'],
      type: 'class'
    }
  }) as Group[]
  while (groups.length) {
    groups.pop()
  }
  groups.push(...existsed)
  groups.push(...mapped)
  writeFileSync(
    resolve('data', 'handler', 'group-transformed.json'),
    JSON.stringify(groups, null, 2),
    'utf-8'
  )
}

export function getUserGroups(user: V3User) {
  const perm = getUserPosition(user.permission)
  const result: Group[] = perm
    .map((x) => {
      return groups.find((y) => y.type !== 'class' && y.permissions.includes(x))
    })
    .filter((x) => x !== undefined) as Group[]
  const userGroup = groups.find((x) => x.description === user.classid.toString())
  if (userGroup) {
    result.push(userGroup)
  }
  const ids = new Set(result.map((x) => x._id))
  return Array.from(ids)
}

export function findClassId(id: string[]) {
  const result = groups.filter((x) => id.includes(x._id))
  if (result) {
    return result[0].description
  }
  return undefined
}
