// 統一錯誤訊息管理
const appError = (httpStatus, errMessage, next) => {
  const error = new Error(errMessage);
  error.statusCode = httpStatus;
  error.isOperational = true;
  next(error);
};

// 非同步的 try catch錯誤處理
const handleAsyncError = function handleAsyncError(func) {
  return function (req, res, next) {
    //再執行函式，async 可再用 catch 統一捕捉
    func(req, res, next).catch(function (error) {
      return next(error);
    });
  };
};

// 自訂正式環境錯誤
const errorMsgProduction = (err, req, res, next) => {
  // 在已知的錯誤中，回傳錯誤訊息
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      code: err.statusCode,
      message: err.message,
    });
  } else {
    // 其他不明原因的錯誤，寫進 log 紀錄
    res.status(500).json({
      success: false,
      code: 500,
      message: '系統錯誤，請洽管理員',
    });
    
  }
};
// 自訂開發環境錯誤
const errorMsgDev = (err, res) => {
  res.status(err.statusCode).json(
    {
      success: false,
      code: err.statusCode,
      message: err.message,
      isOperational: err.isOperational,
      stack: err.stack, // 測試機可以有stack，找出錯在哪個檔案
    });
};

// 不同環境錯誤時處理
const errorEnvHandler = function (err, req, res, next) {
  if (process.env.NODE_ENV === 'dev') {
    return errorMsgDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // 驗證錯誤處理
    if (err.name === 'ValidationError') {
      err.message = '資料欄位未填寫正確，請重新輸入';
      err.isOperational = true;
      return errorMsgProduction(err, req, res, next);
    } else {
      return errorMsgProduction(err, req, res, next);
    }
  }
};

module.exports = {
  appError,
  handleAsyncError,
  errorEnvHandler,
};
