<template>
<el-row class="container">
  <el-col :span="24" class="header">
    <el-col :span="10" class="logo hidden-xs-only">
      <span>{{sysName}}</span>
      <img src="../assets/logo.png"/>
    </el-col>
    <el-col v-if="$store.getters.getUser" :span="2" class="user-info">
      <el-button type="text" class="button" @click="toHome">首页</el-button>
      <img :src="this.sysUserAvatar" class="hidden-md-and-down" />
    </el-col>
    <el-col :span="2" class="tool" v-else>
      <el-button type="text" class="button" @click="toLogin">登录</el-button>
      <el-button type="text" class="button" @click="toRegister">注册</el-button>
    </el-col>
  </el-col>
  <el-col>
    <el-card v-if="shareId" style="width: 80%">
      <div slot="header">
        <img :src="shareFileIoc" height="26" width="26" style="margin-top: 5px; display:inline-block; vertical-align:middle;"/>
        <span style="display:inline-block; vertical-align:middle;">{{shareFile.rows[0].fileRealName}}</span>
      </div>
      <div>
        <file-list
          :table-data="shareFile"
        ></file-list>
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
</el-row>
</template>

<script>
import 'element-ui/lib/theme-chalk/display.css'
import { VerifyEmail } from '../api/user'
import { GetShareFile } from '../api/share'
import FileList from '@/components/fileList'

export default {
  components: {FileList},
  data () {
    return {
      sysName: 'NETDISK-VUE',
      sysUserAvatar: '',
      sysUserName: '',
      prompt: '验证中...',
      shareId: '',
      shareFileIoc: '',
      shareFile: {
        rows: [],
        pagination: {
          total: 0,
          pageNum: 1,
          pageSize: 20
        }
      }
    }
  },
  methods: {
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
      GetShareFile({ shareId: this.shareId }).then(res => {
        this.shareFile.rows.push(res.data)
        this.shareFileIoc = this.fileIcoFilter()
        console.log(this.shareFile)
      })
    },
    fileIcoFilter () {
      switch (this.shareFile.rows[0].fileType) {
        case 0 :
          return require('@/assets/file_ico/Folder_24_e0cacad.png')
        case 1 :
          return require('@/assets/file_ico/Text_24_dd1b3d8.png')
        case 11 :
          return require('@/assets/file_ico/Word_24_1e078ab.png')
        case 12 :
          return require('@/assets/file_ico/Excel_24_614e53a.png')
        case 13 :
          return require('@/assets/file_ico/PPT_24_0af6886.png')
        case 14 :
          return require('@/assets/file_ico/PDF_24_5caf7bf.png')
        case 2 :
          return require('@/assets/file_ico/Picture_24_dd06d30.png')
        case 3 :
          return require('@/assets/file_ico/Music_24_04cf4b7.png')
        case 4 :
          return require('@/assets/file_ico/Video_24_499ddeb.png')
        case 5 :
          return require('@/assets/file_ico/ZIP_24_3670294.png')
        case 6 :
          return require('@/assets/file_ico/Android_24_a529a3a.png')
        case 9 :
          return require('@/assets/file_ico/Misc_24_156416f.png')
      }
    }
  },
  mounted () {
    this.shareId = this.$route.params.shareId
    if (this.shareId) {
      this.getShareFile()
    } else {
      const user = this.$store.getters.getUser
      if (user) {
        this.sysUserName = user.name || '';
        this.sysUserAvatar = user.avatar || '';
      }
      this.verifyEmail()
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
