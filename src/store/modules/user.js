import { removeToken } from '../../common/auth'
export default {
  state: {
    // 登录的用户信息
    user: null
  },
  mutations: {
    storeUser (state, user) {
      state.user = user
    },
    delUser (state) {
      state.user = null
      removeToken()
    },
    clearMessages (state) {
      state.user.messages = []
    }
  },
  actions: {},
  getters: {
    getUser (state) {
      return state.user
    }
  }
}
