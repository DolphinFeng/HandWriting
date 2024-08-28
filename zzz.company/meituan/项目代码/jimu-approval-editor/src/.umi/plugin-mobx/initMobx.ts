// @ts-nocheck
 import approval  from '/Users/dolphin/Desktop/Codespace/jimu-approval-editor/src/store/approval.js'
import approvalTripartite  from '/Users/dolphin/Desktop/Codespace/jimu-approval-editor/src/store/approvalTripartite.ts'
import common  from '/Users/dolphin/Desktop/Codespace/jimu-approval-editor/src/store/common.js'
import global  from '/Users/dolphin/Desktop/Codespace/jimu-approval-editor/src/store/global.js'

class RootStore {
 approval = new approval(this)
approvalTripartite = new approvalTripartite(this)
common = new common(this)
global = new global(this)
}

const mobx_stores = new RootStore();
window.mobx_app = {
  mobx_stores,
}
