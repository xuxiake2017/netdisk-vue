<template>
  <div>
    <div v-if="imgList.length === 0">
      <el-alert title="您的相册空空如也，赶快上传点东西吧" :closable="false"></el-alert>
    </div>
    <div v-infinite-scroll="loadMore" infinite-scroll-disabled="busy" infinite-scroll-distance="10" class="img-list" :style="{height: computeHeight + 'px'}">
      <div v-for="(item, index) in imgList" :key="index">
      <el-alert
        :title="item.dayTime"
        :type="alertTypes[index % alertTypes.length]"
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
import $ from 'jquery'

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
      busy: false,
      alertTypes: [
        'success',
        'info',
        'warning',
        'error'
      ]
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
        } else {
          this.busy = false
        }
        let list = []
        res.data.list.forEach((item, index) => {
          let o1 = {}
          for (let key in item) {
            o1['dayTime'] = util.formatDate.format(new Date(parseInt(key)), 'yyyy年MM月dd日')
            let imgList = []
            item[key].forEach((e) => {
              let o2 = {}
              if (e.mediaCachePath) {
                o2['src'] = `${res.data.nginxServer}/${e.filePath}`
                o2['msrc'] = e.mediaCachePath
              } else {
                o2['src'] = require('../../assets/file_ico/not_found.png')
                o2['msrc'] = require('../../assets/file_ico/not_found.png')
              }
              o2['alt'] = e.fileRealName
              o2['title'] = e.fileRealName
              if (e.imgWidth && e.imgHeight) {
                o2['w'] = e.imgWidth
                o2['h'] = e.imgHeight
              } else {
                o2['w'] = 1200
                o2['h'] = 900
              }
              imgList.push(o2)
            })
            o1['imgList'] = imgList
          }
          list.push(o1)
        })
        this.imgList = [ ...this.imgList, ...list ]
      }).catch((res) => {
        console.log('获取图片列表失败')
      })
    },
    loadMore () {
      this.busy = true
      window.setTimeout(() => {
        this.getImgList()
        this.pagination.pageNum++
      }, 1000)
    }
  },
  mounted () {
    // this.getImgList()
  },
  computed: {
    computeHeight () {
      return $(document).height() - 80
    }
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
<style scoped>
  .img-list {
    width: 100%;
    overflow-y: auto;
  }
  /*滚动条整体样式*/
  /*高宽分别对应横竖滚动条的尺寸*/
  .img-list::-webkit-scrollbar {
    width: 10px;
    height: 1px;
  }
  /*滚动条里面小方块*/
  .img-list::-webkit-scrollbar-thumb {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
    background: #535353;
  }
  /*滚动条里面轨道*/
  .img-list::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
    border-radius: 10px;
    background: #EDEDED;
  }
</style>
