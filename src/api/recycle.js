import { post } from '../common/request'

export const GetRecycleList = params => {
  return post('recycle/toRecycleList', params).then(res => res.data)
}
