export default {
  state: {
    // 储存待上传的文件
    fileList: []
  },
  mutations: {
    storeFile (state, file) {
      console.log(file)
      state.fileList.push(file)
      console.log(state.fileList)
    },
    delFile (state, uid) {
      let i = null
      state.fileList.forEach((file, index) => {
        if (uid === file.uid) {
          i = index
        }
      })
      state.fileList.splice(i, 1)
      console.log(state.fileList)
    },
    clearFile (state) {
      state.fileList.length = 0
      console.log(state.fileList)
    }
  },
  actions: {},
  getters: {
    'getFileList': state => state.fileList,
    'getFile': (state) => (uid) => {
      return state.fileList.find(file => file.uid === uid)
    }
  }
}
