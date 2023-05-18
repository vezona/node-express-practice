const jwt = require('jsonwebtoken');
const { appError, handleAsyncError } = require('../service/errorHandler');
const User = require('../Models/usersModel');

// 驗證是否為登入狀態
const isAuth = handleAsyncError(async (req, res, next) => {
  // 確認 token 是否存在
  let token;
  // headers.authorization = Bearer token 確認是否有帶入 token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(appError(401, '你尚未登入！', next));
  }

  // 有帶 token：驗證 token 正確性
  const decoded = await new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) {
        reject(err);
      } else {
        resolve(payload);
      }
    });
  });
  // 預設會帶 id 欄位資料，可自訂選取 email 欄位夾帶回傳
  const currentUser = await User.findById(decoded.id).select('email');
  // 自訂要返還的使用者資料
  req.user = currentUser;
  next();
});

// 產生 JWT token
const generateSendJWT = (user, statusCode, res) => {
  // 產生 JWT token，id+想混淆的字串+過期時間
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_DAY,
  });
  user.password = undefined; // 把 password 隱藏掉，讓回傳的資料不會有password
  res.status(statusCode).json({
    status: 'success',
    user: {
      token,
      email: user.email,
    },
  });
};

module.exports = {
  isAuth,
  generateSendJWT,
};
