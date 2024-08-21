export function flexibleCompare(a, b) {
  if (!a && !b) {
    return 0
  }
  if (b === null) {
    return -1
  }
  if (a === null) {
    return 1
  }
  if (typeof a === 'string' || typeof b === 'string') {
    return String(a).localeCompare(String(b))
  }
  return a - b
}

export function compareByFieldSpec(obj0, obj1, fieldSpec) {
  return flexibleCompare(obj0[fieldSpec.field], obj1[fieldSpec.field]) * (fieldSpec.order || 1)
}

export function compareByFieldSpecs(obj0, obj1, fieldSpecs) {
  let i
  let cmp

  for (i = 0; i < fieldSpecs.length; i++) {
    cmp = compareByFieldSpec(obj0, obj1, fieldSpecs[i])
    if (cmp) {
      return cmp
    }
  }

  return 0
}
