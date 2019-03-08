<template>
<el-row class="container">
  <el-col :span="24" class="header">
    <el-col :span="10" class="logo hidden-xs-only">
      <span>{{sysName}}</span>
      <img src="../assets/logo.png"/>
    </el-col>
    <el-col v-if="$store.getters.getUser" :xs="6" :md="4" :lg="3" class="user-info">
      <el-button type="text" class="button" @click="toHome">首页</el-button>
      <img :src="this.sysUserAvatar" />
    </el-col>
    <el-col :span="2" class="tool" v-else>
      <el-button type="text" class="button" @click="toLogin">登录</el-button>
      <el-button type="text" class="button" @click="toRegister">注册</el-button>
    </el-col>
  </el-col>
  <el-col>
    <el-card v-if="shareFile.shareId" style="width: 80%">
      <div slot="header">
        <el-row>
          <el-col :span="8">
            <img :src="fileIoc" height="26" width="26" style="display:inline-block; vertical-align:middle;"/>
            <span>{{shareFile.fileRealName}}</span>
          </el-col>
          <el-col :span="5" style="position: absolute; right: 10px">
            <el-button v-if="shareFile.fileType != 0" size="small" @click="handleDownload">下载</el-button>
            <el-button type="info" size="small" @click="handleSaveToCloud(null, null)">保存到网盘</el-button>
          </el-col>
        </el-row>
        <el-row style="margin-top: 20px;">
          <el-col :span="4">
            <i class="fa fa-clock-o"></i>
            <span>{{formatTime(shareFile.shareTime)}}</span>
          </el-col>
        </el-row>
      </div>
      <div v-if="shareFile.isDir === 0 && showElCardBody">
        <el-breadcrumb separator="/" style="padding: 10px;">
          <el-breadcrumb-item v-for="(item, index) in pathStore" :key="item.parentId" @click.native="jump(item, index)" style="cursor: pointer; font-weight: bold">{{item.fileRealName}}</el-breadcrumb-item>
        </el-breadcrumb>
        <el-table :data="tableData"
                  @cell-click="getSublistClick"
                  :cell-style="showPointer"
                  highlight-current-row v-loading="listLoading">
          <el-table-column type="selection" width="55">
          </el-table-column>
          <el-table-column type="index" width="60">
          </el-table-column>
          <el-table-column width="50">
            <template slot-scope="scope">
              <img :src="fileIcoFilter(scope.row.fileType)" height="26" width="26" style="margin-top: 5px;"/>
            </template>
          </el-table-column>
          <el-table-column prop="fileRealName" label="文件名" width="220" sortable>
          </el-table-column>
          <el-table-column prop="fileSize" label="文件大小" width="100" :formatter="formatFileSize" sortable>
          </el-table-column>
          <el-table-column
            prop="uploadTime"
            label="上传时间"
            width="200"
            :formatter="formatFileTime"
            sortable>
          </el-table-column>
          <el-table-column label="操作">
            <template scope="scope">
              <el-button v-if="scope.row.fileType != 0" type="success" size="small" @click="handleDownload(scope.$index, scope.row)">下载</el-button>
              <el-button type="info" size="small" @click="handleSaveToCloud(scope.$index, scope.row)">保存到网盘</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-if="shareFile.fileType === 4 && showElCardBody">
        <video-player class="vjs-custom-skin"
                      ref="videoPlayer"
                      :options="playerOptions"
                      :playsinline="true"
                      style="width: 100%">
        </video-player>
      </div>
      <div v-if="shareFile.fileType === 3 && showElCardBody">
        <aplayer :music="musicOptions"/>
      </div>
    </el-card>
    <el-card v-if="mediaFile" style="width: 80%">
      <div slot="header">
        <el-row>
          <el-col :span="8">
            <img :src="fileIoc" height="26" width="26" style="display:inline-block; vertical-align:middle;"/>
            <span>{{mediaFile.fileRealName}}</span>
          </el-col>
        </el-row>
        <el-row style="margin-top: 20px;">
          <el-col :span="4">
            <i class="fa fa-clock-o"></i>
            <span>{{formatTime(mediaFile.uploadTime)}}</span>
          </el-col>
        </el-row>
      </div>
      <div v-if="mediaFile.fileType === $NetdiskConstant.FILE_TYPE_OF_MUSIC && showElCardBody">
        <aplayer :music="musicOptions"/>
      </div>
      <div v-if="mediaFile.fileType === $NetdiskConstant.FILE_TYPE_OF_VIDEO && showElCardBody">
        <video-player class="vjs-custom-skin"
                      ref="videoPlayer"
                      :options="playerOptions"
                      :playsinline="true"
                      style="width: 100%">
        </video-player>
      </div>
    </el-card>
    <el-card v-else>
      <div slot="header">
        <span>提示</span>
      </div>
      <div>
        {{prompt}}
      </div>
    </el-card>
  </el-col>

  <el-dialog
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :title="`'${shareFile.shareUser}'给您加密分享了文件`"
    :visible.sync="pwdDialogVisible"
    width="30%" @keyup.enter.native="verifyPwd">
    <el-input v-model="shareFile.sharePwd" placeholder="请输入提取密码"></el-input>
    <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="verifyPwd">提取文件</el-button>
      </span>
  </el-dialog>
