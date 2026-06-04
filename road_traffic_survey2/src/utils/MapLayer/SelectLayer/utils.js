export const SELECT_STATE_KEY = {
  NOT_STARTED: 0, // 未开始框选
  CAN_START: 1, // 可以开始框选
  IN_PROGREES: 2, // 进行中的
  ENDED: 3, // 框选结束
}

export const SELECT_EVENT = {
  STATE_CHANGE: 'handle:statechange', // 状态改变事件
}

export async function isDoubleClick(key, timeout = 200, callback = () => {}) {
  const map = window.isDoubleClickMap || (window.isDoubleClickMap = new Map())
  if (map.has(key)) {
    const t = map.get(key)
    clearTimeout(t)
    map.delete(key)
    callback(true)
  } else {
    const t = setTimeout(() => {
      map.delete(key)
      callback(false)
    }, timeout)
    map.set(key, t)
  }
}
