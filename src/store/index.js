import Vue from 'vue';
import Vuex from 'vuex';
import FileList from './modules/fileList'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    FileList
  }
})
