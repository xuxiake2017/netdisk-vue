import { post } from '../common/request'

export const GetFileList = params => {
  return post('file/listFile', params, {stringify: true}).then(res => res.data)
}

export const CheckMd5 = params => {
  return post('file/checkMd5', params, {stringify: true}).then(res => res.data)
}

export const UploadMD5 = params => {
  return post('file/uploadMD5', params, {stringify: true}).then(res => res.data)
}

export const ListAllDir = params => {
  return post('dir/listAllDir', params, {stringify: true}).then(res => res.data)
}

export const MkDir = params => {
  return post('dir/mkDir', params, {stringify: true}).then(res => res.data)
}

export const MoveFile = params => {
  return post('dir/moveFile', params, {stringify: true}).then(res => res.data)
}

export const ReName = params => {
  return post('file/reName', params, {stringify: true}).then(res => res.data)
}

// export const getUserList = params => {
//   return axios.get(`${base}/user/list`, {params: params})
// }
//
// export const getUserListPage = params => {
//   return axios.get(`${base}/user/listpage`, {params: params})
// }
//
// export const removeUser = params => {
//   return axios.get(`${base}/user/remove`, {params: params})
// }
//
// export const batchRemoveUser = params => {
//   return axios.get(`${base}/user/batchremove`, {params: params})
// }
//
// export const editUser = params => {
//   return axios.get(`${base}/user/edit`, {params: params})
// }
//
// export const addUser = params => {
//   return axios.get(`${base}/user/add`, {params: params})
// }
