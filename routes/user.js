const express = require('express')
const { toError, toSuccess } = require('../utils')
const router = express.Router()
const jwt = require('jsonwebtoken')
const userModel = require('../model/user')
const { SECRET, middleware: authMiddleware } = require('../middleware/auth')

const DefaultAvatar = 'https://ossprod.jrdaimao.com/file/1723534175056451.jpg'

// 登录
router.post('/login', async (req, res) => {
  const { username, password } = req.body
  // 处理边界
  if (!username || !password) {
    return res.json(toError())
  }
  try {
    const user = await userModel.findOne({ password })
    if (!user) {
      return res.json(toError('用户不存在'))
    }
    if (user.password !== password) {
      return res.json(toError('密码不正确'))
    }
    const token = jwt.sign({
      id: user._id
    }, SECRET)
    res.json(toSuccess(token))
  } catch (err) {
    res.json(toError(err.message))
  }
})

// 注册
router.post('/registry', async (req, res) => {
  const { username, password, avatar, name } = req.body
  try {
    const user = await userModel.findOne({ username })
    if (!username || !password || !name) {
      return res.json(toError())
    }
    if (user) {
      return res.json(toError('用户已存在'))
    }
    const data = {
      username,
      password,
      role: '',
      avatar: avatar || DefaultAvatar,
      name
    }
    await userModel.insertOne(data)
    res.json(toSuccess())
  } catch (err) {
    console.log(err)
    res.json(toError(err.message))
  }
})

// 用户信息
router.get('/info', authMiddleware, async (req, res) => {
  const { user } = req
  res.json(toSuccess({
    role: user.role,
    avatar: user.avatar,
    name: user.name
  }))
})

module.exports = router
