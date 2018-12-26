import axios from 'axios'
import ElementUI from 'element-ui'
import Vue from 'vue'
import qs from 'qs'

let axiosIns = axios.create({
  withCredentials: true,
  baseURL: process.env.BASE_API // api 的 base_url
});

axiosIns.interceptors.response.use(function (response) {
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
  // config: {stringify: true} 需要序列化data 默认
  // config: {stringify: false} 以json格式传输参数
  api[method] = function (url, data, config = {stringify: true}) {
    return new Promise(function (resolve, reject) {
      if (method === 'post') {
        axiosIns.request({
          url: url,
          method: 'post',
          data: config.stringify && data ? qs.stringify(data) : data
        }).then((response) => {
          resolve(response);
        }).catch((response) => {
          reject(response)
          ElementUI.Notification.error({
            title: 'error',
            message: response.status === 200 ? response.data.msg : `网络错误`,
            duration: 2000
          })
          // 如果从后台传来的code未41000（未授权、未登录）sessionStorage移除user对象，页面刷新
          if (response.data.code && response.data.code === 41000) {
            window.setTimeout(() => {
              sessionStorage.removeItem('user');
              location.reload();
            }, 2000);
          }
        })
      } else if (method === 'get') {
        axiosIns.request({
          url: url,
          method: 'get',
          params: {
            ...data
          }
        }).then((response) => {
          resolve(response);
        }).catch((response) => {
          reject(response)
          ElementUI.Notification.error({
            title: 'error',
            message: response.status === 200 ? response.data.msg : `网络错误`,
            duration: 2000
          })
          // 如果从后台传来的code未41000（未授权、未登录）sessionStorage移除user对象，页面刷新
          if (response.data.code && response.data.code === 41000) {
            window.setTimeout(() => {
              sessionStorage.removeItem('user');
              location.reload();
            }, 2000);
          }
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
