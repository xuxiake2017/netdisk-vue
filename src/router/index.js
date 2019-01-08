import Login from '../views/Login.vue'
import NotFound from '../views/404.vue'
import Home from '../views/Home.vue'
import allFile from '../views/file/allFile.vue'
import Document from '../views/file/document.vue'
import Music from '../views/file/music.vue'
import Video from '../views/file/video.vue'
import Pic from '../views/file/pic.vue'
import Album from '../views/pic/pic.vue'
import Statistical from '../views/charts/statistical.vue'
import UserInfo from '../views/user/userInfo'
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
    path: '/login',
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
  // { path: '/main', component: Main },
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
    name: '我的信息',
    iconCls: 'fa fa-user',
    leaf: true,
    children: [
      { path: '/userInfo', component: UserInfo, name: '我的信息' }
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

router.beforeEach((to, from, next) => {
  NProgress.start();
  const token = getToken()
  if (token) {
    if (to.path === '/login') {
      next({ path: '/allFile' })
    } else {
      if (to.path === '/') {
        next({path: '/allFile'})
      }
      const user = store.getters.getUser
      if (user) {
        next()
      } else {
        GetInfo().then(res => {
          store.commit('storeUser', res.data)
          next()
        }).catch(res => {
          store.commit('delUser')
          next({ path: '/login' })
        })
      }
    }
  } else {
    if (to.path === '/login') {
      next()
    } else {
      next({ path: '/login' })
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})

export default router
