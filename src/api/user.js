import { post } from '../common/request'

export const RequestLogin = params => {
  return post('user/login', params, {stringify: false}).then(res => res.data)
}

export const Logout = params => {
  return post('user/logout', params, {stringify: false}).then(res => res.data)
}
