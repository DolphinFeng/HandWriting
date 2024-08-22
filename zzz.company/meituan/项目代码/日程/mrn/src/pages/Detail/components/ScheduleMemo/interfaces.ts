export interface ISchema {
  type: ESchemaType
  content: string
  link?: string
}

export enum ESchemaType {
  Text = 'text',
  Link = 'link'
}

export enum ETextHandlerType {
  SpecialLink = 'special', // [demo|link...]
  Link = 'link' // link
}

export interface IUrlInfo {
  link: string
  start: number
  end: number
}
