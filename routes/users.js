const express = require('express');
const bcrypt = require('bcryptjs');
const { appError, handleAsyncError } = require('../service/errorHandler');
const validator = require('validator');
const User = require('../Models/usersModel');
const { isAuth, generateSendJWT } = require('../service/auth');
const router = express.Router();

// 抓取email 前綴作為使用者名稱
const getEmailPrefix = (email)=> {
  const regex = /^([^@]+)@/;
  const match = email.match(regex);

  if (match && match.length > 1) {
    return match[1];
  } else {
    throw new Error('無法提取電子郵件前綴');
  }
}

router.post(
  '/sign_up',
  handleAsyncError(async (req, res, next) => {
    let { email, password } = req.body;
    // 帳號密碼不可為空
    if (!email || !password) {
      return next(appError(400, '欄位未填寫正確！', next));
    }
    // 帳號是否為合法 Email
    if (!validator.isEmail(email)) {
      return next(appError(400, 'Email 格式不正確', next));
    }
    // 密碼 4 碼以上
    if (!validator.isLength(password, { min: 4 })) {
      return next(appError(400, '密碼字數低於 4 碼', next));
    }

    // 抓資料庫的使用者資料，確認是否已有此帳號
    const isUserExit = await User.findOne({ email });
    if (isUserExit) {
      return next(appError(400, '該會員帳號已註冊過', next));
    }

    // 加密密碼以供寫入資料庫
    password = await bcrypt.hash(req.body.password, 12);
    // 開啟User Model，建立新使用者
    const newUser = await User.create({
      email,
      password,
      name: getEmailPrefix(email),
      photo: null
    });
    generateSendJWT(newUser, 201, res);
  })
);

router.post(
  '/sign_in',
  handleAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(appError(400, '帳號密碼不可為空', next));
    }

    // 抓資料庫的使用者資料欄位，確認帳號是否存在
    const user = await User.findOne({ email }).select('email +password');
    if (!user) {
      return next(appError(400, '無此會員帳號', next));
    }
    // 使用加密的compare語法，與資料庫的密碼比對
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return next(appError(400, '您的密碼不正確', next));
    }
    // 確認OK，送出JWT
    generateSendJWT(user, 200, res);
  })
);

// 權限控管：取得使用者資料時，先用 isAuth 這個 middleware確認是否有登入
router.get(
  '/profile/',
  isAuth,
  handleAsyncError(async (req, res, next) => {
    res.status(200).json({
      status: 'success',
      user: req.user,
    });
  })
);

// 更新密碼
router.post(
  '/updatePassword',
  isAuth,
  handleAsyncError(async (req, res, next) => {
    const { password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return next(appError('400', '密碼不一致！', next));
    }
    newPassword = await bcrypt.hash(password, 12);

    const user = await User.findByIdAndUpdate(req.user.id, {
      password: newPassword,
    });
    generateSendJWT(user, 200, res);
  })
);

// 更新使用者資料
router.patch(
  '/updateProfile',
  isAuth,
  handleAsyncError(async (req, res, next) => {
    const { name } = req.body;

    // 更新使用者資料
    await User.findByIdAndUpdate(req.user.id, {
      name: name,
    });

    // 取得更新後的資料
    const userUpdated = await User.findById(req.user.id).select('email name');

    res.status(200).json({
      status: 'success',
      user: {
        name: userUpdated.name,
        email: userUpdated.email,
      },
    });
  })
);
module.exports = router;
