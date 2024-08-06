// 定义一个文件大小（以KB为单位）
let size = 154412

/**
 * 将文件大小从KB转换为更合适的单位（如MB、GB等）
 * @param {number} kb - 文件大小，以KB为单位
 * @returns {string} - 转换后的文件大小，带有合适的单位
 */
function formate (kb) {
    // 定义单位数组，从KB到PB
    let units = ['KB', 'MB', 'GB', 'TB', 'PB']
    // 初始化单位索引
    let unitsIndex = 0

    // 当文件大小大于等于1024且单位索引未超出范围时，继续转换
    while (kb >= 1024 && unitsIndex < units.length - 1) {
        // 文件大小除以1024，转换为更大的单位
        kb /= 1024
        // 单位索引加1，指向下一个单位
        unitsIndex ++
    }

    // 返回转换后的文件大小，并保留两位小数
    return `${kb.toFixed(2)} ${units[unitsIndex]}`
}

// 输出转换后的文件大小
console.log(formate(size));
