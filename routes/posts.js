const express = require('express');
const router = express.Router();
// 載入錯誤處理
const { appError, handleAsyncError } = require('../service/errorHandler');
// 載入Model
const Post = require('../Models/postModel');

// 取得貼文
router.get('/', async function (req, res, next) {
  // 取得 Model Post的資料
  const posts = await Post.find();
  res.status(200).json({
    posts,
  });
});

// 新增貼文
router.post(
  '/',
  handleAsyncError(async function (req, res, next) {
    if (req.body.content == undefined) {
      return next(appError(400, '沒有填寫 content 資料', next));
    }

    const newPost = await Post.create({
      name: req.body.name,
      content: req.body.content,
    });
    res.status(200).json({
      status: 'success',
      posts: newPost,
    });
  })
);

module.exports = router;
