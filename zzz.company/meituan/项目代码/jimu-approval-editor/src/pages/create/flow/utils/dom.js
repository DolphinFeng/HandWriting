export function isDomParent(obj, parent) {
  while (
    obj !== undefined &&
    obj != null &&
    obj.tagName.toUpperCase() !== 'BODY'
  ) {
    if (obj === parent) {
      return true;
    }
    obj = obj.parentNode;
  }
  return false;
}
