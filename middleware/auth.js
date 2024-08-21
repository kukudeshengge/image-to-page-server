const jwt = require('jsonwebtoken')
const { toError } = require('../utils')
const userModel = require('../model/user')
const whiteList = require('../config/whiteList')
const SECRET = 'image-to-h5-server-en'

const auth = async (req, res, next) => {
  try {
    const isWhiteReq = whiteList.some(item => req.url.indexOf(item) > -1)
    if (isWhiteReq) {
      return next()
    }
    const rawToken = req.headers.authorization || req.body.authorization
    const data = jwt.verify(rawToken, SECRET)
    if (data.id) {
      req.user = await userModel.findOne({ _id: data.id })
      next()
    } else {
      res.json(toError('登录失效', null, 401))
    }
  } catch (err) {
    res.json(toError('登录失效', null, 401))
  }
}

module.exports = {
  SECRET,
  middleware: auth
}
