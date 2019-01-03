import { checkPhone, checkEmail } from '../../common/validate'

export default {
  avatar: [{ required: true, message: '请上传用户头像' }],
  username: [{ required: true, message: '请填写用户名' }],
  realName: [{ required: true, message: '请填写真实姓名' }],
  email: [
    {
      validator: checkEmail,
      message: '请输入正确的邮箱地址',
      trigger: 'blur'
    }
  ],
  phone: [
    {
      validator: checkPhone,
      message: '联系电话格式不正确，请输入正确的中国大陆手机号或本地固定电话',
      trigger: 'blur'
    }
  ],
  password: [
    {
      trigger: 'blur',
      validator: (rule, value, callback) => {
        if (value) {
          if (!/^[A-Za-z\d]+$/.test(value)) {
            callback(new Error('密码应只包含数字、字母'))
          } else if (value.length < 6) {
            callback(new Error('密码长度至少6位'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      }
    }
  ]
}
