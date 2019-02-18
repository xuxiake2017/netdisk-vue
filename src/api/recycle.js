import { post } from '../common/request'

export const GetRecycleList = params => {
  return post('recycle/toRecycleList', params).then(res => res.data)
}

export const Reback = params => {
  return post('recycle/reback', params).then(res => res.data)
}

export const DeleteRecycle = params => {
  return post(`recycle/delete/${params}`).then(res => res.data)
}
