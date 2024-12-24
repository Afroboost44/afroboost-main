// PERCENTAGES, BOOST PRICES AND OTHER PAYMENT INFORMATION


module.exports = (connection, io) => {
  const express = require("express");
  const util = require("util");
  const router = express.Router();
  const jwt = require("jsonwebtoken");
  const fileUpload = require("express-fileupload");
  const QRCode = require('qrcode');
  const { promisify } = require('util');
  const generateQRCode = promisify(QRCode.toDataURL);
  const query = util.promisify(connection.query).bind(connection);
  var secret =
    "E9A6CA5C98ADC60C80EEE0E2A0069BF920FBB3C6ABE8C82EF3178F842323460D";
  const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
  const ffmpeg = require("fluent-ffmpeg");

  ffmpeg.setFfmpegPath(ffmpegPath);

  router.use(fileUpload({}));

  router.use(async (req, res, next) => {
    if (req.header("X-Auth-Token") === "guest") {
      res.locals.guest = true;
      return next();
    }
    try {
      var decoded = jwt.verify(req.header("X-Auth-Token"), secret);
      const account = await query(
        "SELECT * FROM users WHERE mail_address = ?",
        [decoded.account.mail_address]
      );
      if (!account[0]) {
        return res.send({ code: 404, message: "Account not found" });
      }
      if (decoded.account.password != account[0].password)
        return res.send({ code: 405, message: "Invalid password" });
      res.locals.account = account[0];
      next();
    } catch (err) {
      // err
      console.log(err);
      return res.sendStatus(405);
    }
  });

  // Update number of participation for "Sport" category
  router.put("/participation", async (req, res) => {
    if (req.header("X-Auth-Token") === "guest") {
      return res.sendStatus(401);
    }
    try {
      await query("UPDATE library SET quantity = ? WHERE id = ?", [
        req.body.quantity,
        req.body.id,
      ]);
      return res.json(200).send({ message: "Successfully updated" });
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  // List all subscriptions
  router.get("/subscriptions/:postId", async (req, res) => {
    if (req.header("X-Auth-Token") === "guest") {
      return res.sendStatus(403);
    }
    if (!req.params.postId)
      return res.sendStatus(400);
    try {
      const posts = await query(
        "SELECT * , library.id as 'libraryId', library.total_session as totalSession  FROM library, posts, users WHERE library.post_id=posts.id AND users.id=library.user_id AND posts.id= ?",
        [req.params.postId]
      );
      return res.send({ code: 200, posts });
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  // Get subscriber product infos
  router.get("/library/:postId", async (req, res) => {
    if (req.header("X-Auth-Token") === "guest") {
      return res.sendStatus(403);
    }
    if (!req.params.postId)
      return res.sendStatus(400);
    try {
      const libraries = await query(
        "SELECT * , library.id as 'libraryId', library.total_session as totalSession,library.qrstatus as qrstatus,library.validation as validation  FROM library, posts WHERE library.post_id= ?  AND library.user_id= ? AND posts.id=library.post_id",
        [req.params.postId, res.locals.account.id]
      );
      return res.send({ code: 200, libraries });
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });



  return router;
};
