/* eslint-disable */
const Mock = require('mockjs')
const Util = require('./util')

module.exports = function (app) {
  app.get('/api/**', function (request, response) {
    console.log('mock:: request.')
    console.log(request.url)
    const filePath = `./apis/actions/method`
    Util.getJsonFile(filePath)
    response.json(Mock.mock('{}'))
  })
}
