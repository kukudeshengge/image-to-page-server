const express = require('express')
const router = express.Router()
const resourceModel = require('../model/resource')
const { toSuccess, toError } = require('../utils')

// image-text text list
router.get('/resource_list', async (req, res) => {
  try {
    const { type } = req.query
    const list = await resourceModel.find({ type })
    res.json(toSuccess(list))
  } catch (err) {
    res.json(toError(err.message))
  }
})

// upload image-text
router.post('/upload', async (req, res) => {
  try {
    const { url, data, type } = req.body
    if (req.user.role !== 'admin') {
      return res.json(toError('不是哥们，你哪有这个权限啊'))
    }
    if (!['image-text', 'one-page', 'hot-text'].includes(type)) {
      return res.json(toError('请传入正确的type类型'))
    }
    const id = await resourceModel.insertOne({
      url,
      data,
      type
    })
    res.json(toSuccess(id))
  } catch (err) {
    res.json(toError(err.message))
  }
})

module.exports = router
