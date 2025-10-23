import request from './request'

/**
 * 获取监护人下的小雷锋列表
 */
export function getVolunteerList() {
  return request({
    url: '/mini/volunteer/list',
    method: 'get'
  })
}

/**
 * 添加小雷锋
 */
export function addVolunteer(data: any) {
  return request({
    url: '/mini/volunteer/add',
    method: 'post',
    data
  })
}

/**
 * 删除小雷锋
 */
export function deleteVolunteer(id: string) {
  return request({
    url: '/mini/volunteer/delete',
    method: 'post',
    data: { id }
  })
}

/**
 * 更新小雷锋信息
 */
export function updateVolunteer(data: any) {
  return request({
    url: '/mini/volunteer/update',
    method: 'post',
    data
  })
}