// 大小写字母数字
export function validateAlphaNum(rule, value, callback) {
  const res = /^[A-Za-z\d]+$/.test(value)
  res
    ? callback()
    : callback(new Error(rule.message || '请仅输入大小写字母以及数字'))
}

// 密码
export function validatePassword(rule, value, callback) {
  if (value.length < 6) {
    callback(new Error(rule.message || '密码长度不应小于6位'))
  } else {
    callback()
  }
}

// 验证码
export function validateCaptcha(rule, value, callback) {
  if (value.length !== 4) {
    callback(new Error('验证码长度应为4位'))
  } else if (!/^[A-Za-z\d]+$/.test(value)) {
    callback(new Error('验证码应只包含数字、字母'))
  } else {
    callback()
  }
}

// 固话和手机
export function checkPhone(rule, value, callback) {
  const isPhone = /^([0-9]{3,4}-)?[0-9]{7,8}$/
  const isMob = /^((\+?86)|(\(\+86\)))?(13[012356789][0-9]{8}|15[012356789][0-9]{8}|18[02356789][0-9]{8}|147[0-9]{8}|1349[0-9]{7})$/
  const val = value && value.toString().trim()
  if (isMob.test(val) || isPhone.test(val)) {
    callback()
  } else {
    callback(
      new Error(
        rule.message ||
          '联系电话格式不正确，请输入正确的中国大陆手机号或本地固定电话'
      )
    )
  }
}

export function checkEmail(rule, value, callback) {
  const val = value && value.toString().trim()
  const res = /^[A-Za-z0-9._%-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,4}$/.test(val)
  res
    ? callback()
    : callback(new Error(rule.message || '请输入正确的邮箱地址'))
}
