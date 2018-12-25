import { post } from '../common/request'

const ToImgList = params => {
  return post('img/toImgList', params, {stringify: true}).then(res => res.data)
}
export default ToImgList
