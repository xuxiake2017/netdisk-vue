<template>
<el-row class="container">
  <el-col :span="24" class="header">
    <el-col :span="10" class="logo hidden-xs-only">
      <span>{{sysName}}</span>
      <img src="../assets/logo.png"/>
    </el-col>
    <el-col v-if="$store.getters.getUser" :span="2" class="user-info">
      <el-button type="text" class="button" @click="toHome">首页</el-button>
      <img :src="this.sysUserAvatar" />
    </el-col>
    <el-col :span="2" class="tool" v-else>
      <el-button type="text" class="button" @click="toLogin">登录</el-button>
      <el-button type="text" class="button" @click="toRegister">注册</el-button>
    </el-col>
  </el-col>
  <el-col>
    <el-card>
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

export default {
  data () {
    return {
      sysName: 'NETDISK-VUE',
      sysUserAvatar: '',
      sysUserName: '',
      prompt: '验证中...'
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
    }
  },
  mounted () {
    const user = this.$store.getters.getUser
    if (user) {
      this.sysUserName = user.name || '';
      this.sysUserAvatar = user.avatar || '';
    }
    this.verifyEmail()
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
