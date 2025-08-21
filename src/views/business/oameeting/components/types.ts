// 会议表单相关类型定义

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
  fileList: number[]
  sequenceCode?: string
  attendeeList: Attendee[]
  issueList: Issue[]
}

export interface Attendee {
  id: number
  nickname: string
  deptName: string
  [key: string]: any
}

export interface Issue {
  id: number
  topicCode: string
  topicTitle: string
  topicType: string
  meetingType: string
  topicSummary: string
  attachments?: Attachment[]
  [key: string]: any
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
