/**
 * 验证码手机号码
 * @param {string} mobile
 * @returns {Boolean}
 */
function validMobile(mobile) {
  const reg = 11 && /^((13|14|15|17|18)[0-9]{1}\d{8})$/
  return reg.test(mobile)
}

/**
 * 验证邮箱
 * @param {string} email
 * @returns {Boolean}
 */
function validEmail(email) {
  const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return reg.test(email)
}

/**
 * 检查邮箱和手机号码
 */
function checkEmailMobile(data, ifNeedMobile, ifNeedEmail) {
  // 验证邮箱
  if (ifNeedEmail && !data.email) {
    vant.showToast('请输入邮箱')
    return false
  }
  if (data.email && !validEmail(data.email)) {
    vant.showToast('邮箱格式不正确')
    return false
  }
  // 手机号验证
  if (ifNeedMobile && !data.mobile) {
    vant.showToast('请输入手机号码')
    return false
  }
  if (data.mobile && !validMobile(data.mobile)) {
    vant.showToast('手机号码格式不正确')
    return false
  }
  return true
}
