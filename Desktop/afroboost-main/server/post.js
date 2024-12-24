// PERCENTAGES, BOOST PRICES AND OTHER PAYMENT INFORMATION

const { SSL_OP_NO_TLSv1_1 } = require("constants");

// THIS IS THE BOOST PRICE.
const boostPrice = 5;
//                ^^^ JUST CHANGE THIS NUMBER.
// THIS IS THE PERCENTAGE.
const percentage = 95;
//                ^^^ JUST CHANGE THIS NUMBER.

module.exports = (connection, io) => {
  const express = require("express");
  const util = require("util");
  const router = express.Router();
  const bcrypt = require("bcrypt");
  const fs = require("fs");
  const jwt = require("jsonwebtoken");
  const rimraf = require("rimraf");
  const nodemailer = require("nodemailer");
  const fileUpload = require("express-fileupload");
  const cron = require('node-cron');
  const query = util.promisify(connection.query).bind(connection);
  var encryptor = require("simple-encryptor")(
    "KoDskDmek4dfkEIdoDEMjddi4rdKFSakfia45odksdfskro43ikDKsei4l3sdkk3j4jewrsfjjfI4slfkfkDioIDkEJEjekFOFOf34olrkfdKFIifs"
  );
  var secret =
    "E9A6CA5C98ADC60C80EEE0E2A0069BF920FBB3C6ABE8C82EF3178F842323460D";
  const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
  const ffmpeg = require("fluent-ffmpeg");
  const path = require("path");
  var admin = require("firebase-admin");

  ffmpeg.setFfmpegPath(ffmpegPath);
  /*
        id
        name
        username
        mail_address
        password
        phone_number
        balance
    */

  router.use(fileUpload({}));
  Array.prototype.remove = function () {
    var what,
      a = arguments,
      L = a.length,
      ax;
    while (L && this.length) {
      what = a[--L];
      while ((ax = this.indexOf(what)) !== -1) {
        this.splice(ax, 1);
      }
    }
    return this;
  };
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

  var lives = {};
  var onlineUsers = [];

  io.on("connection", async (socket) => {
    const requester = socket.handshake.auth.token;

    var decoded = jwt.verify(requester, secret);
    const account = await query("SELECT * FROM users WHERE mail_address = ?", [
      decoded.account.mail_address,
    ]);
    if (!account[0]) {
      return socket.disconnect(true);
    }
    if (decoded.account.password !== account[0].password)
      return socket.disconnect(true);
    socket.bearer = account[0];

    console.log(account[0].name, "is online now.");
    if (!onlineUsers.includes(account[0].id)) {
      onlineUsers.push(account[0].id);
    }
    console.log("onlineUsers:", onlineUsers);
    socket.on("disconnect", async () => {
      console.log(account[0].name, "is offline now.");
      onlineUsers.remove(account[0].id);
      console.log("onlineUsers: ", onlineUsers);
    });

    socket.on("request sync", (liveID) => {
      io.to(`live room ${liveID}`).emit("client request sync");
    });

    socket.on("sync", async (currentTime, liveID) => {
      io.to(`live room ${liveID}`).emit("client sync", currentTime);
    });

    socket.on("join live", async (liveID) => {
      let live = await query("SELECT * FROM lives WHERE lives.id = ?", [
        liveID,
      ]);
      if (live.poster_id === socket.bearer.id) {
        if (!lives[liveID]) {
          lives[liveID] = {
            active: false,
            playing: "nothing",
            watching: [socket.bearer.id],
          };
        }
      } else {
        if (!lives[liveID]) {
          lives[liveID] = {
            active: false,
            playing: "nothing",
            watching: [socket.bearer.id],
          };
        } else {
          lives[liveID].watching.push(socket.bearer.id);
        }
      }
      //console.log(socket.bearer.name, "has joined", liveID, lives);
      io.to(`live room ${liveID}`).emit(
        "joined live",
        liveID,
        socket.bearer.id,
        socket.bearer.name,
        socket.bearer.username
      );
      socket.join(`live room ${liveID}`);
    });

    socket.on("left live", async (liveID) => {
      if (lives[liveID]) {
        lives[liveID].watching.remove(socket.bearer.id);

        io.to(`live room ${liveID}`).emit(
          "left live",
          liveID,
          socket.bearer.id
        );
      }
      console.log("Left room", liveID, lives);
      socket.leave(`live room ${liveID}`);
    });
  });

  router.get("/members", async (req, res) => {
    try {
      const users = await query(
        "SELECT id, name, username, date_joined FROM users"
      );
      let onlineStatus = [];
      for (let i = 0; i < users.length; i++) {
        if (onlineUsers.includes(users[i].id)) {
          onlineStatus.push(true);
        } else {
          onlineStatus.push(false);
        }
      }
      return res.send({ users: users, message: onlineStatus });
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/live/changeLikeStatus", async (req, res) => {
    try {
      const likesCount = await query(
        "SELECT COUNT(*) AS 'count' FROM livelikes WHERE user_id = ? AND live_id = ?",
        [res.locals.account.id, req.body.id]
      );
      const likesCountTotal = await query(
        "SELECT COUNT(*) AS 'count' FROM livelikes WHERE live_id = ?",
        [req.body.id]
      );
      const userInfo = await query(
        "SELECT title, poster_id as 'posterID' FROM lives WHERE id = ?",
        [req.body.id]
      );
      const recieverInfo = await query(
        "SELECT fcm_token as 'token' FROM users WHERE id=?",
        [userInfo[0].posterID]
      );
      if (likesCount[0].count == 0) {
        io.to(`user ${userInfo[0].poster_id}`).emit(
          "notification",
          `${res.locals.account.name} has liked your live: ${userInfo[0].title}`,
          `/live/${req.body.id}`
        );
        var message = {
          notification: {
            title: "New Afroboost like",
            body: `${res.locals.account.name} has liked your live: ${userInfo[0].title}`,
          },
        };
        var options = {
          priority: "high",
          timeToLive: 60 * 60 * 48,
        };
        admin
          .messaging()
          .sendToDevice(recieverInfo[0].token, message, options)
          .then((response) => {
            // Response is a message ID string.
            console.log("Successfully sent message:", response);
          })
          .catch((error) => {
            console.log("Error sending message:", error);
          });
        await query("INSERT INTO livelikes (live_id, user_id) VALUES (?, ?)", [
          req.body.id,
          res.locals.account.id,
        ]);
        await query(
          "INSERT INTO notifications (text, user_id, link) VALUES (?, ?, ?)",
          [
            `${res.locals.account.name} has liked your live: ${userInfo[0].title}`,
            res.locals.account.id,
            `/live/${req.body.id}`,
          ]
        );
        return res.send({
          code: 200,
          message: likesCountTotal[0].count + 1,
          status: true,
        });
      } else {
        await query("DELETE FROM livelikes WHERE user_id = ? AND live_id = ?", [
          res.locals.account.id,
          req.body.id,
        ]);
        return res.send({
          code: 200,
          message: likesCountTotal[0].count - 1,
          status: false,
        });
      }
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/live", async (req, res) => {
    try {
      let result = await query(
        "INSERT INTO lives (title, countdown, description, currently_playing, poster_id) VALUES (?, ?, ?, ?, ?)",
        [
          "New Afroboost stream",
          new Date(),
          "No description provided.",
          0,
          res.locals.account.id,
        ]
      );
      console.log(result);
      fs.mkdirSync(path.join(__dirname, "live", result.insertId.toString()), {
        recursive: true,
      });
      return res.send(result);
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/live/thumbnail/upload", async (req, res) => {
    try {
      let file = req.files.file;
      let liveID = req.body.id;
      let extension = file.name.split(".").pop().toLowerCase();
      let result = await query("SELECT * FROM lives WHERE id = ?", [liveID]);
      console.log(result);
      if (
        result[0].poster_id === res.locals.account.id ||
        res.locals.account.id === 4
      ) {
        if (!["jpg", "png", "jpeg"].includes(extension.toLowerCase()))
          return res.sendStatus(403);
        file.mv(
          path.join(__dirname, "live", liveID, "thumbnail.jpg"),
          (err) => {
            if (err) throw err;
            return res.sendStatus(200);
          }
        );
      }
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.get("/onlineStatus/:username", async (req, res) => {
    try {
      const userID = await query(
        "SELECT id FROM users WHERE LOWER(username) = ? ",
        [req.params.username]
      );
      if (onlineUsers.includes(userID[0].id)) {
        return res.send({ status: 200, message: "online" });
      }
      return res.send({ status: 200, message: "offline" });
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });


  router.post("/live/play", async (req, res) => {
    try {
      let liveID = req.body.id;
      let result = await query("SELECT * FROM lives WHERE id = ?", [liveID]);
      if (
        result[0].poster_id === res.locals.account.id ||
        res.locals.account.id === 4
      ) {
        if (!lives[liveID].snapshot) {
          return res.sendStatus(403);
        }
        lives[liveID].playing = lives[liveID].snapshot;
        lives[liveID].snapshot = undefined;
        console.log(lives[liveID].playing);
        let extension = lives[liveID].playing.split(".").pop();
        let filetype = undefined;
        if (["jpg", "png", "jpeg"].includes(extension.toLowerCase()))
          filetype = "image";
        if (["mp4", "mov", "flv"].includes(extension.toLowerCase()))
          filetype = "video";
        if (["mp3", "ogg", "wav"].includes(extension.toLowerCase()))
          filetype = "audio";

        io.to(`live room ${liveID}`).emit(
          "playing",
          filetype,
          lives[liveID].playing,
          lives[liveID].watching.length
        );
        console.log(lives[liveID]);
        return res.sendStatus(200);
      }
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/live/pause", async (req, res) => {
    try {
      let liveID = req.body.id;
      let result = await query("SELECT * FROM lives WHERE id = ?", [liveID]);
      if (
        result[0].poster_id === res.locals.account.id ||
        res.locals.account.id === 4
      ) {
        lives[liveID].snapshot = lives[liveID].playing;
        lives[liveID].playing = "nothing";
        console.log(lives[liveID]);
        io.to(`live room ${liveID}`).emit("paused");
      }
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/live/upload", async (req, res) => {
    try {
      let file = req.files.file;
      let liveID = req.body.id;
      let extension = file.name.split(".").pop().toLowerCase();
      let result = await query("SELECT * FROM lives WHERE id = ?", [liveID]);
      console.log(result);
      if (
        result[0].poster_id === res.locals.account.id ||
        res.locals.account.id === 4
      ) {
        let filetype = undefined;
        if (["jpg", "png", "jpeg"].includes(extension.toLowerCase()))
          filetype = "image";
        if (["mp4", "mov", "flv"].includes(extension.toLowerCase()))
          filetype = "video";
        if (["mp3", "ogg", "wav"].includes(extension.toLowerCase()))
          filetype = "audio";
        if (!filetype) return res.sendStatus(403);
        let filepath = path.join(
          __dirname,
          "live",
          liveID,
          liveID + "." + extension
        );
        file.mv(filepath, (err) => {
          if (err) throw err;
          if (!lives[liveID]) {
            lives[liveID] = {
              active: false,
              playing: "nothing",
              watching: [socket.bearer.id],
            };
          }
          lives[liveID].playing = path.join(liveID, liveID + "." + extension);

          io.to(`live room ${liveID}`).emit(
            "playing",
            filetype,
            lives[liveID].playing,
            lives[liveID].watching.length
          );
          return res.sendStatus(200);
        });
      }
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.get("/live/:id", async (req, res) => {
    try {
      let result = await query("SELECT * FROM lives WHERE id = ?", [
        req.params.id,
      ]);
      let paid = await query(
        "SELECT * FROM subscriptions WHERE buyer_id = ? AND live_id = ?",
        [res.locals.account.id, req.params.id]
      );
      let likes = await query(
        "SELECT COUNT(*) as 'count' FROM livelikes WHERE live_id = ?",
        [req.params.id]
      );
      let liked = await query(
        "SELECT COUNT(*) as 'count' FROM livelikes WHERE live_id = ? AND user_id = ?",
        [req.params.id, res.locals.account.id]
      );
      console.log(lives);

      return res.send({
        sql: result[0],
        likes: likes[0].count,
        liked: liked[0].count == 1,
        js: lives[req.params.id],
        paid:
          !result[0].price ||
            paid[0] ||
            result[0].poster_id === res.locals.account.id
            ? true
            : false,
      });
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/live/setname", async (req, res) => {
    try {
      const posts = await query("SELECT * FROM lives WHERE id = ?", [
        req.body.id,
      ]);
      if (
        posts[0].poster_id === res.locals.account.id ||
        res.locals.account.id === 4
      ) {
        await query(
          "UPDATE lives SET title = ?, description = ? WHERE id = ?",
          [req.body.title, req.body.description, req.body.id]
        );
        return res.sendStatus(200);
      }
      return res.sendStatus(403);
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/live/buy", async (req, res) => {
    try {
      const posts = await query("SELECT * FROM lives WHERE id = ?", [
        req.body.id,
      ]);
      let price = posts[0].price;
      const users = await query("SELECT * FROM users WHERE id = ?", [
        res.locals.account.id,
      ]);
      if (!price) return res.sendStatus(403);
      if (users[0].balance >= price) {
        let configuredPrice = (percentage / 100) * price;
        await query(
          "INSERT INTO subscriptions (buyer_id, live_id, timestamp) VALUES (?, ?, ?)",
          [res.locals.account.id, req.body.id, new Date()]
        );
        await query("UPDATE users SET balance = balance - ? WHERE id = ?", [
          price,
          res.locals.account.id,
        ]);
        await query("UPDATE users SET balance = balance + ? WHERE id = ?", [
          configuredPrice,
          posts[0].poster_id,
        ]);
        return res.sendStatus(200);
      }
      return res.sendStatus(405);
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/live/setprice", async (req, res) => {
    try {
      const posts = await query("SELECT * FROM lives WHERE id = ?", [
        req.body.id,
      ]);
      let price = req.body.price;
      if (!price) return res.sendStatus(403);
      if (price < 0) price = 0;
      if (
        posts[0].poster_id === res.locals.account.id ||
        res.locals.account.id === 4
      ) {
        await query("UPDATE lives SET price = ? WHERE id = ?", [
          req.body.price,
          req.body.id,
        ]);
        return res.sendStatus(200);
      }
      return res.sendStatus(403);
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/live/remove", async (req, res) => {
    console.log("Reach /live/remove")

    try {
      const posts = await query("SELECT * FROM lives WHERE id = ?", [
        req.body.id,
      ]);
      if (
        posts[0].poster_id === res.locals.account.id ||
        res.locals.account.id === 4
      ) {
        await query("DELETE FROM lives WHERE id = ?", [req.body.id]);
        return res.sendStatus(200);
      }
      return res.sendStatus(403);
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/live/setevent", async (req, res) => {
    console.log("Bhai hum live/setevent may aaah gay hain")
    try {
      const posts = await query("SELECT * FROM lives WHERE id = ?", [
        req.body.id,
      ]);
      if (
        posts[0].poster_id === res.locals.account.id ||
        res.locals.account.id === 4
      ) {
        await query("UPDATE lives SET countdown = ? WHERE id = ?", [
          req.body.timestamp,
          req.body.id,
        ]);
        return res.sendStatus(200);
      }
      return res.sendStatus(403);
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.get("/live", async (req, res) => {
    try {
      let lives = await query(
        "SELECT lives.id, lives.poster_id, lives.title, lives.description, lives.countdown, lives.price, users.name FROM lives, users WHERE users.id = lives.poster_id"
      );
      let subscriptions = await query(
        "SELECT lives.id, lives.poster_id, lives.title, lives.description, lives.countdown, lives.price, users.name FROM lives, subscriptions, users WHERE subscriptions.live_id = lives.id AND subscriptions.buyer_id = ? AND users.id = lives.poster_id",
        [res.locals.account.id]
      );
      return res.send({
        lives: lives.reverse(),
        subscriptions: subscriptions,
      });
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.get("/");

  router.get("/boostprice", (req, res) => {
    return res.send({ price: boostPrice });
  });

  router.post("/comments", async (req, res) => {
    try {
      const comments = await query("SELECT * FROM comments WHERE post_id = ?", [
        req.body.id,
      ]);
      return res.send({ code: 200, message: comments });
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/removeComment", async (req, res) => {
    console.log("Remove comment");
    if (req.header("X-Auth-Token") === "guest") {
      return res.sendStatus(403);
    }
    try {
      const checkCreator = await query("SELECT * FROM comments WHERE id = ?", [
        req.body.id,
      ]);
      console.log("CC", checkCreator);
      if (checkCreator[0].user_id != res.locals.account.id)
        return res.sendStatus(403);
      await query("DELETE FROM comments WHERE id = ?", [req.body.id]);
      return res.sendStatus(200);
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/addComment", async (req, res) => {
    if (req.header("X-Auth-Token") === "guest") {
      return res.sendStatus(403);
    }
    try {
      const commentQuery = await query(
        "INSERT INTO comments (post_id, user_id, timestamp, comment) VALUES (?, ?, ?, ?)",
        [
          req.body.id,
          res.locals.account.id,
          new Date(),
          req.body.comment,
        ]
      );
      const comment = await query(
        "SELECT comments.id as 'commentID', comments.user_id as 'posterID', comments.comment, comments.timestamp, users.name as 'posterName', comments.parent_id as 'parentID' FROM comments JOIN users ON comments.user_id = users.id WHERE comments.id = ? AND comments.parent_id = NULL",
        [commentQuery.insertId]
      );
      const userInfo = await query(
        "SELECT posts.post_title, posts.poster_id, posts.id, users.name, users.fcm_token as 'token' FROM posts JOIN users ON posts.poster_id = users.id WHERE posts.id = ?",
        [req.body.id]
      );
      io.to(`user ${userInfo[0].poster_id}`).emit(
        "notification",
        `${res.locals.account.name} has commented on your post: ${userInfo[0].post_title}`,
        `/post/${userInfo[0].id}`
      );
      var message = {
        notification: {
          title: "New Afroboost comment",
          body: `${res.locals.account.name} has commented on your post: ${userInfo[0].post_title}`,
        },
      };
      var options = {
        priority: "high",
        timeToLive: 60 * 60 * 48,
      };
      admin
        .messaging()
        .sendToDevice(userInfo[0].token, message, options)
        .then((response) => {
          // Response is a message ID string.
          console.log("Successfully sent message:", response);
        })
        .catch((error) => {
          console.log("Error sending message:", error);
        });
      await query(
        "INSERT INTO notifications (text, user_id, link) VALUES (?, ?, ?)",
        [
          `${res.locals.account.name} has commented on your post: ${userInfo[0].post_title}`,
          userInfo[0].poster_id,
          `/post/${userInfo[0].id}`,
        ]
      );
      return res.send({ code: 200, message: comment[0] });
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/replyComment", async (req, res) => {
    try {
      const replyQuery = await query(
        "INSERT INTO comments (post_id, user_id, timestamp, comment, parent_id) VALUES (?,?,?,?,?)",
        [
          req.body.id,
          res.locals.account.id,
          new Date(),
          req.body.comment,
          req.body.parent_id,
        ]
      );
      const userInfo = await query(
        "SELECT post_title, poster_id as 'posterID', id FROM posts WHERE id = ?",
        [req.body.id]
      );
      const commentReply = await query(
        "SELECT comments.id as 'commentID', comments.user_id as 'posterID', comments.comment, comments.timestamp, comments.parent_id as 'parentID', users.name as 'posterName' FROM comments JOIN users ON comments.user_id = users.id WHERE comments.id = ?",
        [replyQuery.insertId]
      );
      const recieverInfo = await query(
        "SELECT fcm_token as 'token' FROM users WHERE id=?",
        [userInfo[0].posterID]
      );
      io.to(`user ${userInfo[0].poster_id}`).emit(
        "notification",
        `${res.locals.account.name} has replied on your post: ${userInfo[0].post_title}`,
        `/post/${userInfo[0].id}`
      );
      var message = {
        notification: {
          title: "New Afroboost reply",
          body: `${res.locals.account.name} has replied on your post: ${userInfo[0].post_title}`,
        },
      };
      var options = {
        priority: "high",
        timeToLive: 60 * 60 * 48,
      };
      admin
        .messaging()
        .sendToDevice(recieverInfo[0].token, message, options)
        .then((response) => {
          // Response is a message ID string.
          console.log("Successfully sent message:", response);
        })
        .catch((error) => {
          console.log("Error sending message:", error);
        });
      await query(
        "INSERT INTO notifications (text, user_id, link) VALUES (?, ?, ?)",
        [
          `${res.locals.account.name} has replied on your post: ${userInfo[0].post_title}`,
          userInfo[0].poster_id,
          `/post/${userInfo[0].id}`,
        ]
      );
      return res.send({ code: 200, message: commentReply[0] });
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/editComment", async (req, res) => {
    try {
      await query("UPDATE comments SET comment=? WHERE id=?", [
        req.body.comment,
        req.body.id,
      ]);
      return res.sendStatus(200);
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/changeLikeStatus", async (req, res) => {
    if (req.header("X-Auth-Token") === "guest") {
      return res.sendStatus(403);
    }
    try {
      const likesCount = await query(
        "SELECT COUNT(*) AS 'count' FROM likes WHERE user_id = ? AND post_id = ?",
        [res.locals.account.id, req.body.id]
      );
      const likesCountTotal = await query(
        "SELECT COUNT(*) AS 'count' FROM likes WHERE post_id = ?",
        [req.body.id]
      );
      const userInfo = await query(
        "SELECT post_title, poster_id FROM posts WHERE id = ?",
        [req.body.id]
      );
      const recieverInfo = await query(
        "SELECT fcm_token AS 'token' FROM users WHERE id=?",
        [userInfo[0].poster_id]
      );
      if (likesCount[0].count == 0) {
        io.to(`user ${userInfo[0].poster_id}`).emit(
          "notification",
          `${res.locals.account.name} has liked your post: ${userInfo[0].post_title}`,
          `/post/${req.body.id}`
        );
        var message = {
          notification: {
            title: "New Afroboost like",
            body: `${res.locals.account.name} has liked your post: ${userInfo[0].post_title}`,
          },
        };
        var options = {
          priority: "high",
          timeToLive: 60 * 60 * 48,
        };
        admin
          .messaging()
          .sendToDevice(recieverInfo[0].token, message, options)
          .then((response) => {
            // Response is a message ID string.
            console.log("Successfully sent message:", response);
          })
          .catch((error) => {
            console.log("Error sending message:", error);
          });
        await query("INSERT INTO likes (post_id, user_id) VALUES (?, ?)", [
          req.body.id,
          res.locals.account.id,
        ]);
        await query(
          "INSERT INTO notifications (text, user_id, link) VALUES (?, ?, ?)",
          [
            `${res.locals.account.name} has liked your post: ${userInfo[0].post_title}`,
            userInfo[0].poster_id,
            `/post/${req.body.id}`,
          ]
        );
        return res.send({
          code: 200,
          message: likesCountTotal[0].count + 1,
          status: true,
        });
      } else {
        await query("DELETE FROM likes WHERE user_id = ? AND post_id = ?", [
          res.locals.account.id,
          req.body.id,
        ]);
        return res.send({
          code: 200,
          message: likesCountTotal[0].count - 1,
          status: false,
        });
      }
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/liked", async (req, res) => {
    if (req.header("X-Auth-Token") === "guest") {
      return res.sendStatus(403);
    }
    try {
      const posts = await query(
        "SELECT posts.id as 'postID', posts.event_timestamp as 'postTimestamp', posts.poster_id as 'posterID', posts.post_type as 'postType', posts.post_title as 'postTitle', posts.post_price as 'postPrice', posts.post_category AS 'postCategory', posts.timestamp as 'postDate', posts.boosted as 'postBoosted', users.name as 'posterName', users.username as 'posterUsername' FROM likes JOIN posts ON posts.id = likes.post_id JOIN users ON posts.poster_id = users.id WHERE user_id = ?",
        [res.locals.account.id]
      );
      return res.send({ code: 200, message: posts });
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/library", async (req, res) => {
    if (req.header("X-Auth-Token") === "guest") {
      return res.sendStatus(403);
    }
    try {
      const posts = await query(
        "SELECT posts.id as 'postID', posts.event_timestamp as 'postTimestamp', posts.poster_id as 'posterID', posts.post_type as 'postType', posts.post_title as 'postTitle', posts.timestamp as startDate, posts.total_session as totalSession, posts.valididy, posts.post_price as 'postPrice', posts.post_category AS 'postCategory', posts.timestamp as 'postDate', posts.boosted as 'postBoosted', users.name as 'posterName', users.username as 'posterUsername' FROM library, posts, users WHERE posts.id = library.post_id AND posts.poster_id = users.id AND library.user_id = ?",
        [res.locals.account.id]
      );
      return res.send({ code: 200, message: posts });
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/feed", async (req, res) => {
    if (req.header("X-Auth-Token") === "guest") {
      return res.sendStatus(403);
    }
    try {
      const posts = await query(
        "SELECT posts.id as 'postID', posts.event_timestamp as 'postTimestamp', posts.poster_id as 'posterID', posts.post_type as 'postType', posts.post_title as 'postTitle', posts.post_price as 'postPrice', posts.post_category AS 'postCategory', posts.timestamp as 'postDate', posts.boosted as 'postBoosted', users.name as 'posterName', users.username as 'posterUsername' FROM posts JOIN users ON posts.poster_id = users.id WHERE LOWER(users.username) = ?",
        [req.body.username.toLowerCase()]
      );
      console.log(posts);
      return res.send({ code: 200, message: posts });
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/setevent", async (req, res) => {
    console.log("React to set event")
    console.log(req.body.timestamp)
    try {
      const posts = await query("SELECT * FROM posts WHERE id = ?", [
        req.body.id,
      ]);
      console.log(posts);
      console.log(posts[0].poster_id + " : " + res.locals.account.id)
      if (posts[0].poster_id == res.locals.account.id) {
        console.log("Yes correct user who try to add counter")
        await query("UPDATE posts SET event_timestamp = ? WHERE id = ?", [
          req.body.timestamp,
          req.body.id,
        ]);
        return res.sendStatus(200);
      }
      return res.sendStatus(403);
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/homepage", async (req, res) => {
    try {
      const posts = await query(
        "SELECT posts.id as 'postID', posts.poster_id as 'posterID', posts.event_timestamp as 'postTimestamp',posts.post_type as 'postType', posts.post_title as 'postTitle', posts.post_price as 'postPrice', posts.post_category AS 'postCategory', posts.timestamp as 'postDate', posts.boosted as 'postBoosted', users.name as 'posterName', users.username as 'posterUsername' FROM posts JOIN users ON posts.poster_id = users.id WHERE boosted = 1"
      );
      return res.send({ code: 200, message: posts });
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/refetch", async (req, res) => {
    // if (req.header("X-Auth-Token") === "guest") {
    //   return res.sendStatus(403);
    // }
    try {
      const postResult = await query(
        "SELECT posts.id as 'postID', posts.event_timestamp as 'postTimestamp', posts.sub_monthly as 'subMonthly', posts.sub_quarterly as 'subQuarterly', posts.sub_annual as 'subAnnual', posts.monthly_price as 'monthlyPrice', posts.quarterly_price as 'quarterlyPrice', posts.annual_price as 'annualPrice', posts.product_type as 'productType', posts.poster_id as 'posterID', posts.post_description AS 'postDescription', posts.post_type as 'postType', posts.post_title as 'postTitle', posts.post_price as 'postPrice', posts.post_category AS 'postCategory', posts.timestamp as 'postDate', posts.boosted as 'postBoosted', posts.timestamp as startDate, posts.total_session as totalSession, posts.valididy as valididy, users.name as 'posterName', users.username as 'posterUsername' FROM posts JOIN users ON posts.poster_id = users.id WHERE posts.id = ?",
        [req.body.id]
      );
      const likeCount = await query(
        "SELECT COUNT(*) FROM likes WHERE post_id = ?",
        [req.body.id]
      );
      const comments = await query(
        "SELECT comments.id as 'commentID', comments.user_id as 'posterID', comments.comment, comments.timestamp, users.name as 'posterName', comments.parent_id as 'parentID' FROM comments JOIN users ON comments.user_id = users.id WHERE post_id = ?",
        [req.body.id]
      );
      if (req.header("X-Auth-Token") !== "guest") {
        const saved = await query(
          "SELECT COUNT(*) FROM likes WHERE post_id = ? AND user_id = ?",
          [req.body.id, res.locals.account.id]
        );

        const liked = await query(
          "SELECT COUNT(*) FROM likes WHERE post_id = ? AND user_id = ?",
          [req.body.id, res.locals.account.id]
        );
        const library = await query(
          "SELECT COUNT(*) FROM library WHERE post_id = ? and user_id = ?",
          [req.body.id, res.locals.account.id]
        );
        if (library[0]["COUNT(*)"] === 0) postResult[0].paid = false;
        else postResult[0].paid = true;
        if (postResult[0].postPrice === 0) postResult[0].paid = true;

        if (postResult[0].posterID === res.locals.account.id)
          postResult[0].paid = true;
        if (postResult[0].productType === "merchandise") {
          postResult[0].paid = false;
        }
        postResult[0].likeCount = likeCount[0]["COUNT(*)"];
        postResult[0].comments = comments.reverse();
        postResult[0].saved = saved[0]["COUNT(*)"] === 1;
        postResult[0].liked = liked[0]["COUNT(*)"] === 1;
        if (res.locals.account.id == 4) postResult[0].paid = true;
        return res.send({ code: 200, message: postResult[0] });
      } else {
        postResult[0].paid = false;
        postResult[0].likeCount = likeCount[0]["COUNT(*)"];
        postResult[0].comments = comments.reverse();
        postResult[0].saved = false;
        postResult[0].liked = false;
        return res.send({ code: 200, message: postResult[0] })
      }
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/boost", async (req, res) => {
    if (req.header("X-Auth-Token") === "guest") {
      return res.sendStatus(403);
    }
    try {
      const postResult = await query("SELECT * FROM posts WHERE id = ?", [
        req.body.id,
      ]);
      const userBalance = await query("SELECT * FROM users WHERE id = ?", [
        res.locals.account.id,
      ]);
      console.log(userBalance[0].balance);
      console.log(res.locals.account.id);
      // if (userBalance[0].balance < boostPrice && res.locals.account.id != 4)
      if (res.locals.account.id != 4) {

        if (userBalance[0].balance < boostPrice)
          return res.send({ code: 405, message: "Insufficent funds." });
      }

      console.log('Details for couch')
      console.log(res.locals.account.id + " : " + postResult[0].poster_id);
      // if (
      //   res.locals.account.id !== postResult[0].poster_id
      //   && res.locals.account.id != 4
      // ) {
      //   return res.send({ code: 403, message: "Unauthorized2.0." });

      // }
      if (
        res.locals.account.id == postResult[0].poster_id

      ) {
        await query("UPDATE posts SET boosted = 1 WHERE id = ?", [req.body.id]);
        if (res.locals.account.id != 4)
          await query("UPDATE users SET balance = balance - ? WHERE id = ?", [
            boostPrice,
            res.locals.account.id,
          ]);
        return res.sendStatus(200);
      }
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/buy", async (req, res) => {
    if (req.header("X-Auth-Token") === "guest") {
      return res.sendStatus(403);
    }

    try {
      if (res.locals.account.id == 4) {
        try {
          const postResult = await query("SELECT * FROM posts WHERE id = ?", [
            req.body.id,
          ]);
          // if (postResult[0].post_price === 0) return res.sendStatus(405);
          const user = await query("SELECT * FROM users WHERE id = ?", [
            res.locals.account.id,
          ]);

          console.log(user[0].balance, postResult[0].post_price);
          // if (user[0].balance < postResult[0].post_price)
          //   return res.status(405).send({ message: "No sufficient founds" });

          if (req.body.additional_tag) { // Merchandise

            // if (user[0].balance < postResult[0].post_price * parseInt(req.body.quantity))
            //   return res.status(405).send({ message: "No sufficient founds" });
            let subcriptionTag = req.body.additional_tag;
            const subPrice = await query(
              `SELECT ${subcriptionTag} FROM posts WHERE id = ?`,
              [req.body.id]
            );
            // const subscriptionPrice = await query(
            //   "SELECT ? FROM posts WHERE id = ?",
            //   [req.body.additional_tag, req.body.id]
            // );

            let subscriptionPrice = postResult[0].post_price;
            if (req.body.quantity) {
              subscriptionPrice = subscriptionPrice * parseInt(req.body.quantity);
            }

            console.log("Paya price price:" + postResult[0].post_price);
            console.log(subPrice);
            if (postResult[0].post_price === 0) {
              subscriptionPrice = subPrice[0][subcriptionTag];

            }

            await query(
              "INSERT INTO library (post_id, user_id, additional_tag, value, date, quantity, total_session) VALUES (?, ?, ?, ?, ?, ?, ?)",
              [
                req.body.id,
                res.locals.account.id,
                req.body.additional_tag,
                subscriptionPrice,
                new Date(),
                req.body.quantity,
                req.body.total_session,
              ]
            );
            // await query("UPDATE users SET balance = balance - ? WHERE id = ?", [
            //   subscriptionPrice,
            //   res.locals.account.id,
            // ]);
            // let newPrice = subscriptionPrice * (percentage / 100);
            // await query("UPDATE users SET balance = balance + ? WHERE id = ?", [
            //   newPrice,
            //   postResult[0].poster_id,
            // ]);
            const recieverInfo = await query(
              "SELECT fcm_token as 'token' FROM users WHERE id=?",
              [postResult[0].poster_id]
            );
            io.to(`user ${postResult[0].poster_id}`).emit(
              `notification`,
              `${res.locals.account.name} has bought your product. Click here and see Sold posts for more information.`,
              `/transfer`
            );
            var message = {
              notification: {
                title: "New Afroboost purchase",
                body: `${res.locals.account.name} has bought your product.`,
              },
            };
            var options = {
              priority: "high",
              timeToLive: 60 * 60 * 48,
            };
            // admin
            //   .messaging()
            //   .sendToDevice(recieverInfo[0].token, message, options)
            //   .then((response) => {
            //     // Response is a message ID string.
            //     console.log("Successfully sent message:", response);
            //   })
            //   .catch((error) => {
            //     console.log("Error sending message:", error);
            //   });
            await query(
              "INSERT INTO notifications (text, user_id, link) VALUES (?, ?, ?)",
              [
                `${res.locals.account.name} has bought your product. Click here and see Sold posts for more information.`,
                postResult[0].poster_id,
                `/transfer`,
              ]
            );
          } else {
            console.log("reach at query");
            const post_price = await query(
              `SELECT post_price FROM posts WHERE id = ?`,
              [req.body.id]
            );
            const postPrice = post_price[0]['post_price'];
            await query(
              "INSERT INTO library (post_id, user_id, value, date) VALUES (?, ?, ?, ?)",
              [
                req.body.id,
                res.locals.account.id,
                postPrice,
                new Date(),
              ]
            );
            await query("UPDATE users SET balance = balance - ? WHERE id = ?", [
              postResult[0].post_price,
              res.locals.account.id,
            ]);
            let newPrice = postResult[0].post_price * (percentage / 100);
            await query("UPDATE users SET balance = balance + ? WHERE id = ?", [
              newPrice,
              postResult[0].poster_id,
            ]);
            const recieverInfo = await query(
              "SELECT fcm_token as 'token' FROM users WHERE id=?",
              [postResult[0].poster_id]
            );
            io.to(`user ${postResult[0].poster_id}`).emit(
              `notification`,
              `${res.locals.account.name} has bought your product. Click here and see Sold posts for more information.`,
              `/transfer`
            );
            var message = {
              notification: {
                title: "New Afroboost purchase",
                body: `${res.locals.account.name} has bought your product.`,
              },
            };
            var options = {
              priority: "high",
              timeToLive: 60 * 60 * 48,
            };
            admin
              .messaging()
              .sendToDevice(recieverInfo[0].token, message, options)
              .then((response) => {
                // Response is a message ID string.
                console.log("Successfully sent message:", response);
              })
              .catch((error) => {
                console.log("Error sending message:", error);
              });
            await query(
              "INSERT INTO notifications (text, user_id, link) VALUES (?, ?, ?)",
              [
                `${res.locals.account.name} has bought your product. Click here and see Sold posts for more information.`,
                postResult[0].poster_id,
                `/transfer`,
              ]
            );
          }
          return res.sendStatus(200);
        } catch (error) {
          console.log(error);
          return res.sendStatus(500);
        }

      }

      const postResult = await query("SELECT * FROM posts WHERE id = ?", [
        req.body.id,
      ]);
      // if (postResult[0].post_price === 0) return res.sendStatus(405);
      const user = await query("SELECT * FROM users WHERE id = ?", [
        res.locals.account.id,
      ]);

      console.log(user[0].balance, postResult[0].post_price);
      if (user[0].balance < postResult[0].post_price)
        return res.status(405).send({ message: "No sufficient founds" });

      if (req.body.additional_tag) { // Merchandise

        if (user[0].balance < postResult[0].post_price * parseInt(req.body.quantity))
          return res.status(405).send({ message: "No sufficient founds" });
        let subcriptionTag = req.body.additional_tag;
        const subPrice = await query(
          `SELECT ${subcriptionTag} FROM posts WHERE id = ?`,
          [req.body.id]
        );
        // const subscriptionPrice = await query(
        //   "SELECT ? FROM posts WHERE id = ?",
        //   [req.body.additional_tag, req.body.id]
        // );

        let subscriptionPrice = postResult[0].post_price;
        if (req.body.quantity) {
          subscriptionPrice = subscriptionPrice * parseInt(req.body.quantity);
        }

        console.log("Paya price price:" + postResult[0].post_price);
        console.log(subPrice);
        if (postResult[0].post_price === 0) {
          subscriptionPrice = subPrice[0][subcriptionTag];

        }

        await query(
          "INSERT INTO library (post_id, user_id, additional_tag, value, date, quantity, total_session) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            req.body.id,
            res.locals.account.id,
            req.body.additional_tag,
            subscriptionPrice,
            new Date(),
            req.body.quantity,
            req.body.total_session,
          ]
        );
        await query("UPDATE users SET balance = balance - ? WHERE id = ?", [
          subscriptionPrice,
          res.locals.account.id,
        ]);
        let newPrice = subscriptionPrice * (percentage / 100);
        await query("UPDATE users SET balance = balance + ? WHERE id = ?", [
          newPrice,
          postResult[0].poster_id,
        ]);
        const recieverInfo = await query(
          "SELECT fcm_token as 'token' FROM users WHERE id=?",
          [postResult[0].poster_id]
        );
        io.to(`user ${postResult[0].poster_id}`).emit(
          `notification`,
          `${res.locals.account.name} has bought your product. Click here and see Sold posts for more information.`,
          `/transfer`
        );
        var message = {
          notification: {
            title: "New Afroboost purchase",
            body: `${res.locals.account.name} has bought your product.`,
          },
        };
        var options = {
          priority: "high",
          timeToLive: 60 * 60 * 48,
        };
        // admin
        //   .messaging()
        //   .sendToDevice(recieverInfo[0].token, message, options)
        //   .then((response) => {
        //     // Response is a message ID string.
        //     console.log("Successfully sent message:", response);
        //   })
        //   .catch((error) => {
        //     console.log("Error sending message:", error);
        //   });
        await query(
          "INSERT INTO notifications (text, user_id, link) VALUES (?, ?, ?)",
          [
            `${res.locals.account.name} has bought your product. Click here and see Sold posts for more information.`,
            postResult[0].poster_id,
            `/transfer`,
          ]
        );
      } else {
        console.log("reach at query");
        const post_price = await query(
          `SELECT post_price FROM posts WHERE id = ?`,
          [req.body.id]
        );
        const postPrice = post_price[0]['post_price'];
        await query(
          "INSERT INTO library (post_id, user_id, value, date) VALUES (?, ?, ?, ?)",
          [
            req.body.id,
            res.locals.account.id,
            postPrice,
            new Date(),
          ]
        );
        await query("UPDATE users SET balance = balance - ? WHERE id = ?", [
          postResult[0].post_price,
          res.locals.account.id,
        ]);
        let newPrice = postResult[0].post_price * (percentage / 100);
        await query("UPDATE users SET balance = balance + ? WHERE id = ?", [
          newPrice,
          postResult[0].poster_id,
        ]);
        const recieverInfo = await query(
          "SELECT fcm_token as 'token' FROM users WHERE id=?",
          [postResult[0].poster_id]
        );
        io.to(`user ${postResult[0].poster_id}`).emit(
          `notification`,
          `${res.locals.account.name} has bought your product. Click here and see Sold posts for more information.`,
          `/transfer`
        );
        var message = {
          notification: {
            title: "New Afroboost purchase",
            body: `${res.locals.account.name} has bought your product.`,
          },
        };
        var options = {
          priority: "high",
          timeToLive: 60 * 60 * 48,
        };
        admin
          .messaging()
          .sendToDevice(recieverInfo[0].token, message, options)
          .then((response) => {
            // Response is a message ID string.
            console.log("Successfully sent message:", response);
          })
          .catch((error) => {
            console.log("Error sending message:", error);
          });
        await query(
          "INSERT INTO notifications (text, user_id, link) VALUES (?, ?, ?)",
          [
            `${res.locals.account.name} has bought your product. Click here and see Sold posts for more information.`,
            postResult[0].poster_id,
            `/transfer`,
          ]
        );
      }
      return res.sendStatus(200);
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/edit", async (req, res) => {
    if (req.header("X-Auth-Token") === "guest") {
      return res.sendStatus(403);
    }
    try {
      const postResult = await query("SELECT * FROM posts WHERE id = ?", [
        req.body.id,
      ]);
      if (
        res.locals.account[0].id != postResult[0].id &&
        res.locals.account.id != 4
      )
        return res.send({ code: 403, message: "Unauthorized." });
      switch (req.body.deltaType) {
        case "title":
          await query("UPDATE posts SET post_title = ? WHERE id = ?", [
            req.body.delta,
            req.body.id,
          ]);
          return res.send({ code: 200, message: "Edit done." });
        case "description":
          await query("UPDATE posts SET posts_description = ? WHERE id = ?", [
            req.body.delta,
            req.body.id,
          ]);
          return res.send({ code: 200, message: "Edit done." });
        case "price":
          await query("UPDATE posts SET posts_price = ? WHERE id = ?", [
            req.body.delta,
            req.body.id,
          ]);
          return res.send({ code: 200, message: "Edit done." });
        default:
          return res.send({ code: 200, message: "Edit done." });
      }
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });
  router.post("/updatepost", async (req, res) => {
    console.log("Reach /updatepost")
    try {
      const post = await query("SELECT * FROM posts WHERE id = ?", [
        req.body.post_id,
      ]);
      console.log(post)
      if (post[0].post_type === "image") req.body.post_price = 0;
      if (
        res.locals.account.id == 4 ||
        res.locals.account.id == post[0].poster_id
      ) {
        console.log("Reach to query let see is it working or not")
        await query(
          "UPDATE posts SET post_title = IFNULL(?, 'Untitled video'), post_description = IFNULL(?, 'No description provided'), post_price = IFNULL(?, 0.0) WHERE id = ?",
          [
            req.body.post_title,
            req.body.post_description,
            parseFloat(Math.max(0, req.body.post_price).toString()),
            req.body.post_id,
          ]
        );
        return res.sendStatus(200);
      }
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/getMonthlyPrice", async (req, res) => {
    try {
      let monthlyPrice = await query(
        "SELECT monthly_price FROM posts WHERE id = ?",
        [req.body.id]
      );
      return res.send({ code: 200, message: monthlyPrice });
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.get("/delete/:id", async (req, res) => {
    console.log("Deleted.");
    try {
      const postResult = await query("SELECT * FROM posts WHERE id = ?", [
        req.params.id,
      ]);
      console.log(postResult);
      console.log(res.locals.account);
      console.log(req.params.id);
      if (
        res.locals.account.id != postResult[0].poster_id &&
        res.locals.account.id != 4
      )
        return res.send({ code: 403, message: "Unauthorized." });
      const dq = await query("DELETE FROM posts WHERE id = ?", [req.params.id]);
      console.log("DQ", dq);
      rimraf(
        __dirname + "/posts/" + req.params.id.toString() + "/",
        (error) => {
          if (error) throw error;
          console.log("done");
          return res.send({ code: 200, message: "Post removed successfully." });
        }
      );
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post('/deleteVoucher', async (req, res) => {
    if (req.header('X-Auth-Token') === 'guest') {
      return res.sendStatus(403);
    }

    try {
      const { voucherID } = req.body;

      // Read the voucher images from the appropriate destination folder
      const voucherFolder = path.join(__dirname, '/images', 'vouchers');
      fs.readdir(voucherFolder, (error, files) => {
        if (error) {
          console.error(error);
          return res.sendStatus(500);
        }

        // Find the voucher file that matches the voucher ID
        const matchingFile = files.find((file) => {
          const fileVoucherID = file.split('_')[0]; // Extract the voucher ID from the filename
          return fileVoucherID === voucherID;
        });

        if (matchingFile) {
          // Construct the file path for the voucher image
          const imagePath = path.join(voucherFolder, matchingFile);

          // Delete the file
          fs.unlinkSync(imagePath);

          // Delete the voucher record from the database
          query("DELETE FROM vouchers WHERE voucher_code = ?", [voucherID]);

          return res.sendStatus(200);
        } else {
          return res.status(404).json({ message: 'Voucher not found' });
        }
      });
    } catch (error) {
      console.error(error);
      return res.sendStatus(500);
    }
  });



  router.post('/uploadVoucher', async (req, res) => {
    if (req.header('X-Auth-Token') === 'guest') {
      return res.sendStatus(403);
    }

    try {
      if (!req.files || !req.files.uploadedFile) {
        return res.status(400).send('No voucher file uploaded');
      }

      let file = req.files.uploadedFile;
      let account = res.locals.account;

      // Generate a unique filename for each voucher
      const filename = `${req.body.voucherCode}_${Date.now()}.png`;

      // Move the file to the appropriate destination folder
      fs.mkdirSync(__dirname + '/images/vouchers/', { recursive: true });
      file.mv(__dirname + '/images/vouchers/' + filename, (error) => {
        if (error) {
          console.error(error);
          return res.sendStatus(500);
        }

        // Process and save the voucher image
        // ...

        return res.sendStatus(200);
      });
    } catch (error) {
      console.error(error);
      return res.sendStatus(500);
    }
  });





  router.post("/upload", async (req, res) => {
    if (req.header("X-Auth-Token") === "guest") {
      return res.sendStatus(403);
    } // https://www.youtube.com/watch?v=dQw4w9WgXcQ
    try {
      let file = req.files.uploadedFile;
      let file1 = req.files.uploadedFile1;
      let thumbnail = req.files.thumbnail;
      let files = [];
      let extensions = [
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      ];
      let multiupload = false;

      if (req.body.post_type == "merchandise") multiupload = true;

      let account = res.locals.account;
      let extension;

      if (multiupload) {
        ["1", "2", "3", "4", "5", "6"].map((item, index) => {
          if (req.files["uploadedFile" + item])
            (extensions[index] = req.files["uploadedFile" + item].name
              .split(".")
              .pop()
              .toLowerCase()),
              files.push(req.files["uploadedFile" + item]);
        });
        for (let index = 0; index < files.length; index++) {
          if (
            !["png", "jpg", "jpeg", "mp4", "flv", "avi"].includes(
              extensions[index].toLowerCase()
            )
          ) {
            return res.sendStatus(403);
          }
        }

        let result = await query(
          "INSERT INTO posts (poster_id, post_type, post_title, post_description, post_price, post_category, timestamp, boosted, product_type, sub_monthly, sub_quarterly, sub_annual, monthly_price, quarterly_price, annual_price, total_session, valididy, start_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            account.id,
            "merchandise",
            req.body.post_title,
            req.body.post_description,
            req.body.post_price || 0,
            req.body.post_category,
            new Date(),
            0,
            req.body.product_type,
            req.body.sub_monthly || '',
            req.body.sub_quarterly || '',
            req.body.sub_annual || '',
            req.body.monthly_price || 0,
            req.body.quarterly_price || 0,
            req.body.annual_price || 0,
            req.body.total_session || 0, // Add the value for total_session
            req.body.validity || 0,  // Add the value for validity
            new Date(), // Add the value for start_date
          ]
        );


        fs.mkdirSync(__dirname + "/posts/" + result.insertId.toString() + "/", {
          recursive: true,
        });

        for (let index = 0; index < files.length; index++) {
          if (!index && ["mp4", "avi", "flv"].includes(extensions[index])) {
            files[index].mv(
              __dirname +
              "/posts/" +
              result.insertId.toString() +
              "/" +
              index.toString() +
              "-" +
              result.insertId.toString() +
              "." +
              extensions[index],
              (error) => {
                if (error) {
                  throw error;
                }
                ffmpeg(
                  __dirname +
                  "/posts/" +
                  result.insertId.toString() +
                  "/" +
                  index.toString() +
                  "-" +
                  result.insertId.toString() +
                  "." +
                  extensions[index]
                )
                  .setFfmpegPath(ffmpegPath)
                  .screenshots({
                    timestamps: [4],
                    filename: "thumbnail.png",
                    folder:
                      __dirname + "/posts/" + result.insertId.toString() + "/",
                  })
                  .on("end", function () {
                    if (thumbnail) {
                      thumbnail.mv(
                        __dirname +
                        "/posts/" +
                        result.insertId.toString() +
                        "/thumbnail.png",
                        (error) => {
                          if (error) throw error;
                        }
                      );
                    }
                  });
              }
            );
          }
          //images
          files[index].mv(
            __dirname +
            "/posts/" +
            result.insertId.toString() +
            "/" +
            index.toString() +
            "-" +
            result.insertId.toString() +
            "." +
            extensions[index],
            (error) => {
              if (error) throw error;
              if (thumbnail && !index) {
                thumbnail.mv(
                  __dirname +
                  "/posts/" +
                  result.insertId.toString() +
                  "/thumbnail.png",
                  (error) => {
                    if (error) throw error;
                  }
                );
              }
            }
          );
        }
        return res.sendStatus(200);
      } else {
        console.log("FILE: ", file);
        if (file) {
          console.log("FILE: ", file);
          extension = file.name.split(".").pop().toLowerCase();
        }
        if (["jpg", "png", "jpeg"].includes(extension)) {
          let result = await query(
            "INSERT INTO posts (poster_id, post_type, post_title, post_description, post_price, post_category, timestamp, boosted, product_type, sub_monthly, sub_quarterly, sub_annual, monthly_price, quarterly_price, annual_price, total_session, valididy, start_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
              account.id,
              "image",
              req.body.post_title,
              req.body.post_description,
              req.body.post_price,
              req.body.post_category,
              new Date(),
              0,
              req.body.post_category,
              req.body.sub_monthly ?? '',
              req.body.sub_quarterly ?? '',
              req.body.sub_annual ?? '',
              req.body.monthly_price ?? 0,
              req.body.quarterly_price ?? 0,
              req.body.annual_price ?? 0,
              req.body.total_session || 0,
              req.body.validity || 0,  // Add the value for valididy
              new Date(), // Add the current date for start_date
            ]
          );

          fs.mkdirSync(
            __dirname + "/posts/" + result.insertId.toString() + "/",
            {
              recursive: true,
            }
          );
          file.mv(
            __dirname +
            "/posts/" +
            result.insertId.toString() +
            "/" +
            result.insertId.toString() +
            "." +
            extension,
            (error) => {
              if (error) throw error;
              if (thumbnail) {
                thumbnail.mv(
                  __dirname +
                  "/posts/" +
                  result.insertId.toString() +
                  "/thumbnail.png",
                  (error) => {
                    if (error) throw error;
                  }
                );
              }
              return res.send({ code: 200, message: "Upload successful" });
            }
          );
        } else if (["mp4", "flv", "avi"].includes(extension)) {
          console.log("bro product type check kr " + req.body)
          let result = await query(
            "INSERT INTO posts (poster_id, post_type, post_title, post_description, post_price, post_category, timestamp, boosted, product_type, sub_monthly, sub_quarterly, sub_annual, monthly_price, quarterly_price, annual_price, total_session, valididy, start_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
              account.id,
              "video",
              req.body.post_title,
              req.body.post_description,
              req.body.post_price,
              req.body.post_category,
              new Date(),
              0,
              req.body.post_category,
              req.body.sub_monthly ?? '',
              req.body.sub_quarterly ?? '',
              req.body.sub_annual ?? '',
              req.body.monthly_price ?? 0,
              req.body.quarterly_price ?? 0,
              req.body.annual_price ?? 0,
              req.body.total_session || 0,
              req.body.validity || 0,  // Add the value for valididy
              new Date(), // Add the current date for start_date
            ]
          );

          fs.mkdirSync(
            __dirname + "/posts/" + result.insertId.toString() + "/",
            {
              recursive: true,
            }
          );
          file.mv(
            __dirname +
            "/posts/" +
            result.insertId.toString() +
            "/" +
            result.insertId.toString() +
            "." +
            extension,
            (error) => {
              if (error) throw error;
              ffmpeg(
                __dirname +
                "/posts/" +
                result.insertId.toString() +
                "/" +
                result.insertId.toString() +
                "." +
                extension
              )
                .setStartTime("00:00:00")
                .setDuration(10)
                .output(
                  __dirname +
                  "/posts/" +
                  result.insertId.toString() +
                  "/" +
                  "preview-" +
                  result.insertId.toString() +
                  "." +
                  extension
                )
                .on("end", function (err) {
                  if (err) throw err;
                  ffmpeg(
                    __dirname +
                    "/posts/" +
                    result.insertId.toString() +
                    "/" +
                    result.insertId.toString() +
                    "." +
                    extension
                  )
                    .setFfmpegPath(ffmpegPath)
                    .screenshots({
                      timestamps: [4],
                      filename: "thumbnail.png",
                      folder:
                        __dirname +
                        "/posts/" +
                        result.insertId.toString() +
                        "/",
                    })
                    .on("end", function () {
                      if (thumbnail) {
                        thumbnail.mv(
                          __dirname +
                          "/posts/" +
                          result.insertId.toString() +
                          "/thumbnail.png",
                          (error) => {
                            if (error) throw error;
                          }
                        );
                      }
                      return res.send({
                        code: 200,
                        message: "Upload successful",
                      });
                    });
                })
                .on("error", function (err) {
                  if (err) throw err;
                  if (thumbnail) {
                    thumbnail.mv(
                      __dirname +
                      "/posts/" +
                      result.insertId.toString() +
                      "/thumbnail.png",
                      (error) => {
                        if (error) throw error;
                      }
                    );
                  }
                })
                .run();
            }
          );
        } else if (["mp3"].includes(extension)) {
          let result = await query(
            "INSERT INTO posts (poster_id, post_type, post_title, post_description, post_price, post_category, timestamp, boosted,product_type,sub_monthly,sub_quarterly,sub_annual,monthly_price,quarterly_price,annual_price,total_session,valididy,start_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,?, ?, ?, ?, ?, ?, ?, ?,?)",
            [
              account.id,
              "audio",
              req.body.post_title,
              req.body.post_description,
              req.body.post_price,
              req.body.post_category,
              new Date(),
              0,
              req.body.post_category,
              req.body.sub_monthly ?? '',
              req.body.sub_quarterly ?? '',
              req.body.sub_annual ?? '',
              req.body.monthly_price ?? 0,
              req.body.quarterly_price ?? 0,
              req.body.annual_price ?? 0,
              req.body.total_session || 0,
              req.body.validity || 0,  // Add the value for valididy
              new Date(),
            ]
          );
          fs.mkdirSync(
            __dirname + "/posts/" + result.insertId.toString() + "/",
            {
              recursive: true,
            }
          );
          file.mv(
            __dirname +
            "/posts/" +
            result.insertId.toString() +
            "/" +
            result.insertId.toString() +
            "." +
            extension,
            (error) => {
              if (error) throw error;
              ffmpeg(
                __dirname +
                "/posts/" +
                result.insertId.toString() +
                "/" +
                result.insertId.toString() +
                "." +
                extension
              )
                .setStartTime("00:00:00")
                .setDuration(10)
                .output(
                  __dirname +
                  "/posts/" +
                  result.insertId.toString() +
                  "/" +
                  "preview-" +
                  result.insertId.toString() +
                  "." +
                  extension
                )
                .on("end", function (err) {
                  if (err) throw err;

                  if (!multiupload && file1) console.log(file1);
                  file1 = thumbnail;
                  if (file1) {
                    file1.mv(
                      __dirname +
                      "/posts/" +
                      result.insertId.toString() +
                      "/" +
                      result.insertId.toString() +
                      "." +
                      file1.name.split(".").pop().toLowerCase(),
                      (error) => {
                        if (error) throw error;
                      }
                    );
                  }




                  return res.send({ code: 200, message: "Upload successful" });
                })
                .on("error", function (err) {
                  if (err) throw err;
                  if (thumbnail) {
                    thumbnail.mv(
                      __dirname +
                      "/posts/" +
                      result.insertId.toString() +
                      "/thumbnail.png",
                      (error) => {
                        if (error) throw error;
                      }
                    );
                  }
                })
                .run();
            }
          );
        } else {
          return res.send({ code: 405, message: "Unsupported format." });
        }
      }
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/uploadLoginContent", async (req, res) => {
    if (res.locals.account.id != 4) return res.sendStatus(403);
    let file = req.files.login_video;
    let extension = file.name.split(".").pop().toLowerCase();
    if (extension !== "mp4") return res.sendStatus(405);
    try {
      file.mv(__dirname + "/afroboost.mp4", (err) => {
        return res.sendStatus(200);
      });
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/uploadHomeBanner", async (req, res) => {
    if (res.locals.account.id != 4) return res.sendStatus(403);
    try {
      //set banner from default banner
      if (req.body.mode == "oldDefault") {
        fs.copyFile(
          __dirname + "/temp/defaultbanner.png",
          __dirname + "/afroboostbanner.png",
          (err) => {
            console.log(err);
          }
        );
      }
      //set new default banner and set banner
      else if (req.body.mode == "default") {
        let defaultFile = req.files.default_banner;
        let extension2 = defaultFile.name.split(".").pop().toLowerCase();
        if (extension2 !== "png") res.sendStatus(405);
        defaultFile.mv(__dirname + "/temp/defaultbanner.png", (err) => {
          console.log(err);
        });
        fs.copyFile(
          __dirname + "/temp/defaultbanner.png",
          __dirname + "/afroboostbanner.png",
          (err) => {
            console.log(err);
          }
        );
      }
      //set new banner
      else if (req.body.mode == "new") {
        let file = req.files.home_banner;
        let extension = file.name.split(".").pop().toLowerCase();
        if (extension !== "png") res.sendStatus(405);
        file.mv(__dirname + "/afroboostbanner.png", (err) => {
          console.log(err);
        });
      }
      return res.sendStatus(200);
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  });

  router.post("/setAboutUsPost", async (req, res) => {
    if (res.locals.account.id != 4) return res.sendStatus(403);
    try {
      await query(
        "UPDATE variables SET connect_id=? WHERE name=? AND origin_table=?",
        [req.body.id, "about_us", "posts"]
      );
      return res.sendStatus(200);
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.get("/getAboutUsPost", async (req, res) => {
    try {
      const data = await query(
        "SELECT connect_id FROM variables WHERE name=? AND origin_table=?",
        ["about_us", "posts"]
      );
      return res.send({ code: 200, message: data[0].connect_id });
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/setTermsFile", async (req, res) => {
    try {
      let file = req.files.uploadedFile;
      file.mv(__dirname + "/terms.pdf", (error) => {
        if (error) throw error;
      });
      return res.sendStatus(200);
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.get("/getRecommended", async (req, res) => {
    try {
      let maxNumAll = await query("SELECT COUNT(*) as 'number' FROM posts");
      let maxNumMerch = await query(
        "SELECT COUNT(*) as 'number' FROM posts WHERE post_category = 'merch'"
      );
      let merch = await query(
        "SELECT posts.id as 'postID', posts.post_title as 'postTitle', posts.post_price as 'postPrice', users.name as 'posterName', posts.poster_id as 'posterID', posts.timestamp as 'postDate', posts.boosted as 'postBoosted' FROM posts JOIN users ON users.id = posts.poster_id WHERE posts.post_category = 'merchandise'"
      );
      merch = merch.slice(maxNumMerch[0].number - 9);
      let all = await query(
        "SELECT posts.id as 'postID', posts.post_type AS 'postType', posts.post_title as 'postTitle', posts.post_price as 'postPrice', users.name as 'posterName', posts.poster_id as 'posterID', posts.timestamp as 'postDate', posts.boosted as 'postBoosted' FROM posts JOIN users ON users.id = posts.poster_id"
      );
      all = all.slice(maxNumAll[0].number - 9);
      return res.send({
        code: 200,
        message: merch.reverse(),
        message2: all.reverse(),
      });
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });





  cron.schedule('0 0 * * *', async () => {
    try {
      const originalValue = false;
      const defaultValue = null; // Change this to the default value if necessary

      // Reset qrstatus, session_date, session_time, and validation columns to their original values
      await query(
        'UPDATE library SET qrstatus = ?, session_date = ?, session_time = ?, validation = ?',
        [originalValue, defaultValue, defaultValue, originalValue]
      );

      console.log('Columns reset successful.');
      return res.send({ code: 200 });
    } catch (error) {
      console.error('Error resetting columns:', error);
      return res.sendStatus(500);
    }
  });



  router.get("/resetqrscan", async (req, res) => {
    console.log("React reset scan");

    if (req.header("X-Auth-Token") === "guest") {
      return res.sendStatus(403);
    }

    //if (req.header("X-Auth-Token") === "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50Ijp7ImlkIjo0LCJuYW1lIjoiTXVqdGFiYSBTaGFmaXF1ZSIsInVzZXJuYW1lIjoibXVqdGFiYSIsIm1haWxfYWRkcmVzcyI6Im11anRhYmFAZ21haWwuY29tIiwicGFzc3dvcmQiOiIkMmIkMTAkT1d5Y0xQbW9ZM0o2aSIsInBob25lX251bWJlciI6Iis5MjMwNDY1MTE2NTAiLCJiYWxhbmNlIjoyMDAzNywiYmlvZ3JhcGh5IjoiSSBhbSBkZXZlbG9wZXJcbiIsImRhdGVfam9pbmVkIjoiMjAyMy0wNi0yNFQxOTowMDowMC4wMDBaIiwiaXNfYmxvY2tlZCI6MCwibWVldGluZ19saW5rIjoiIiwiZmNtX3Rva2VuIjoiMSJ9LCJpYXQiOjE2OTAzOTM0MzF9.XzISe-BAlBWwy8SLqv0S2mxJ0-j_NYr4nthOqQ9T_o0") {

    try {
      const originalValue = false;
      const defaultValue = null; // Change this to the default value if necessary

      // Reset qrstatus, session_date, session_time, and validation columns to their original values
      await query(
        'UPDATE library SET qrstatus = ?, session_date = ?, session_time = ?, validation = ?',
        [originalValue, defaultValue, defaultValue, originalValue]
      );

      console.log('Columns reset successful.');
      return res.send({ code: 200 });
    } catch (error) {
      console.error('Error resetting columns:', error);
      return res.sendStatus(500);
    }
    // }//
  });

  router.get("/qrscan/:scannerID", async (req, res) => {
    if (req.header("X-Auth-Token") === "guest") {
      return res.sendStatus(403);
    }

    try {

      const scannerID = req.params.scannerID
      const postResult = await query("SELECT * FROM posts WHERE poster_id = ?", [
        scannerID
      ]);

      let postsInLibrary = [];

      console.log(postResult);

      for (let i = 0; i < postResult.length; i++) {
        if (postResult[i].post_category === 'Sport') {
          const postInLibrary = await query(
            "SELECT * FROM library WHERE post_id = ? AND quantity > 0",
            [postResult[i].id]
          );
          if (postInLibrary.length > 0) {
            postsInLibrary.push(...postInLibrary);
          }
        }
      }

      for (let i = 0; i < postsInLibrary.length; i++) {
        // Calculate the new quantity after decrementing by one
        if (postsInLibrary[i].qrstatus == false) {

          const newQuantity = postsInLibrary[i].quantity - 1;

          // Update the quantity and set 'qrstatus' to true in a single query
          await query(
            "UPDATE library SET quantity = ?, qrstatus = ? WHERE id = ?",
            [newQuantity, 1, postsInLibrary[i].id]
          );

          // Update the 'quantity' and 'qrstatus' properties in the postsInLibrary array to reflect the changes
          postsInLibrary[i].quantity = newQuantity;
          postsInLibrary[i].qrstatus = 1;
        }
      }

      const data = 'QR scan is working'
      console.log(data);
      console.log(postsInLibrary);
      let onsessionsPosts = [];
      let onsessionsUsers = [];
      for (let x = 0; x < postsInLibrary.length; x++) {
        if (postsInLibrary[x].qrstatus == 1) {

          const user = await query("SELECT * FROM users WHERE id = ?", [
            postsInLibrary[x].user_id
          ]);

          onsessionsUsers.push(user[x]);
          const post = await query("SELECT * FROM posts WHERE id = ?", [
            postsInLibrary[x].post_id
          ]);
          onsessionsPosts.push(post[x]);
        }
      }
      return res.send({ code: 200, results: postsInLibrary, users: onsessionsUsers, posts: onsessionsPosts });
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/varify_session/:couchId", async (req, res) => {
    if (req.header("X-Auth-Token") === "guest") {
      return res.sendStatus(403);
    }
    const couchId = req.params.couchId;
    const { sessiondate, sessiontimezone } = req.body;
    try {
      const postResult = await query("Select * from posts where poster_id=?", [
        couchId
      ]);
      if (postResult.length > 0) {
        console.log("Result Ah giya");
        console.log(postResult);
        for (let i = 0; i < postResult.length; i++) {
          const sessionResult = await query(
            "UPDATE `library` SET `session_date`=?,`session_time`=? WHERE post_id=?",
            [sessiondate, sessiontimezone, postResult[i].id]
          );
        }
      }


      return res.sendStatus(200);


    } catch (error) {
      console.log(error);
      return res.sendStatus(500)

    }

    req.body.dataToSend
    return res.sendStatus(200)

  });



  router.get("/validateSession/:libraryId", async (req, res) => {
    if (req.header("X-Auth-Token") === "guest") {
      return res.sendStatus(403);
    }
    try {

      const checkQuantity = await query(
        "SELECT  `quantity` FROM `library` WHERE id=?",
        [req.params.libraryId]
      )
      if (checkQuantity[0].quantity === 0) {
        return res.send({ code: 420, message: "Validation set to true for rows with session_time not NULL." });
      }


      const checkSessionTime = await query(
        "SELECT session_time FROM library WHERE id=?",
        [req.params.libraryId]
      )
      if (checkSessionTime[0].session_time != null) {
        const validateSession = await query(
          "UPDATE `library` SET `validation`=? WHERE id=?",
          [true, req.params.libraryId]
        );
        if (validateSession.affectedRows > 0) {
          return res.send({ code: 200, message: "Validation set to true for rows with session_time not NULL." });
        }
      } else {
        return res.send({ code: 404, message: "No rows were affected. Library ID not found or session_time is NULL." });
      }

    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.get("/checkUserIsCouch/:libraryId", async (req, res) => {
    if (req.header("X-Auth-Token") === "guest") {
      return res.sendStatus(403);
    }
    try {
      // console.log("This id is need to be somewhere");
      // console.log(req.params.libraryId);
      const userPosts = await query(
        "SELECT * FROM posts WHERE poster_id=? AND (post_category='Sport' OR product_type='Sport')",
        [req.params.libraryId]
      )

      if (userPosts.length <= 0) {
        // console.log("This is user dont have in posts")
        return res.sendStatus(500);
      }
      // const checkCouch = await query(
      //   "Select * from library where post_id=?",
      //   [userPosts[0].id]
      // )
      // console.log(checkCouch);
      // if (checkCouch.length > 0) {
      //   // console.log("This user is couch+++++++++++++++++++++++++++++++++++++++++")
      return res.sendStatus(200);
      // }
      // else {

      //   // console.log("This user is not couch+++++++++++++++++++++++++++++++++++++++")
      //   return res.sendStatus(500);
      // }


    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.get("/checkIsSessionAlreadyValidated/:libraryId", async (req, res) => {
    if (req.header("X-Auth-Token") === "guest") {
      return res.sendStatus(403);
    }
    try {

      const userPosts = await query(
        "SELECT * FROM posts WHERE poster_id=? AND post_category='Sport'",
        [req.params.libraryId]
      )
      if (userPosts.length <= 0) {
        console.log("This user dont have posts")
        return res.sendStatus(400);
      }
      else {
        let couchPost = [];
        for (let i = 0; i < userPosts.length; i++) {
          const checkpostinLibrary = await query(
            "SELECT * FROM library WHERE post_id=? AND session_time IS NULL",
            [userPosts[i].id]
          );
          if (checkpostinLibrary.length > 0) {
            console.log(checkpostinLibrary[0]);
            couchPost = checkpostinLibrary[0];
          }

        }

        console.log("------------------ couchPost---------");
        console.log(couchPost);
        const checkIsValidated = await query(
          "SELECT * FROM library WHERE id=? AND session_time IS NULL",
          [couchPost.id]
        );
        // console.log("Post Id is :" + userPosts[0].id)
        // console.log("Resulf from check checkIsSessionAlreadyValidated");
        console.log("CHeck is validated or not")
        console.log(checkIsValidated);
        if (checkIsValidated.length === 0) {
          console.log("This user already validated+++++++++");
          return res.sendStatus(200);
        }
        else {
          console.log("This user dont have validated yet")
          return res.sendStatus(500);
        }
      }


    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.get("/todaySessionCheck/:libraryId", async (req, res) => {
    if (req.header("X-Auth-Token") === "guest") {
      return res.sendStatus(403);
    }
    try {
      console.log('================ Reach Today session check ===================')
      const userPosts = await query(
        "SELECT * FROM posts WHERE poster_id=? AND post_category='Sport'",
        [req.params.libraryId]
      )
      if (userPosts.length <= 0) {
        console.log("This user dont have posts")
        return res.sendStatus(400);
      }
      else {
        let couchPost = [];
        for (let i = 0; i < userPosts.length; i++) {
          console.log("Hello from for loop post id'" + userPosts[i].id)
          const checkpostinLibrary = await query(
            "SELECT * FROM library WHERE post_id=? AND (qrstatus is true OR qrstatus='1')",
            [userPosts[i].id]
          );
          if (checkpostinLibrary.length > 0) {
            console.log("Finally I found a post");
            console.log(checkpostinLibrary[0]);
            couchPost = checkpostinLibrary[0];
          }

        }

        console.log("------------------ couchPost FROM TODAY SESSION STATUS---------");
        console.log(couchPost);
        const checkIsValidated = await query(
          "SELECT * FROM library WHERE id=? AND (qrstatus is true OR qrstatus='1')",
          [couchPost.id]
        );
        // console.log("Post Id is :" + userPosts[0].id)
        // console.log("Resulf from check checkIsSessionAlreadyValidated");
        console.log("After again query")
        console.log(checkIsValidated);
        if (checkIsValidated.length === 0) {
          console.log("This user already started session+++++++++");
          return res.sendStatus(200);
        }
        else {
          console.log("This user not already started session+++++++++")
          return res.sendStatus(500);
        }
      }


    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });


  router.get("/showStudents/:libraryId", async (req, res) => {
    if (req.header("X-Auth-Token") === "guest") {
      return res.sendStatus(403);
    }
    try {
      const checkposts = await query(
        "SELECT * FROM posts WHERE poster_id=?",
        [req.params.libraryId]
      );

      console.log("User id is: " + req.params.libraryId);

      if (checkposts.length > 0) {
        // Extract the post IDs from the checkposts array
        const postIds = checkposts.map((post) => post.id);

        const getStudents = await query(
          "SELECT library.*, users.id AS studentId, users.username, users.name AS student_name FROM library LEFT JOIN users ON library.user_id = users.id WHERE library.post_id IN (?)",
          [postIds]
        );

        console.log(getStudents);

        if (getStudents.length > 0) {
          return res.send({ code: 200, students: getStudents });
        } else {
          return res.send({ code: 404, message: "No student found" });
        }
      } else {
        return res.send({ code: 404, message: "No posts found" });
      }
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.get('/startsession/:couchId', async (req, res) => {
    if (req.header("X-Auth-Token") === "guest") {
      return res.sendStatus(403);
    }

    try {
      const checkposts = await query(
        "SELECT * FROM posts WHERE poster_id=?",
        [req.params.couchId]
      );

      console.log("User id is: " + req.params.couchId);
      console.log(checkposts.length);

      if (checkposts.length > 0) {
        let updated = false;

        for (const post of checkposts) {
          const actualpost = await query(
            "SELECT * FROM library WHERE post_id = ? AND validation = 1", [post.id]
          );

          if (actualpost.length > 0) {
            // Access the properties using index 0
            const postToUpdate = actualpost[0];

            const updateQrStatus = await query(
              "UPDATE library SET qrstatus = true, validation = false, quantity = ?  WHERE id = ? ",
              [postToUpdate.quantity - 1, postToUpdate.id]
            );

            if (updateQrStatus.affectedRows > 0) {
              updated = true;
              console.log("Update qrStatus for post_id " + post.id + ": " + updateQrStatus.affectedRows);
            }
          }
        }

        if (updated) {
          console.log("QR status updated for at least one post with poster_id: " + req.params.couchId);
          return res.send({ code: 200, message: "QR status updated successfully" });
        } else {
          console.log("No user is validated yet for poster_id: " + req.params.couchId);
          return res.send({ code: 404, message: "No user is validated yet" });
        }
      } else {
        return res.send({ code: 404, message: "This user doesn't have any posts" });
      }
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });


  router.get('/checkStudents/:couchId', async (req, res) => {
    if (req.header("X-Auth-Token") === "guest") {
      return res.sendStatus(403);
    }

    try {
      const checkposts = await query(
        "SELECT * FROM posts WHERE poster_id=?",
        [req.params.couchId]
      );

      let haveStudent = false;
      for (let i = 0; i < checkposts.length; i++) {

        try {
          const isAnyoneRegistered = await query(
            "SELECT * FROM library WHERE post_id=?",
            [
              checkposts[i].id
            ]
          );

          if (isAnyoneRegistered.length > 0) {
            haveStudent = true;
            break; // No need to continue checking once a student is found
          }
        } catch (innerError) {
          console.error("Error in inner query:", innerError);
          return res.sendStatus(500);
        }
      }



      if (haveStudent == true) {
        res.sendStatus(200)
        console.log("Have student");
      }
      else {
        res.sendStatus(500)
        console.log("No student is found");
      }

    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });


  router.get("/checkLive/:userId", async (req, res) => {
    if (req.header("X-Auth-Token") === "guest") {
      return res.sendStatus(403);
    }
    try {
      const checkLive = await query(
        "SELECT * FROM lives WHERE poster_id=?",
        [req.params.userId]
      );


      if (checkLive.length > 0) {
        console.log("+================== Check Live ====================+")
        console.log(checkLive)

        return res.send({ code: 200, live: checkLive[0] });



        // if (getStudents.length > 0) {
        //   return res.send({ code: 200, students: getStudents });
        // } else {
        //   return res.send({ code: 404, message: "No student found" });
        // }
      } else {
        return res.send({ code: 404, message: "No live found" });
      }
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });







  return router;
};