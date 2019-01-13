import Login from '../views/login/Login.vue'
import NotFound from '../views/404.vue'
import Home from '../views/Home.vue'
import HomeNoLogin from '../views/HomeNoLogin'
import allFile from '../views/file/allFile.vue'
import Document from '../views/file/document.vue'
import Music from '../views/file/music.vue'
import Video from '../views/file/video.vue'
import Pic from '../views/file/pic.vue'
import Album from '../views/pic/pic.vue'
import Statistical from '../views/charts/statistical.vue'
import UserInfo from '../views/user/userInfo'
import MyMessage from '../views/user/myMessage'
import ShareList from '../views/share/shareList'
import RecycleList from '../views/recycle/recycleList'
import Vue from 'vue'
import Router from 'vue-router'
import { getToken } from '../common/auth'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import store from '../store'
import { GetInfo } from '../api/user'

let routes = [
  {
    path: '/user/:info',
    component: Login,
    name: '',
    hidden: true
  },
  {
    path: '/404',
    component: NotFound,
    name: '',
    hidden: true
  },
  {
    path: '/home/verify',
    component: HomeNoLogin,
    name: '',
    hidden: true
  },
  {
    path: '/',
    component: Home,
    name: '文件列表',
    iconCls: 'fa fa-file', // 图标样式class
    children: [
      { path: '/allFile', component: allFile, name: '所有文件' },
      { path: '/document', component: Document, name: '文档' },
      { path: '/video', component: Video, name: '视频' },
      { path: '/music', component: Music, name: '音乐' },
      { path: '/pic', component: Pic, name: '图片' }
    ]
  },
  {
    path: '/',
    component: Home,
    name: '回收站',
    iconCls: 'fa fa-trash-o',
    leaf: true,
    children: [
      { path: '/recycleList', component: RecycleList, name: '回收站' }
    ]
  },
  {
    path: '/',
    component: Home,
    name: '分享列表',
    iconCls: 'fa fa-share-alt',
    leaf: true,
    children: [
      { path: '/shareList', component: ShareList, name: '分享列表' }
    ]
  },
  {
    path: '/',
    component: Home,
    name: '相册',
    iconCls: 'fa fa-picture-o',
    leaf: true,
    children: [
      { path: '/album', component: Album, name: '相册' }
    ]
  },
  {
    path: '/',
    component: Home,
    name: '统计',
    iconCls: 'fa fa-bar-chart',
    leaf: true,
    children: [
      { path: '/statistical', component: Statistical, name: '统计' }
    ]
  },
  {
    path: '/',
    component: Home,
    name: '个人信息',
    iconCls: 'fa fa-user',
    leaf: true,
    children: [
      { path: '/userInfo', component: UserInfo, name: '个人信息' }
    ]
  },
  {
    path: '/',
    component: Home,
    name: '我的消息',
    iconCls: 'fa fa-comments',
    leaf: true,
    children: [
      { path: '/myMessage', component: MyMessage, name: '我的消息' }
    ]
  },
  {
    path: '*',
    hidden: true,
    redirect: { path: '/404' }
  }
];

Vue.use(Router)

const router = new Router({
  routes
});

const whiteList = ['/user/login', '/user/register', '/home/verify'] // 不重定向白名单

router.beforeEach((to, from, next) => {
  NProgress.start();
  const token = getToken()
  if (token) {
    if (to.path === '/user/login' || to.path === '/') {
      next({ path: '/allFile' })
    } else {
      const user = store.getters.getUser
      if (user) {
        next()
      } else {
        GetInfo().then(res => {
          store.commit('storeUser', res.data)
          next()
        }).catch(res => {
          store.commit('delUser')
          next({ path: '/user/login' })
        })
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next({ path: '/user/login' })
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})

export default router
