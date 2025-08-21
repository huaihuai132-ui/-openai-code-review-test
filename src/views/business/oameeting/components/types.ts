// 会议表单相关类型定义

import { OaMeetingAttendeeVO } from '@/api/business/oameetingattendee'
import { OaMeetingIssueVO } from '@/api/business/oameetingissue'

export interface MeetingFormData {
  id?: number
  userId?: number
  meetName?: string
  meetType?: string
  meetDate?: number
  startTime?: number
  endTime?: number
  meetRoomId?: number
  reason?: string
  description?: string
  status?: number
  fileList: string[]
  sequenceCode?: string
  attendeeList: AttendeeWithUserInfo[]
  issueList: OaMeetingIssueVO[]
}

export interface AttendeeWithUserInfo extends OaMeetingAttendeeVO {
  userName: string
  userDepartmentId: number
  userDepartmentName: string
}

export interface Attachment {
  id: number
  name: string
  url: string
}

export interface MeetingRoom {
  id: number
  roomName: string
  location: string
  [key: string]: any
}
