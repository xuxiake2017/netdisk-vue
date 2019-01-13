<template>
<el-form :model="form" :rules="rules" ref="form" label-position="left" label-width="0px" class="demo-ruleForm login-container" @keyup.enter.native="handleSubmit">
  <h3 class="title">{{this.$route.params.info === 'login' ? '系统登录' : '系统注册'}}</h3>
  <el-form-item prop="loginInfo" v-if="this.$route.params.info === 'login'">
    <el-input type="text" v-model="form.loginInfo" auto-complete="off" placeholder="用户名/手机号/邮箱"></el-input>
  </el-form-item>
  <el-form-item prop="username" v-if="this.$route.params.info === 'register'">
    <el-input type="text" v-model="form.username" auto-complete="off" placeholder="用户名"></el-input>
  </el-form-item>
  <el-form-item prop="password">
    <el-input type="password" v-model="form.password" auto-complete="off" placeholder="密码"></el-input>
  </el-form-item>
  <el-form-item prop="rePassword" v-if="this.$route.params.info === 'register'">
    <el-input type="password" v-model="form.rePassword" auto-complete="off" placeholder="确认密码"></el-input>
  </el-form-item>
  <el-form-item prop="verifyInfo" v-if="this.$route.params.info === 'register'">
    <el-input type="text" v-model="form.verifyInfo" auto-complete="off" placeholder="手机/邮箱"></el-input>
  </el-form-item>
  <el-form-item prop="imgCode">
    <el-row :gutter="30">
      <el-col :span="10">
        <el-input type="text" v-model="form.imgCode" auto-complete="off" placeholder="验证码"></el-input>
      </el-col>
      <el-col :span="10">
        <img :src="captchaSrc" @click="changeImgCode" class="imgCode"/>
      </el-col>
    </el-row>
  </el-form-item>
  <el-form-item v-if="isPhone">
    <el-row :gutter="30">
      <el-col :span="10">
        <el-input type="text" v-model="form.smsCode" auto-complete="off" placeholder="短信验证码"></el-input>
      </el-col>
      <el-col :span="10">
        <el-button type="text" @click.native.prevent="getSmsCode" :disabled="smsSendDisable">{{smsSendText}}</el-button>
      </el-col>
    </el-row>
  </el-form-item>
  <el-form-item style="margin-bottom: 5px;">
    <el-row :gutter="20" v-if="this.$route.params.info === 'login'">
      <el-col :span="7">
        <el-checkbox v-model="checked" checked class="remember">记住密码</el-checkbox>
      </el-col>
      <el-col :span="10">
        <el-button type="text" @click.native.prevent="toRegister">没有账号？立即注册</el-button>
      </el-col>
    </el-row>
    <el-row :gutter="20" v-if="this.$route.params.info === 'register'">
      <el-col :span="10">
        <el-button type="text" @click.native.prevent="toLogin">已有账号？立即登录</el-button>
      </el-col>
    </el-row>
  </el-form-item>
  <el-form-item style="width:100%;">
    <el-button type="primary" style="width:100%;" @click.native.prevent="handleSubmit" :loading="logining">
      {{this.$route.params.info === 'login' ? '登录' : '注册'}}
    </el-button>
  </el-form-item>
</el-form>
</template>

