import { post } from '../common/request'

export const ShareFile = params => {
  return post('share/shareFile', params).then(res => res.data)
}

export const FindAll = params => {
  return post('share/findAll', params).then(res => res.data)
}

export const DeleteShare = params => {
  return post(`share/delete/${params}`).then(res => res.data)
}

export const GetShareFile = params => {
  return post('share/getShareFile', params).then(res => res.data)
}
