import Login from '../views/Login.vue'
import NotFound from '../views/404.vue'
import Home from '../views/Home.vue'
// import Main from '../views/Main.vue'
import fileList from '../views/nav1/fileList.vue'
import Document from '../views/nav1/document.vue'
import Music from '../views/nav1/music.vue'
import Video from '../views/nav1/video.vue'
import Pic from '../views/nav2/pic.vue'
import Statistical from '../views/charts/statistical.vue'
import Vue from 'vue'
import Router from 'vue-router'

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
    iconCls: 'el-icon-document', // 图标样式class
    children: [
      { path: '/fileList', component: fileList, name: '所有文件' },
      { path: '/document', component: Document, name: '文档' },
      { path: '/video', component: Video, name: '视频' },
      { path: '/music', component: Music, name: '音乐' }
    ]
  },
  {
    path: '/',
    component: Home,
    name: '相册',
    iconCls: 'fa fa-picture-o',
    children: [
      { path: '/pic', component: Pic, name: '相册' }
    ]
  },
  {
    path: '/',
    component: Home,
    name: '统计',
    iconCls: 'fa fa-bar-chart',
    children: [
      { path: '/statistical', component: Statistical, name: '统计' }
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
  // NProgress.start();
  if (to.path === '/login') {
    sessionStorage.removeItem('user');
  }
  let user = JSON.parse(sessionStorage.getItem('user'));
  if (!user && to.path !== '/login') {
    next({ path: '/login' })
  } else {
    next()
  }
})

export default router
