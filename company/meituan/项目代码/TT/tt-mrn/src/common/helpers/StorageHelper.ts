import KNB from '@mrn/mrn-knb'

// e.g. result = {"status":"success","value":"[{\"avatar\":\"https://msstest-img.sankuai.com/v1/mss_37ed3a16b0594c9fb747ff29d3d087e8/profile13/45bb1447-85dd-478d-9c04-5def29ced234\",\"displayName\":\"李昱瑶\",\"jobStatus\":15,\"username\":\"liyuyao\"}]","result":"next","errorCode":"0"}
/**
 * 从storage 获取数据，需要 JSON.parse 解析 value
 */
export const getFromStorage = (key: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    KNB.getStorage({
      key: key, // 数据键，String类型
      success: function (result) {
        resolve(result)
      }, // 优先使用内存数据，如果没有对应数据，返回 null
      fail: function (error) {
        reject(error)
      }
    })
  })
}

/** 存储到 storage, 对象需要用 json.stringify 转成 string */
export const saveToStorage = (
  key: string,
  value: string,
  level?: 0 | 1
): Promise<any> => {
  return new Promise((resolve, reject) => {
    KNB.setStorage({
      key: key, // 数据键，String类型
      value: value, // 数据值，String类型
      level: level ?? 1, // 存储级别，Interger类型，0 - 内存【默认】，1 - 设备，2 - 云端【11.7 暂缓】
      success: function (result) {
        resolve(result)
      },
      fail: function (error) {
        reject(error)
      }
    })
  })
}

export const clearStorage = (key: string) => {
  KNB.clearStorage({
    key: key
  })
}

// TODO: KNB 自带 promise, 后续调研是否直接用
// KNB.getPromiseInstance().getStorage()

// export const getFromStorage = (key) => {
//   // KNB.getPromiseInstance().getStorage()
//   KNB.getStorage({
//     key: key, // 数据键，String类型
//     success: function(result) {
//       console.log('result', result);

//     }, // 优先使用内存数据，如果没有对应数据，返回 null
//     fail: function(error){
//       alert(JSON.stringify(error))
//     }
//   })
// }

// export const saveToStorage = (key: string, value: string, level?: 0|1) => {
//   KNB.setStorage({
//     key: key, // 数据键，String类型
//     value: value, // 数据值，String类型
//     level: level ?? 1, // 存储级别，Interger类型，0 - 内存【默认】，1 - 设备，2 - 云端【11.7 暂缓】
//     success: function(result) {
//       alert(JSON.stringify(result))
//     },
//     fail: function(error) {
//       alert(JSON.stringify(error))
//     }
//   })
// }

export function formatFileSize(fileSize: number) {
  if (!fileSize) {
    return '0'
  }
  if (fileSize < 1024) {
    return fileSize + 'B'
  } else if (fileSize < 1024 * 1024) {
    let temp = fileSize / 1024
    return temp.toFixed(1) + 'KB'
  } else if (fileSize < 1024 * 1024 * 1024) {
    var temp = fileSize / (1024 * 1024)
    return temp.toFixed(1) + 'MB'
  } else {
    var temp = fileSize / (1024 * 1024 * 1024)
    return temp.toFixed(1) + 'GB'
  }
}

export function getFileSuffix(fileName) {
  if (!fileName) {
    return ''
  }
  let startIndex = fileName.lastIndexOf('.')
  if (startIndex !== -1) {
    return fileName.substring(startIndex + 1, fileName.length).toLowerCase()
  } else {
    return ''
  }
}
