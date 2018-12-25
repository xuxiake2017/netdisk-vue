<template>
  <div>
    <div class="infiniteScroll"
         style="height: 1400px;background-color: #ccc;width: 400px;margin: 0 auto;"
         v-infinite-scroll="loadMore"
         infinite-scroll-disabled="busy"
         infinite-scroll-distance="10">
    </div>
    <!--<div v-for="(item, index) in imgList" :key="index">
      <el-alert
        :title="item.dayTime"
        type="info"
        :closable="false">
      </el-alert>
      <vue-preview :slides="item.imgList" @close="handleClose"></vue-preview>
    </div>-->
  </div>
</template>

<script>
import VuePreview from 'vue-preview'
import Vue from 'vue'
import ToImgList from '@/api/img'
import util from '../../common/util'
import Waterfall from 'vue-waterfall/lib/waterfall'
import WaterfallSlot from 'vue-waterfall/lib/waterfall-slot'
import infiniteScroll from 'vue-infinite-scroll'

// defalut install
Vue.use(VuePreview)
Vue.use(infiniteScroll)
export default {
  name: 'pic',
  components: {
    Waterfall,
    WaterfallSlot
  },
  data () {
    return {
      imgList: [],
      pagination: {
        pageNum: 1,
        pageSize: 10
      },
      busy: false,
      data: [],
      count: 0
    }
  },
  methods: {
    handleClose () {
      console.log('close event')
    },
    getImgList () {
      ToImgList().then(res => {
        console.log(res.data)
      }).catch((res) => {
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
          this.imgList = list
        })
        console.log(list)
      })
    },
    loadMore: function () {
      this.busy = true;
      console.log('loading... ' + new Date());
      setTimeout(function () {
        this.count++
        let app = document.querySelector('.infiniteScroll')
        let height = app.clientHeight;
        app.style.height = height + 300 + 'px';
        console.log('end... ' + new Date());
        this.busy = false
      }, 1000)
    }
  },
  mounted () {
    this.getImgList()
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