</el-row>
</template>

<script>
import 'element-ui/lib/theme-chalk/display.css'
import { VerifyEmail } from '../api/user'
import { GetShareFile, CheckPwd, GetSubList, SaveToCloud } from '../api/share'
import { FindById } from '../api/file'
import util from '../common/util'
import Cookies from 'js-cookie'
// require styles
import 'video.js/dist/video-js.css'
import 'vue-video-player/src/custom-theme.css'
import { videoPlayer } from 'vue-video-player'
import Aplayer from 'vue-aplayer'

export default {
  components: {
    videoPlayer,
    Aplayer
  },
  data () {
    return {
      sysName: 'NETDISK-VUE',
      sysUserAvatar: '',
      sysUserName: '',
      prompt: '验证中...',
      fileIoc: null,
      shareFile: {
        fileId: 0,
        fileRealName: '',
        fileSaveName: '',
        fileSize: null,
        fileType: 0,
        isDir: 0,
        shareId: '',
        sharePwd: '',
        shareTime: null,
        shareUser: ''
      },
      pwdDialogVisible: false,
      tableData: null,
      listLoading: false,
      pathStore: [
        {parentId: null, fileRealName: '全部文件'}
      ],
      // videojs options
      playerOptions: {
        height: '360',
        autoplay: false,
        muted: true,
        language: 'en',
        playbackRates: [0.7, 1.0, 1.5, 2.0],
        sources: [{
          type: 'video/mp4',
          // mp4
          src: ''
          // webm
          // src: "https://cdn.theguardian.tv/webM/2015/07/20/150716YesMen_synd_768k_vp8.webm"
        }],
        poster: ''
      },
      musicOptions: {
        title: '',
        artist: '没有演唱者信息',
        src: '',
        pic: ''
      },
      showElCardBody: false,
      mediaFile: null
    }
  },
  methods: {
    verifyPwd () {
      if (!this.shareFile.sharePwd) {
        this.$message({
          message: '请输入提取密码再提交',
          type: 'warning'
        })
      } else {
        CheckPwd({shareId: this.shareFile.shareId, sharePwd: this.shareFile.sharePwd}).then(res => {
          this.pwdDialogVisible = false
          Cookies.set('shareId', this.shareFile.shareId)
          Cookies.set('sharePwd', this.shareFile.sharePwd)
          this.getSublist()
        })
      }
    },
    formatTime (time) {
      return util.formatDate.format(new Date(time), 'yyyy-MM-dd hh:mm:ss')
    },
    // 下载
    handleDownload (index, row) {
      if (row) {
        window.open(`${process.env.BASE_API}/share/download?shareId=${this.shareFile.shareId}&sharePwd=${this.shareFile.sharePwd}&fileId=${row.id}`, '_blank')
      } else {
        window.open(`${process.env.BASE_API}/share/download?shareId=${this.shareFile.shareId}&sharePwd=${this.shareFile.sharePwd}`, '_blank')
      }
    },
    // 保存到网盘
    handleSaveToCloud (index, row) {
      let param = {}
      if (index && row) {
        param = {shareId: this.shareFile.shareId, sharePwd: this.shareFile.sharePwd, fileId: row.id}
      } else {
        param = {shareId: this.shareFile.shareId, sharePwd: this.shareFile.sharePwd}
      }
      SaveToCloud({ ...param }).then(res => {
        this.$message({
          message: res.msg,
          type: 'success'
        })
      }).catch(res => {
        if (res.data.code === 20141) {
          window.setTimeout(() => {
            this.$router.push({ path: '/user/login' })
          }, 1000)
        }
      })
    },
    // 格式化文件大小
    formatFileSize (row, column) {
      return util.formatFileSize(row.fileSize)
    },
    // 格式化文件时间
    formatFileTime (row, column) {
      return util.formatDate.format(new Date(row.uploadTime), 'yyyy-MM-dd hh:mm:ss')
    },
    // 查询子目录
    getSublist (parentId) {
      GetSubList({shareId: this.shareFile.shareId, sharePwd: this.shareFile.sharePwd, parentId}).then(res => {
        this.tableData = res.data.files
        if (this.shareFile.fileType === this.$NetdiskConstant.FILE_TYPE_OF_VIDEO) {
          this.playerOptions.sources.push({
            type: 'video/mp4',
            src: res.data.files[0].mediaCachePath})
        } else if (this.shareFile.fileType === this.$NetdiskConstant.FILE_TYPE_OF_MUSIC) {
          this.musicOptions.title = res.data.files[0].fileRealName
          this.musicOptions.src = res.data.files[0].mediaCachePath
        }
        this.showElCardBody = true
      })
    },
    getSublistClick (row, column, cell, event) {
      if (row.fileType === this.$NetdiskConstant.FILE_TYPE_OF_DIR && column.property === 'fileRealName') {
        this.pathStore.push({parentId: row.id, fileRealName: row.fileRealName})
        this.getSublist(row.id)
      }
    },
    // 使鼠标变成手型
    showPointer ({row, column, rowIndex, columnIndex}) {
      if (row.fileType === this.$NetdiskConstant.FILE_TYPE_OF_DIR && columnIndex === 3) {
        return 'cursor: pointer'
      }
      return ''
    },
    jump (item, index) {
      if ((this.pathStore.length === 1) || (this.pathStore.length > 1 && index + 1 === this.pathStore.length)) {
        return
      }
      this.pathStore.splice(index + 1, this.pathStore.length - 1)
      this.getSublist(item.parentId)
    },
    toRegister () {
      this.$router.push({ path: '/user/register' })
    },
    toLogin () {
      this.$router.push({ path: '/user/login' })
    },
    toHome () {
      this.$router.push({ path: '/' })
    },
    setInterval () {
      let second = 5
      const id = window.setInterval(() => {
        if (second === 0) {
          window.clearInterval(id)
          this.toHome()
        }
        this.prompt = `邮件验证成功！${second}秒后跳转到首页`
        second--
      }, 1000)
    },
    verifyEmail () {
      const key = this.$route.query.key
      if (key) {
        VerifyEmail({ key }).then(res => {
          this.setInterval()
        })
      }
    },
    getShareFile () {
      GetShareFile({ shareId: this.shareFile.shareId }).then(res => {
        this.shareFile = res.data
        this.fileIoc = this.fileIcoFilter(this.shareFile.fileType)
        let shareId = Cookies.get('shareId')
        let sharePwd = Cookies.get('sharePwd')
        if (shareId === this.shareFile.shareId) {
          if (sharePwd) {
            this.shareFile.sharePwd = sharePwd
            this.getSublist()
          } else {
            this.pwdDialogVisible = true
          }
        } else {
          Cookies.remove('shareId')
          Cookies.remove('sharePwd')
          this.pwdDialogVisible = true
        }
      }).catch(res => {
        this.$router.push({ path: '/404' })
      })
    },
    fileIcoFilter (fileType) {
      switch (fileType) {
        case this.$NetdiskConstant.FILE_TYPE_OF_DIR :
          return require('@/assets/file_ico/Folder_24_e0cacad.png')
        case this.$NetdiskConstant.FILE_TYPE_OF_TXT :
          return require('@/assets/file_ico/Text_24_dd1b3d8.png')
        case this.$NetdiskConstant.FILE_TYPE_OF_WORD :
          return require('@/assets/file_ico/Word_24_1e078ab.png')
        case this.$NetdiskConstant.FILE_TYPE_OF_EXCEL :
          return require('@/assets/file_ico/Excel_24_614e53a.png')
        case this.$NetdiskConstant.FILE_TYPE_OF_POWERPOINT :
          return require('@/assets/file_ico/PPT_24_0af6886.png')
        case this.$NetdiskConstant.FILE_TYPE_OF_PDF :
          return require('@/assets/file_ico/PDF_24_5caf7bf.png')
        case this.$NetdiskConstant.FILE_TYPE_OF_PIC :
          return require('@/assets/file_ico/Picture_24_dd06d30.png')
        case this.$NetdiskConstant.FILE_TYPE_OF_MUSIC :
          return require('@/assets/file_ico/Music_24_04cf4b7.png')
        case this.$NetdiskConstant.FILE_TYPE_OF_VIDEO :
          return require('@/assets/file_ico/Video_24_499ddeb.png')
        case this.$NetdiskConstant.FILE_TYPE_OF_ZIP :
          return require('@/assets/file_ico/ZIP_24_3670294.png')
        case this.$NetdiskConstant.FILE_TYPE_OF_APK :
          return require('@/assets/file_ico/Android_24_a529a3a.png')
        case this.$NetdiskConstant.FILE_TYPE_OF_OTHER :
          return require('@/assets/file_ico/Misc_24_156416f.png')
      }
    },
    findById (id) {
      FindById({ id }).then(res => {
        this.mediaFile = res.data
        this.fileIoc = this.fileIcoFilter(this.mediaFile.fileType)
        if (this.mediaFile.fileType === this.$NetdiskConstant.FILE_TYPE_OF_VIDEO) {
          this.playerOptions.sources.push({
            type: 'video/mp4',
            src: this.mediaFile.mediaCachePath})
        } else if (this.mediaFile.fileType === this.$NetdiskConstant.FILE_TYPE_OF_MUSIC) {
          this.musicOptions.title = this.mediaFile.fileRealName
          this.musicOptions.src = this.mediaFile.mediaCachePath
        }
        this.showElCardBody = true
      })
    }
  },
  mounted () {
    const user = this.$store.getters.getUser
    if (user) {
      this.sysUserName = user.name || '';
      this.sysUserAvatar = user.avatar || '';
    }
    this.shareFile.shareId = this.$route.params.shareId
    const id = this.$route.query.id
    if (this.shareFile.shareId) {
      this.getShareFile()
    } else if (id) {
      this.findById(id)
    } else {
      this.verifyEmail()
    }
  },
  computed: {
    player () {
      return this.$refs.videoPlayer.player
    }
  }
}

</script>

<style scoped lang="scss">
@import '../styles/vars';

.container {
  position: absolute;
  top: 0px;
  bottom: 0px;
  width: 100%;
  .header {
    height: 60px;
    line-height: 60px;
    background: $color-primary;
    color:#fff;
    .logo {
      width:230px;
      height:60px;
      font-size: 22px;
      padding-left:10px;
      padding-right:10px;
      img {
        width: 40px;
        float: left;
        margin: 10px 10px 10px 0px;
        border-radius: 20px;
        box-shadow:1px 1px 5px #333333;
      }
      .txt {
        color:#fff;
      }
    }
  }
  .tool {
    float: right;
  }
  .user-info {
    float: right;
    cursor: pointer;
    color: #fff;
    img {
      width: 40px;
      height: 40px;
      border-radius: 20px;
      margin: 10px 10px 10px 10px;
      float: right;
    }
    .button {
      margin-left: 25px;
    }
  }
}
.button {
  color: white
}
.el-card {
  width: 380px;
  margin: 20px auto;
}
</style>
