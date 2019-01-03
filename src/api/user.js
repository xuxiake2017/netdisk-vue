import { post } from '../common/request'

export const RequestLogin = params => {
  return post('user/login', params, {stringify: false}).then(res => res.data)
}

export const Logout = params => {
  return post('user/logout', params).then(res => res.data)
}

export const GetInfo = params => {
  return post('user/getInfo', params).then(res => res.data)
}

export const Detail = params => {
  return post('user/detail', params).then(res => res.data)
}

export const Update = params => {
  return post('user/update', params, {stringify: false}).then(res => res.data)
}
