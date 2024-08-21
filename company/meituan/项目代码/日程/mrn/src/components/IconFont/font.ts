import iconInfo from '@src/common/assets/icons/dxcalendar-schedule-mrn.json'

export interface IGlyph {
  'glyph-name': string // 图标名称
  unicode: string
}

export interface IIcon {
  font: string // name
  glyphs: IGlyph[]
}

const { font, glyphs } = iconInfo

export const iconFont = {
  font,
  glyphs, // 字体
  font_family: 'dxcalendar-schedule-mrn'
}
