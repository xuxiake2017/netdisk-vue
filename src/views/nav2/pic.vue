<template>
  <div>
    <div v-infinite-scroll="loadMore" infinite-scroll-disabled="busy" infinite-scroll-distance="10">
      <div v-for="(item, index) in imgList" :key="index">
      <el-alert
        :title="item.dayTime"
        type="info"
        :closable="false">
      </el-alert>
      <vue-preview :slides="item.imgList" @close="handleClose"></vue-preview>
    </div>
    </div>
  </div>
</template>

<script>
import VuePreview from 'vue-preview'
import Vue from 'vue'
import ToImgList from '@/api/img'
import util from '../../common/util'
import infiniteScroll from 'vue-infinite-scroll'

// defalut install
Vue.use(VuePreview)
Vue.use(infiniteScroll)

export default {
  name: 'pic',
  data () {
    return {
      imgList: [],
      pagination: {
        pageNum: 1,
        pageSize: 20
      },
      busy: false
    }
  },
  methods: {
    handleClose () {
      console.log('close event')
    },
    getImgList () {
      ToImgList({ ...this.pagination }).then(res => {
        // 数据全部加载完成
        if (res.data.pageInfo.list.length < this.pagination.pageSize) {
          this.busy = true
        }
        console.log(res.data)
        let list = []
        res.data.list.forEach((item, index) => {
          let o1 = {}
          for (let key in item) {
            o1['dayTime'] = util.formatDate.format(new Date(parseInt(key)), 'yyyy年MM月dd日')
            let imgList = []
            item[key].forEach((e) => {
              let o2 = {}
              if (e.mediaCachePath) {
                o2['src'] = e.mediaCachePath
                o2['msrc'] = e.mediaCachePath
              } else {
                o2['src'] = require('../../assets/file_ico/not_found.png')
                o2['msrc'] = require('../../assets/file_ico/not_found.png')
              }
              o2['alt'] = e.fileRealName
              o2['title'] = e.fileRealName
              o2['w'] = 1200
              o2['h'] = 900
              imgList.push(o2)
            })
            o1['imgList'] = imgList
          }
          list.push(o1)
          this.imgList = [ ...this.imgList, ...list ]
        })
        console.log(list)
      }).catch((res) => {
        console.log('获取图片列表失败')
      })
    },
    loadMore () {
      this.busy = true
      window.setTimeout(() => {
        this.getImgList()
        this.pagination.pageNum++
        this.busy = false
      }, 1000)
    }
  },
  mounted () {
    // this.getImgList()
  }
}
</script>

<style>
  .my-gallery img {
    height: 200px;
  }
  .my-gallery figure {
    display: inline-block;
    margin: 10px;
  }
</style>
