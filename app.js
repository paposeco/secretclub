var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const session = require("express-session");
const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const compression = require("compression");
const helmet = require("helmet");
const RateLimit = require("express-rate-limit");

//db
require("dotenv").config();
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGODB_URI;
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

var app = express();
app.use(compression());
app.use(helmet());
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
});
// Apply rate limiter to all requests
app.use(limiter);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// cookies
app.use(session({ secret: "gatos", resave: false, saveUninitialized: true }));

// passport
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

// router
app.use("/", indexRouter);
app.use("/", authRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
