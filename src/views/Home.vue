<template>
<el-row class="container">
  <el-col :span="24" class="header">
    <el-col :span="10" class="logo hidden-xs-only" :class="collapsed?'logo-collapse-width':'logo-width'">
      {{collapsed?'':sysName}}
      <img src="../assets/logo.png"/>
    </el-col>
    <el-col :span="10">
      <div class="tools" @click.prevent="collapse">
        <i class="fa fa-align-justify"></i>
      </div>
    </el-col>
    <el-col :span="4" class="userinfo">
      <el-dropdown trigger="hover">
        <span class="el-dropdown-link userinfo-inner">
          <i class="fa fa-circle msg-tag" v-if="this.$store.getters.getUser.messages.length > 0"></i>
          <img :src="this.sysUserAvatar" />
          <span class="hidden-xs-only">{{sysUserName}}</span>
        </span>
        <el-dropdown-menu slot="dropdown" class="hidden-xs-only">
          <el-dropdown-item @click.native="toMyMsg">我的消息<i v-if="this.$store.getters.getUser.messages.length > 0" class="fa fa-circle" style="color: #ff4d51; font-size: 3px;"></i></el-dropdown-item>
          <el-dropdown-item @click.native="toUserInfo">个人信息</el-dropdown-item>
          <el-dropdown-item divided @click.native="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </el-col>
  </el-col>
  <el-col :span="24" class="main">
    <aside :class="collapsed?'menu-collapsed':'menu-expanded'" class="hidden-xs-only">
      <!--导航菜单-->
      <el-menu :default-active="$route.path" class="el-menu-vertical-demo"
         unique-opened router :collapse="collapsed" :collapse-transition="false">
        <template v-for="(item,index) in $router.options.routes" v-if="!item.hidden">
          <el-submenu :index="index+''" v-if="!item.leaf" v-bind:key="index">
            <template slot="title">
              <i :class="item.iconCls"></i>
              <span slot="title">{{item.name}}</span>
            </template>
            <el-menu-item v-for="child in item.children" :index="child.path" :key="child.path" v-if="!child.hidden">{{child.name}}</el-menu-item>
          </el-submenu>
          <el-menu-item v-if="item.leaf&&item.children.length>0" :index="item.children[0].path" v-bind:key="index">
            <i :class="item.iconCls"></i>
            <span slot="title">{{item.children[0].name}}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </aside>
    <section class="content-container">
      <div class="grid-content bg-purple-light">
        <el-col :span="24" class="content-wrapper">
          <transition name="fade" mode="out-in">
            <router-view></router-view>
          </transition>
        </el-col>
      </div>
    </section>
  </el-col>
</el-row>
</template>

<script>
import { Logout } from '../api/user'
import 'element-ui/lib/theme-chalk/display.css'

export default {
  data () {
    return {
      sysName: 'NETDISK-VUE',
      collapsed: false,
      sysUserName: '',
      sysUserAvatar: ''
    }
  },
  methods: {
    // 退出登录
    logout: function () {
      this.$confirm('确认退出吗?', '提示', {
      }).then(() => {
        Logout().then(res => {
          this.$store.commit('delUser')
          location.reload();
        })
      }).catch(() => {
      });
    },
    toUserInfo () {
      this.$router.push('/userInfo')
    },
    toMyMsg () {
      this.$router.push('/myMessage')
    },
    // 折叠导航栏
    collapse: function () {
      this.collapsed = !this.collapsed;
    }
  },
  mounted () {
    const user = this.$store.getters.getUser
    console.log(user)
    if (user) {
      this.sysUserName = user.name || '默认用户名';
      this.sysUserAvatar = user.avatar || 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif';
    }
    if (user.messages.length > 0) {
      this.$notify.info({
        title: '提示',
        message: `您有新的消息，请到"我的信息"中查看`,
        duration: 2000,
        position: 'bottom-right'
      });
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
    .userinfo {
      text-align: right;
      padding-right: 35px;
      float: right;
      .userinfo-inner {
        cursor: pointer;
        color:#fff;
        img {
          width: 40px;
          height: 40px;
          border-radius: 20px;
          margin: 10px 0px 10px 10px;
          float: right;
        }
        .msg-tag {
          color: #ff4d51;
          position: absolute;
          right: 3px;
          bottom: 3px;
        }
      }
    }
    .logo {
      height:60px;
      font-size: 22px;
      padding-left:10px;
      padding-right:10px;
      border-color: rgba(238,241,146,0.3);
      border-right-width: 1px;
      border-right-style: solid;
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
    .logo-width{
      width:230px;
    }
    .logo-collapse-width{
      width:65px
    }
    .tools{
      padding: 0px 23px;
      width:14px;
      height: 60px;
      line-height: 60px;
      cursor: pointer;
    }
  }
  .main {
    display: flex;
    // background: #324057;
    position: absolute;
    top: 60px;
    bottom: 0px;
    overflow: hidden;
    aside {
      flex:0 0 230px;
      width: 230px;
      // position: absolute;
      // top: 0px;
      // bottom: 0px;
      .el-menu{
        height: 100%;
      }
      .collapsed{
        width:60px;
        .item{
          position: relative;
        }
        .submenu{
          position:absolute;
          top:0px;
          left:60px;
          z-index:99999;
          height:auto;
          display:none;
        }

      }
    }
    .menu-collapsed{
      flex:0 0 60px;
      width: 60px;
    }
    .menu-expanded{
      flex:0 0 230px;
      width: 230px;
    }
    .content-container {
      // background: #f1f2f7;
      flex:1;
      // position: absolute;
      // right: 0px;
      // top: 0px;
      // bottom: 0px;
      // left: 230px;
      /*overflow-y: scroll;*/
      padding: 20px;
      .content-wrapper {
        background-color: #fff;
        box-sizing: border-box;
      }
    }
  }
}
</style>
