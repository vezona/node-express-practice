// const createError = require('http-errors');
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// ——————————  設定環境變數 ——————————
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

// ——————————  錯誤處理  ——————————
const { appError, errorEnvHandler } = require('./service/errorHandler');

// ——————————  資料庫連線設定  ——————————
const DB = process.env.DATA_BASE.replace(
  '<password>',
  process.env.PASSWORD
)
const mongoose = require('mongoose');
mongoose.connect(DB).then(res => console.log('連線資料成功'));

// ——————————  頁面路徑設定  ——————————
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');

const app = express();

// ——————————  view engine setup  ——————————
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors()); // 跨域設定
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);

// ——————————  設定swagger  ——————————
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger_output.json') // swagger JSON
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerFile))

// ——————————  404錯誤處理  ——————————
app.use(function (req, res, next) {
  appError(404, '無此路由資訊', next);
});

//  ——————————  不同環境的錯誤訊息處理(開發+正式)  ——————————
app.use(errorEnvHandler);


module.exports = app;
