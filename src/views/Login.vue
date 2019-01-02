<template>
<el-form :model="ruleForm2" :rules="rules2" ref="ruleForm2" label-position="left" label-width="0px" class="demo-ruleForm login-container" @keyup.enter.native="handleSubmit2">
  <h3 class="title">系统登录</h3>
  <el-form-item prop="loginInfo">
    <el-input type="text" v-model="ruleForm2.loginInfo" auto-complete="off" placeholder="账号"></el-input>
  </el-form-item>
  <el-form-item prop="password">
    <el-input type="password" v-model="ruleForm2.password" auto-complete="off" placeholder="密码"></el-input>
  </el-form-item>
  <el-form-item prop="imgCode">
    <el-input type="text" v-model="ruleForm2.imgCode" auto-complete="off" placeholder="验证码" style="width: 50%"></el-input>
    <div class="flag">
      <img :src="imgCode" @click="changeImgCode" class="content"/>
    </div>
  </el-form-item>
  <el-checkbox v-model="checked" checked class="remember">记住密码</el-checkbox>
  <el-form-item style="width:100%;">
    <el-button type="primary" style="width:100%;" @click.native.prevent="handleSubmit2" :loading="logining">登录</el-button>
    <!--<el-button @click.native.prevent="handleReset2">重置</el-button>-->
  </el-form-item>
</el-form>
</template>

<script>
import { RequestLogin } from '../api/user';
import { setToken } from '../common/auth'
// import NProgress from 'nprogress'
export default {
  data () {
    return {
      logining: false,
      imgCode: process.env.BASE_API + '/createImg',
      ruleForm2: {
        loginInfo: '',
        password: '',
        imgCode: ''
      },
      rules2: {
        loginInfo: [
          { required: true, message: '请输入账号', trigger: 'blur' }
          // { validator: validaePass }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
          // { validator: validaePass2 }
        ]
      },
      checked: true
    };
  },
  methods: {
    changeImgCode () {
      this.imgCode = `${process.env.BASE_API}/createImg?${new Date().getTime()}`;
    },
    handleReset2 () {
      this.$refs.ruleForm2.resetFields();
    },
    handleSubmit2 (ev) {
      // const _this = this;
      this.$refs.ruleForm2.validate((valid) => {
        if (valid) {
          // _this.$router.replace('/table');
          this.logining = true;
          // NProgress.start();
          var loginParams = { ...this.ruleForm2 };
          RequestLogin(loginParams).then(data => {
            this.logining = false;
            // NProgress.done();
            this.$store.commit('storeUser', data.data)
            setToken(data.data.token)
            // sessionStorage.setItem('user', JSON.stringify(data.data));
            this.$router.push({ path: '/allFile' });
          }).catch(reason => {
            this.logining = false;
          })
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    }
  }
}

</script>

<style lang="scss" scoped>
  .login-container {
    /*box-shadow: 0 0px 8px 0 rgba(0, 0, 0, 0.06), 0 1px 0px 0 rgba(0, 0, 0, 0.02);*/
    -webkit-border-radius: 5px;
    border-radius: 5px;
    -moz-border-radius: 5px;
    background-clip: padding-box;
    margin: 180px auto;
    width: 350px;
    padding: 35px 35px 15px 35px;
    background: #fff;
    border: 1px solid #eaeaea;
    box-shadow: 0 0 25px #cac6c6;
    .title {
      margin: 0px auto 40px auto;
      text-align: center;
      color: #505458;
    }
    .remember {
      margin: 0px 0px 35px 0px;
    }
    .content {
      display: inline-block;
      vertical-align: middle;
    }
    .flag {
      display: inline-block;
      vertical-align: middle;
      height: 100%;
      width: 0;
      margin-left: 30px;
    }
  }
</style>
