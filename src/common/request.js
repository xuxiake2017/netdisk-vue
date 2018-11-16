import axios from 'axios'
import ElementUI from 'element-ui'
import Vue from 'vue'

let axiosIns = axios.create({});

axiosIns.defaults.baseURL = process.env.BASE_API;
axiosIns.interceptors.response.use(function (response) {
  // let data = response.data;
  let status = response.status;
  if (status === 200) {
    if (response.data.code !== 20000) {
      return Promise.reject(response)
    }
    return Promise.resolve(response);
  } else {
    return Promise.reject(response);
  }
});

let ajaxMethod = ['get', 'post'];
let api = {};
ajaxMethod.forEach((method) => {
  // 数组取值的两种方式
  api[method] = function (uri, data, config) {
    return new Promise(function (resolve, reject) {
      if (method === 'post') {
        axiosIns.request({
          url: uri,
          method: 'post',
          data: {
            ...data
          }
        }).then((response) => {
          resolve(response);
        }).catch((response) => {
          console.log('error' + response.data.msg)
          ElementUI.Notification.error({
            title: 'error',
            message: response.data.msg,
            duration: 2000
          });
        })
      } else {
        axiosIns.request({
          url: uri,
          method: 'get',
          params: {
            ...data
          }
        }).then((response) => {
          resolve(response);
        }).catch((response) => {
          console.log('error' + response.data.msg)
          ElementUI.Notification.error({
            title: 'error',
            message: response.data.msg,
            duration: 2000
          });
        })
      }
    })
  }
});

Vue.prototype.$axios = api;

const post = api['post']
const get = api['get']
export {
  post,
  get
}
