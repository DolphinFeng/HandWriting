import store from '@/store';
// 暂时没用
export function permissionMethod (el, operateName) {
    const permissionMap = store.getters.detailOperatePermission;
    let state = permissionMap[operateName];
    const visible = state !== 'disabled';
    const editable = state === 'editable';
    if (!visible) {
        el.parentNode.removeChild(el);
    } else if (!editable) {
        el.setAttribute('disabled');
    }
}
