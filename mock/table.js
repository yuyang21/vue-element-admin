import Mock from 'mockjs'

const data = Mock.mock({
  'items|4': [{
    id: '@id',
    user_name: '@name(0, 1)',
    'status|1': ['正常', '禁用', '注销'],
    email: 'root@yyzyy.com',
    create_time: +Mock.Random.date('T'),
    mobile: '@id'
  }]
})

export default [
  {
    url: '/table/list',
    type: 'get',
    response: config => {
      const items = data.items
      return {
        code: 20000,
        data: {
          total: items.length,
          items: items
        }
      }
    }
  },

  {
    url: '/admin/create',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  },

  {
    url: '/admin/update',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  }
]
