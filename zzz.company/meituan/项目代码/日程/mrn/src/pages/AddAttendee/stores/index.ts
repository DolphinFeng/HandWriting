import { action, autorun, computed, observable } from 'mobx'
import KNB from '@mrn/mrn-knb'
import { warn } from '@onejs/mrn-utils'
import { IAttendee } from '@src/common/interfaces'
import { CommonApi, EditApi } from '@src/apis'

export interface IAddAttendeeStore {
  selectPersons: IAttendee[]
  selectPersonsEmpids: string[]
  selectedAttendees: IAttendee[]
  selectedAttendeeEmpids: string[]
  groupMembers: IAttendee[]
  allChecked: boolean
  onlyGroupMember: boolean
  organizer: IAttendee
  canSelect: boolean
  init: (
    attendees: IAttendee[],
    onlyGroupMember: boolean,
    organizer: IAttendee,
    chatId: string
  ) => void
  getAllGroupMembers: () => Promise<void>
  setAllChecked: (allChecked: boolean) => void
  setSelectPersons: (attendee: IAttendee[]) => void
  setGourpMembers: (members: IAttendee[]) => void
  handlePressAvatar: (empId: string) => void
  selectAttendees: () => Promise<void>
  deleteSelectPerson: (index: number) => void
  addSelectPerson: (attendee: IAttendee) => void
}

export class AddAttendeeStore implements IAddAttendeeStore {
  @observable public selectPersons: IAttendee[] = [] // 自己选中的用户

  @observable public groupMembers: IAttendee[] = [] // 所有群成员

  @observable public allChecked: boolean // 是否全选

  @observable public selectedAttendees: IAttendee[] = [] // 已选中的群成员

  @observable public onlyGroupMember: boolean = false // 是否只能选群成员

  @observable public organizer: IAttendee // 日程创建者

  @observable public chatId: string

  @computed public get canSelect(): boolean {
    return this.selectPersons.length + this.selectedAttendeeEmpids.length <= 500
  }

  @computed public get selectPersonsEmpids() {
    return this.selectPersons.map(i => i.empId)
  }

  @computed public get selectedAttendeeEmpids() {
    return this.selectedAttendees.map(i => i.empId)
  }

  @computed public get groupMembersEmpids() {
    return this.groupMembers.map(i => i.empId)
  }

  constructor() {
    autorun(() => {
      this.setAllChecked(
        this.groupMembersEmpids.every(
          i => this.selectPersonsEmpids.includes(i) || this.selectedAttendeeEmpids.includes(i)
        )
      )
    })
  }

  @action public init = (
    attendees: IAttendee[],
    onlyGroupMember: boolean,
    organizer: IAttendee,
    chatId: string
  ): void => {
    this.onlyGroupMember = onlyGroupMember
    this.organizer = organizer
    this.chatId = chatId
    if (onlyGroupMember) {
      this.selectedAttendees = [organizer]
      this.selectPersons = attendees.slice().filter((i: IAttendee) => i.empId !== organizer.empId)
    } else {
      this.selectedAttendees = attendees
    }
  }

  @action public deleteSelectPerson = (index: number) => {
    this.selectPersons.splice(index, 1)
  }

  @action public addSelectPerson = (attendee: IAttendee) => {
    this.selectPersons.push(attendee)
  }

  @action public setAllChecked = (allChecked: boolean) => {
    this.allChecked = allChecked
  }

  @action public setSelectPersons = (attendee: IAttendee[]) => {
    this.selectPersons = attendee
  }

  @action public setGourpMembers = (members: IAttendee[]) => {
    this.groupMembers = members
  }

  @action public handlePressAvatar = (empId: string) => {
    const index = this.selectPersons.findIndex(i => i.empId === empId)
    this.selectPersons.splice(index, 1)
  }

  public getAllGroupMembers = async () => {
    const res = await CommonApi.groupMember(this.chatId)
    this.setGourpMembers(res.memberList)
    this.setAllChecked(
      this.selectPersons.length + this.selectedAttendeeEmpids.length === res.memberList.length
    )
  }

  public selectAttendees = async (): Promise<void> => {
    const selectedPersons = await this.selectPersonsHandler()
    if (selectedPersons) {
      const selectedPersonsOrgInfo = await EditApi.transferAccount(
        selectedPersons.map(i => i.dxUserId.toString())
      )

      this.setSelectPersons(selectedPersonsOrgInfo)
    }
  }

  private selectPersonsHandler = async (): Promise<IAttendee[]> =>
    new Promise((resolve: (Persons: []) => void): void => {
      KNB.use('dxmp.selectPersons', {
        title: '添加参与人',
        limit: 500,
        limitTip: '参与人不可超过500人',
        selectedUidArr: this.selectPersons.map((i: IAttendee) => i.dxUserId || i.xmUid),
        exceptUidArr: this.selectedAttendees.map((i: IAttendee) => i.dxUserId || i.xmUid),
        success: ({ ret }) => {
          resolve(
            ret.map(i => ({
              name: i.name,
              dxUserId: i.uid,
              avatar: i.avatar
            }))
          )
        },
        fail: (err: Error) => {
          warn('[selectPersonsHandler] fail', err)
        }
      })
    })
}
