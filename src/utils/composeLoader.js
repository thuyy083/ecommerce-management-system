// utils/composeLoaders.js
export const composeLoaders = (...middlewares) => {
  return async (args) => {
    let data = {}
    for (const mw of middlewares) {
      const result = await mw({ ...args, ...data })
      if (result) {
        data = { ...data, ...result } // Gộp kết quả các middleware
      }
    }
    return data
  }
}