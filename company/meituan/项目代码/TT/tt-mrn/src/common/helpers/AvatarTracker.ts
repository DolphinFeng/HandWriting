import { trackClick } from '@src/components/CommonTracker'

export namespace AvatarKeys {
  export const Product = 'Avatar'
  /** 页面标识 cid */
  export enum Page {
    Share = 'c_onecloud_qrvxthdn'
  }
}

/** track 分享点击 */
export function trackShareClick(bid: string) {
  trackClick(bid, AvatarKeys.Page.Share, AvatarKeys.Product, null)
}
