// kb -> KB MB ……

let size = 154412

function formate (kb) {
    let units = ['KB', 'MB', 'GB', 'TB', 'PB']
    let unitsIndex = 0

    while (kb >= 1024 && unitsIndex < units.length - 1) {
        kb /= 1024
        unitsIndex ++
    }

    return `${kb.toFixed(2)} ${units[unitsIndex]}`
}

console.log(formate(size));