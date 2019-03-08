<template>
  <div>
    <el-form ref="form" :model="form" label-width="80px" :rules="rules">
      <el-row>
        <el-col :span="8">
          <el-form-item label="头像" prop="avatar">
            <el-upload
              class="avatar-uploader"
              :action="uploadAction"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
              :with-credentials="true">
              <img v-if="form.avatar" :src="form.avatar" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="用户类型" prop="">
            <el-tag :type="labelType(form.userStatus)">{{statusLabels(form.userStatus)}}</el-tag>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="真实姓名" prop="realName">
            <el-input v-model="form.realName"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="性别" prop="sex">
            <el-radio-group v-model="form.sex">
              <el-radio label="1">男</el-radio>
              <el-radio label="2">女</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="电话" prop="phone">
            <el-input v-model="form.phone"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="总容量" prop="totalMemory">
            <el-input v-model="form.totalMemory" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="可用容量" prop="availableMemory">
            <el-input v-model="availableMemory" disabled></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">提交</el-button>
        <el-button @click="goBack">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { Detail, Update } from '../../api/user'
import util from '../../common/util'
import Rules from './rules'

export default {
  data () {
    return {
      uploadAction: `${process.env.BASE_API}/user/uploadAvatar`,
      form: {
        id: null,
        username: '',
        password: '',
        sex: '',
        realName: '',
        totalMemory: '',
        usedMemory: '',
        phone: '',
        email: '',
        avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
        userStatus: 0
      },
      availableMemory: null,
      rules: Rules
    }
  },
  methods: {
    userDetail () {
      Detail().then(res => {
        this.form = res.data
        this.availableMemory = parseInt(this.form.totalMemory) - parseInt(this.form.usedMemory)
        this.availableMemory = util.formatFileSize(this.availableMemory)
        this.form.totalMemory = util.formatFileSize(this.form.totalMemory)
      })
    },
    labelType (userStatus) {
      switch (parseInt(userStatus)) {
        case this.$NetdiskConstant.USER_STATUS_NORMAL:
          return 'primary'
        case this.$NetdiskConstant.USER_STATUS_VIP:
          return 'success'
        default:
          break
      }
    },
    statusLabels (userStatus) {
      switch (parseInt(userStatus)) {
        case this.$NetdiskConstant.USER_STATUS_NORMAL:
          return '普通用户'
        case this.$NetdiskConstant.USER_STATUS_VIP:
          return 'VIP用户'
        default:
          break
      }
    },
    handleAvatarSuccess (res, file) {
      this.form.avatar = res.data
    },
    beforeAvatarUpload (file) {
      const isJPG = file.type === 'image/jpeg';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
      }
      return isJPG && isLt2M;
    },
    onSubmit () {
      this.$refs.form.validate(valid => {
        if (valid) {
          Update(this.form).then(res => {
            this.$confirm('修改成功, 是否返回首页?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'success'
            }).then(() => {
              this.$router.push({ path: '/allFile' })
            })
          }).catch(() => {
            console.log('用户详情保存失败')
          })
        } else {
          this.$notify({
            title: '失败',
            duration: '2000',
            message: '填写信息有误，请优化后再提交!',
            type: 'error'
          })
          console.log('error submit!!')
          return false
        }
      })
    },
    goBack () {
      this.$router.go(-1)
    }
  },
  mounted () {
    this.userDetail()
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .half {
    width: 50%;
  }
  .avatar-uploader {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 178px;
    height: 178px;
  }
  .avatar-uploader:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>
