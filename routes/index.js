const express = require('express')
const router = express.Router()
const imageModel = require('../model/image')
const { toSuccess, toError, sleep } = require('../utils')
const { ObjectId } = require('mongodb')
const dayjs = require('dayjs')

const statusEnum = {
  '-1': '草稿',
  0: '未开始',
  1: '进行中',
  2: '已结束'
}

const getImageStatus = (item) => {
  if (item.isDraft) return -1
  if (!item.endTime) return 0
  const now = dayjs()
  const start = dayjs(`${item.startTime} 00:00:00`)
  const end = dayjs(`${item.endTime} 23:59:59`)
  if (now > start && now < end) {
    return 1
  }
  if (now > end) {
    return 2
  }
}

// 作品列表
router.get('/image_list', async (req, res) => {
  try {
    const { user } = req
    const { name, startTime, endTime } = req.query
    const list = await imageModel.find({ fromUser: user._id })
    const newList = list.map(item => {
      const status = getImageStatus(item)
      return {
        name: item.name,
        status,
        statusTitle: statusEnum[status],
        firstPageUrl: item.firstPageUrl,
        _id: item._id,
        startTime: item.startTime,
        endTime: item.endTime,
        tag: item.tag,
        modifyTime: item.modifyTime
      }
    }).sort((x, y) => {
      return dayjs(y.modifyTime) - dayjs(x.modifyTime)
    }).filter(item => {
      let flag = true
      if (name) {
        flag = item.name.indexOf(name || '') > -1
      }
      if (startTime && endTime) {
        flag = dayjs(item.startTime) >= dayjs(startTime) && dayjs(item.endTime) <= dayjs(endTime)
      }
      return flag
    })
    res.json(toSuccess(newList))
  } catch (err) {
    res.json(toError(err.message))
  }
})

// 新建作品
router.get('/add_image', async (req, res) => {
  try {
    const { user } = req
    const startTime = dayjs().format('YYYY-MM-DD')
    const modifyTime = dayjs().format('YYYY-MM-DD HH:mm')
    const data = await imageModel.insertOne({
      isDraft: true,
      fromUser: user._id,
      startTime,
      endTime: '',
      tag: 'H5',
      modifyTime,
      name: `作品-${modifyTime}`,
      audio: {
        name: '',
        src: ''
      },
      loadingPage: {
        text: '',
        textColor: '#333333',
        dotType: 'BeatLoader',
        dotColor: '#1261ff'
      },
      pageList: []
    })
    res.json(toSuccess(data.insertedId))
  } catch (err) {
    res.json(toError(err.message))
  }
})

// 详情
router.get('/detail', async (req, res) => {
  const { id } = req.query
  try {
    const data = await imageModel.findOne({ _id: new ObjectId(id) })
    if (data) {
      const status = getImageStatus(data)
      data.status = status
      data.statusTitle = statusEnum[status]
      res.json(toSuccess(data))
    } else {
      res.json(toError())
    }
  } catch (err) {
    res.json(toError(err.message))
  }
})

// 保存
router.post('/save', async (req, res) => {
  try {
    const { audio, loadingPage, pageList, name, startTime, endTime, tag, isDraft, firstPageUrl, id } = req.body
    const modifyTime = dayjs().format('YYYY-MM-DD HH:mm')
    const oldData = await imageModel.findOne({ _id: new ObjectId(id) })
    const data = await imageModel.updateOne({
      modifyTime,
      firstPageUrl: firstPageUrl || oldData.firstPageUrl,
      name: name || oldData.name,
      startTime: startTime || oldData.startTime,
      endTime: endTime || oldData.endTime,
      tag: tag || oldData.tag,
      audio: audio || oldData.audio,
      loadingPage: loadingPage || oldData.loadingPage,
      pageList: pageList || oldData.pageList,
      isDraft: isDraft === undefined ? oldData.isDraft : isDraft
    }, id)
    res.json(toSuccess(data))
  } catch (err) {
    res.json(toError(err.message))
  }
})

router.get('/delete', async (req, res) => {
  try {
    const { id } = req.query
    await imageModel.deleteOne(id)
    sleep()
    res.json(toSuccess())
  } catch (err) {
    res.json(toError(err.message))
  }
})

module.exports = router
