import {
  trackPageDisappear,
  trackPageAppear
} from '@src/components/CommonTracker'
import { TTKeys } from '../../constants/TTKeys'

export function ttTrackPageAppear(pageKey: string, cid: string, val: any) {
  trackPageAppear(pageKey, cid, TTKeys.Product, val)
}

export function ttTrackPageDisappear(pageKey: string, cid: string, val: any) {
  trackPageDisappear(pageKey, cid, TTKeys.Product, val)
}