<script>
import { RequestLogin, CheckUserName, CheckPhone, CheckEmail, CheckImgCode, SendCodeToPhone, Register } from '../../api/user';
import { setToken } from '../../common/auth'
export default {
  data () {
    // 验证注册用户名
    const validatorUsername = (rule, value, callback) => {
      if (value) {
        const reg = /^[A-Za-z0-9_]{5,20}$/;
        if (reg.test(value)) {
          CheckUserName({ username: value }).then(res => {
            if (res.data === 20071) {
              callback(new Error(res.msg))
            } else {
              callback()
            }
          })
        } else {
          callback(new Error('用户名由5-20位大小写字母及下划线组成'))
        }
      } else {
        callback(new Error('请填写用户名'))
      }
    }
    // 验证注册手机邮箱
    const validatorVerifyInfo = (rule, value, callback) => {
      if (value) {
        const phoneReg = /^[1][3,4,5,7,8][0-9]{9}$/;
        const emailReg = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;
        if (phoneReg.test(value)) {
          this.isPhone = true
          CheckPhone({phone: value}).then(res => {
            if (res.data === 20072) {
              callback(new Error(res.msg))
            } else {
              callback()
            }
          })
        } else if (emailReg.test(value)) {
          this.isPhone = false
          CheckEmail({email: value}).then(res => {
            if (res.data === 20073) {
              callback(new Error(res.msg))
            } else {
              callback()
            }
          })
        } else {
          callback(new Error('请输入正确的电话/邮箱'))
        }
      } else {
        callback(new Error('请输入电话/邮箱'))
      }
    }
    // 验证注册密码
    const validatorPassword = (rule, value, callback) => {
      if (value) {
        const reg = /^[A-Za-z0-9_]{6,}$/;
        if (reg.test(value)) {
          callback()
        } else {
          callback(new Error('密码由至少6位大小写字母及下划线组成'))
        }
        callback()
      } else {
        callback(new Error('请输入密码'))
      }
    }
    // 验证注册确认密码
    const validatorRePassword = (rule, value, callback) => {
      if (value) {
        if (this.form.password !== value) {
          callback(new Error('两次输入密码不一致'))
        }
        callback()
      } else {
        callback(new Error('请再次输入密码'))
      }
    }
    const validatorImgCode = (rule, value, callback) => {
      if (value) {
        if (this.$route.params.info === 'login') {
          callback()
        } else {
          CheckImgCode({ imgCode: value }).then(res => {
            if (res.data === 20074) {
              callback(new Error(res.msg))
            } else {
              callback()
            }
          })
        }
      } else {
        callback(new Error('请输入验证码'))
      }
    }
    return {
      logining: false,
      captchaSrc: process.env.BASE_API + '/createImg',
      form: {
        loginInfo: '',
        password: '',
        rePassword: '',
        imgCode: '',
        verifyInfo: '',
        smsCode: ''
      },
      isPhone: false,
      smsSendDisable: false,
      smsSendText: '获取短信验证码',
      rules: {
        username: [
          { trigger: 'blur', validator: validatorUsername }
        ],
        verifyInfo: [
          { trigger: 'blur', validator: validatorVerifyInfo }
        ],
        loginInfo: [
          { required: true, message: '请输入用户名/手机号/邮箱', trigger: 'change' }
        ],
        password: [
          { trigger: 'blur', validator: validatorPassword }
        ],
        imgCode: [
          { trigger: 'blur', validator: validatorImgCode }
        ],
        smsCode: [
          { required: true, message: '请输入短信验证码', trigger: 'blur' }
        ],
        rePassword: [
          { trigger: 'blur', validator: validatorRePassword }
        ]
      },
      checked: true
    };
  },
  methods: {
    changeImgCode () {
      this.captchaSrc = `${process.env.BASE_API}/createImg?${new Date().getTime()}`;
    },
    handleReset () {
      this.$refs.form.resetFields();
      this.isPhone = false
    },
    handleSubmit (ev) {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const params = { ...this.form };
          if (this.$route.params.info === 'login') {
            this.logining = true;
            RequestLogin(params).then(data => {
              this.logining = false;
              this.$store.commit('storeUser', data.data)
              setToken(data.data.token)
              this.$router.push({ path: '/allFile' });
            }).catch(reason => {
              this.logining = false;
            })
          } else if (this.$route.params.info === 'register') {
            if (this.isPhone) {
              if (this.form.smsCode) {
                this.logining = true;
                Register(params).then(data => {
                  this.logining = false;
                  this.$confirm('注册成功，是否立即登录？', '提示', {
                  }).then(() => {
                    this.$router.push({ path: '/login' });
                  })
                }).catch(reason => {
                  this.logining = false;
                })
              } else {
                this.$message({
                  message: '请填写短信验证码',
                  type: 'warning'
                });
              }
            } else {
              this.logining = true;
              Register(params).then(data => {
                this.logining = false;
                this.$confirm('注册成功，是否立即登录？', '提示', {
                }).then(() => {
                  this.$router.push({ path: '/login' });
                })
              }).catch(reason => {
                this.logining = false;
              })
            }
          }
        } else {
          this.$notify({
            duration: 2000,
            title: '警告',
            message: this.$route.params.info === 'login' ? '请将登录信息填写完整！' : '请确保注册信息填写正确',
            type: 'warning'
          })
          return false;
        }
      });
    },
    toRegister () {
      this.$router.push({ path: '/user/register' })
    },
    getSmsCode () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          SendCodeToPhone({ phone: this.form.verifyInfo }).then(res => {
            this.$message('验证码已发送，请注意查收');
            this.smsSendDisable = true
            let second = 60
            const id = window.setInterval(() => {
              if (second > 0) {
                second--
                this.smsSendText = `获取短信验证码(${second})`
              } else {
                window.clearInterval(id)
                this.smsSendDisable = false
                this.smsSendText = '获取短信验证码'
              }
            }, 1000)
          })
        } else {
          this.$notify({
            duration: 2000,
            title: '警告',
            message: '请确保注册信息填写正确',
            type: 'warning'
          })
        }
      })
    },
    toLogin () {
      this.$router.push({ path: '/user/login' });
    }
  },
  beforeRouteUpdate (to, from, next) {
    this.handleReset()
    this.changeImgCode()
    next()
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
    /*.remember {*/
      /*margin: 0px 0px 35px 0px;*/
    /*}*/
    .imgCode {
      display: inline-block;
      vertical-align: middle;
      cursor: pointer;
    }
  }
</style>
