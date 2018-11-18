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
    }
  },
  actions: {},
  getters: {
    'getFileList': state => state.fileList
  }
}
