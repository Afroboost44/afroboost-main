const axios = require("axios");
const fs = require("fs");
const fetch = require("node-fetch");

module.exports = (connection, io) => {
  const express = require("express");
  const util = require("util");
  const router = express.Router();
  const bcrypt = require("bcrypt");
  const nodemailer = require("nodemailer");
  const btoa = require("btoa");
  // const fs = require("fs");
  const jwt = require("jsonwebtoken");
  const fileUpload = require("express-fileupload");
  var voucher_codes = require("voucher-code-generator");

  var admin = require("firebase-admin");
  var app = admin.initializeApp();
  const query = util.promisify(connection.query).bind(connection);
  var encryptor = require("simple-encryptor")(
    "KoDskDmek4dfkEIdoDEMjddi4rdKFSakfia45odksdfskro43ikDKsei4l3sdkk3j4jewrsfjjfI4slfkfkDioIDkEJEjekFOFOf34olrkfdKFIifs"
  );
  var secret =
    "E9A6CA5C98ADC60C80EEE0E2A0069BF920FBB3C6ABE8C82EF3178F842323460D";
  /*
        id
        name
        username
        mail_address
        password
        phone_number
        balance
    */

  router.use(
    fileUpload({
      limits: { fileSize: 20 * 1024 * 1024 },
      responseOnLimit: { code: 407, message: "File limit exceeded." },
    })
  );

  router.use(async (req, res, next) => {
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

  io.on("connection", async (socket) => {
    const requester = socket.handshake.auth.token;
    var decoded = jwt.verify(requester, secret);
    const account = await query("SELECT * FROM users WHERE mail_address = ?", [
      decoded.account.mail_address,
    ]);
    if (!account[0]) {
      socket.disconnect(true);
    }
    if (decoded.account.password !== account[0].password)
      socket.disconnect(true);
    let socketBearer = account[0];
    console.log(socket.rooms);

    socket.on("connect to notifications", () => {
      socket.join(`user ${socketBearer.id}`);
      //console.log(socketBearer.name + " has joined notification channel.");
    });

    const checkThread = await query(
      "SELECT conversations.id as 'convid' FROM conversations WHERE thread_a = ? OR thread_b = ?",
      [socketBearer.id, socketBearer.id]
    );
    let total = checkThread;
    //console.log("total", total);
    for (let i = 0; i < total.length; i++) {
      socket.join(total[i].convid.toString());
      //console.log(socketBearer.name + " has joined ", total[i].convid);
    }

    socket.on("notify", (room) => {
      console.log(room, socketBearer.name);
      socket.broadcast.to(room).emit("notify", {
        room: room,
        who: socketBearer.name,
      });
    });
  });

  router.post("/metamessage", async (req, res) => {
    try {
      const checkThread = await query(
        "SELECT * FROM conversations WHERE id = ?",
        [req.body.threadID]
      );
      console.log(checkThread);
      if (checkThread[0]) {
        let messages = await query(
          "SELECT * FROM messages WHERE thread_prim_id = ? ORDER BY id DESC LIMIT 50",
          [req.body.threadID]
        );
        console.log(res.locals.account.id);
        if (
          checkThread[0].thread_a == res.locals.account.id ||
          checkThread[0].thread_b == res.locals.account.id
        ) {
          let user = undefined;
          if (checkThread[0].thread_a === res.locals.account.id) {
            user = await query(
              "SELECT users.name, users.id, users.username FROM users WHERE id = ?",
              [checkThread[0].thread_b]
            );
          }
          if (checkThread[0].thread_b === res.locals.account.id) {
            user = await query(
              "SELECT users.name, users.id, users.username FROM users WHERE id = ?",
              [checkThread[0].thread_a]
            );
          }
          checkThread[0].user = user;
          // for (let i = 0; i < messages.length; i++) {
          //   console.log("Before decryption:", messages[i].content);
          //   messages[i].content = encryptor.decrypt(messages[i].content);
          //   console.log("After decryption:", messages[i].content);
          // }
          return res.send({
            code: 200,
            message: messages,
            meta: checkThread[0],
          });
        } else return res.sendStatus(405);
      } else return res.sendStatus(404);
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });
  router.post("/setFCM", async (req, res) => {
    try {
      await query("UPDATE users SET fcm_token=? WHERE id=?", [
        req.body.fcmToken,
        res.locals.account.id,
      ]);
      let userData = await query("SELECT id, fcm_token FROM users WHERE id=?", [
        res.locals.account.id,
      ]);
      return res.send({ code: 200, message: userData[0] });
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });
  router.post("/sendfilemessage", async (req, res) => {
    try {
      const file = req.files.uploadedFile;
      let fprefix = "[file]|";
      if (["jpg", "png", "jpeg"].includes(file.name.split(".").pop())) {
        fprefix = "[img]|";
      }
      let messageContent =
        req.body.threadID +
        "," +
        res.locals.account.id.toString() +
        new Date().valueOf() +
        "." +
        file.name.split(".").pop();
      // await file.mv("/var/www/afroboost/server/images/uploads/" + messageContent);
      await file.mv("./images/uploads/" + messageContent);
      let finalContent = fprefix + messageContent;
      const checkThread = await query(
        "SELECT * FROM conversations WHERE id = ?",
        [req.body.threadID]
      );
      if (!checkThread[0]) return;
      const recieverID =
        checkThread[0].thread_a == res.locals.account.id
          ? checkThread[0].thread_b
          : checkThread[0].thread_a;
      const recieverInfo = await query(
        "SELECT users.name, users.fcm_token AS 'token' FROM users WHERE id = ?",
        [recieverID]
      );
      if (!recieverInfo[0] || !recieverInfo[0].token) {
        console.log("Invalid receiver information or missing FCM token");
        return res.sendStatus(400); // Or appropriate HTTP status code for the error
      }
      io.to(`user ${recieverID}`).emit(
        `notification`,
        `${res.locals.account.name} sent you a file message!`,
        `/chat/${req.body.threadID}`
      );
      var message = {
        notification: {
          title: "New Afroboost message!",
          body: `${res.locals.account.name} sent you a file message!`,
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
          console.log("Successfully sent message:", response);
        })
        .catch((error) => {
          console.log("Error sending message:", error);
        });
      await query(
        "INSERT INTO notifications (text, user_id, link) VALUES(?, ?, ?)",
        [
          `${res.locals.account.name} sent you a file message!`,
          recieverID,
          `/chat/${req.body.threadID}`,
        ]
      );
      const encrypted = encryptor.encrypt(finalContent);
      await query(
        "INSERT INTO messages (thread_prim_id, user_id, content, timestamp) VALUES (?, ?, ?, ?)",
        [
          req.body.threadID,
          res.locals.account.id,
          finalContent,
          new Date(),
        ]
      );
      return res.sendStatus(200);
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });


  router.post("/listmessages", async (req, res) => {
    try {
      const checkThread = await query(
        "SELECT conversations.id, conversations.thread_a, conversations.thread_b FROM conversations WHERE (thread_a = ? OR thread_b = ?) AND (thread_a <> thread_b)",
        [res.locals.account.id, res.locals.account.id]
      );
      let total = checkThread;
      console.log(total);

      for (let i = 0; i < total.length; i++) {
        let otherThread =
          res.locals.account.id === total[i].thread_a
            ? total[i].thread_b
            : total[i].thread_a;
        let user = await query(
          "SELECT users.id, users.name FROM users WHERE id = ?",
          [otherThread]
        );
        let lastMessage = await query(
          "SELECT messages.content FROM messages WHERE thread_prim_id = ? ORDER BY id DESC LIMIT 1",
          [total[i].id]
        );
        total[i].user = user[0];
        if (lastMessage[0])
          total[i].lastMessage = lastMessage[0].content;
      }
      return res.send({ code: 200, message: total });
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/gomessage", async (req, res) => {
    try {
      console.log("AC", res.locals.account.id);
      console.log("CA", req.body.targetID);
      const checkThread = await query(
        "SELECT * FROM conversations WHERE (thread_a = ? AND thread_b = ?) OR (thread_a = ? AND thread_b = ?)",
        [
          res.locals.account.id,
          req.body.targetID,
          req.body.targetID,
          res.locals.account.id,
        ]
      );
      if (checkThread[0]) {
        console.log(checkThread[0].id);
        return res.send({ code: 200, message: checkThread[0].id });
      } else {
        const newThread = await query(
          "INSERT INTO conversations (thread_a, thread_b) VALUES (?, ?)",
          [res.locals.account.id, req.body.targetID]
        );
        console.log(newThread);
        return res.send({ code: 200, message: newThread.insertId });
      }
    } catch (error) {
      console.error(error);
      return res.sendStatus(500);
    }
  });

  router.post("/sendmessage", async (req, res) => {
    try {
      const checkThread = await query(
        "SELECT * FROM conversations WHERE id = ?",
        [req.body.threadID]
      );
      if (!checkThread[0]) return;
      const recieverID =
        checkThread[0].thread_a == res.locals.account.id
          ? checkThread[0].thread_b
          : checkThread[0].thread_a;
      const recieverInfo = await query(
        "SELECT users.name, users.fcm_token AS 'token' FROM users WHERE id = ?",
        [recieverID]
      );
      io.to(`user ${recieverID}`).emit(
        `notification`,
        `${res.locals.account.name} sent you a message!`,
        `/chat/${req.body.threadID}`
      );
      if (recieverInfo[0].token) {
        var message = {
          notification: {
            title: "New Afroboost message!",
            body: `${res.locals.account.name} sent you a message!`,
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
            console.log("Successfully sent message:", response);
          })
          .catch((error) => {
            console.log("Error sending message:", error);
          });
      }

      await query(
        "INSERT INTO notifications (text, user_id, link) VALUES(?, ?, ?)",
        [
          `${res.locals.account.name} sent you a message!`,
          recieverID,
          `/chat/${req.body.threadID}`,
        ]
      );
      const encrypted = encryptor.encrypt(req.body.content);
      await query(
        "INSERT INTO messages (thread_prim_id, user_id, content, timestamp) VALUES (?, ?, ?, ?)",
        [
          req.body.threadID,
          res.locals.account.id,
          req.body.content,
          new Date(),
        ]
      );
      return res.sendStatus(200);
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  // "AUzmLyP11v7on8QS8-3zRCpDRFXLY5wfa5XlzRoz8MS5hRIeqg5x-YH7TOGs3Qd5wz0LSOX90OVuVCWf:EJi8f9ObnZgzx064MBITB6AzlnftFBFp7Oh0Utv7W3KI9MI1ES15thUISgSe9GMf4XqRAit29_63D5dJ"
  router.post("/transactionCallback", async (req, res) => {
    console.log("/reach to transaction call ")
    try {
      const request = await axios.get(req.body.transaction.links[0].href, {
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Basic " +
            btoa("AUzmLyP11v7on8QS8-3zRCpDRFXLY5wfa5XlzRoz8MS5hRIeqg5x-YH7TOGs3Qd5wz0LSOX90OVuVCWf:EJi8f9ObnZgzx064MBITB6AzlnftFBFp7Oh0Utv7W3KI9MI1ES15thUISgSe9GMf4XqRAit29_63D5dJ"),
          // btoa("AaHE1WJUnm4e29qL4SlDHHZIVYDD6jc5z6sHk6j4fHVWNzUuQZlbK28l9B8AnKKXI2bZgY6y80IZ3j1Z:EKFbqoMC4xzFxRGgEz2YmG05hS5sjvMl07KV8UPZ3sju2yh19jUjb5FTrVwCacLGT98oF82fgvyR0tzj"),
        },
      });
      if (request.status !== 200) return res.sendStatus(405);
      const transactionDetails = request.data;
      if (request.data.intent === "CAPTURE") {
        console.log(transactionDetails.purchase_units);
        const queryResult = await query(
          "SELECT COUNT(*) FROM payment_history WHERE payment_id = ?",
          [transactionDetails.id]
        );
        if (queryResult[0]["COUNT(*)"] !== 0) return res.sendStatus(405);
        let transactionValue =
          (transactionDetails.purchase_units[0].amount.value - 0.3) / 1.05;
        console.log(transactionValue);
        await query("UPDATE users SET balance = balance + ? WHERE id = ?", [
          transactionValue,
          res.locals.account.id,
        ]);
        await query(
          "INSERT INTO payment_history (user_id, payment_id, timestamp, value) VALUES (?, ?, ?, ?)",
          [
            res.locals.account.id,
            transactionDetails.id,
            transactionDetails.create_time,
            transactionValue,
          ]
        );
        return res.sendStatus(200);
      }
      return res.sendStatus(405);
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });
  router.get("/getPaymentHistory", async (req, res) => {
    try {
      if (res.locals.account.id == 4) {
        const allPaymentResult = await query(
          "SELECT library.post_id AS 'postID', library.value AS 'value', library.additional_tag AS 'additionalTag', library.date AS 'date', users.name AS 'buyerName', users.id AS 'buyerID' FROM library JOIN users ON library.user_id = users.id"
        );
        let postsInfo = [];
        for (let i = 0; i < allPaymentResult.length; i++) {
          postsInfo.push(
            await query(
              "SELECT posts.post_title AS 'postTitle', posts.post_description AS 'postDescription', posts.post_price AS 'postPrice', posts.post_type AS 'postType', posts.product_type AS 'productType', posts.poster_id AS 'posterID', users.name AS 'name' FROM posts JOIN users ON posts.poster_id = users.id WHERE posts.id = ?",
              [allPaymentResult[i].postID]
            )
          );
        }
        return res.send({
          code: 200,
          message: postsInfo,
          message2: allPaymentResult,
        });
      }
      const paymentResult = await query(
        "SELECT library.post_id AS 'postID', library.date AS 'date', library.value AS 'value', additional_tag AS 'additionalTag' FROM library WHERE user_id = ?",
        [res.locals.account.id]
      );
      let postsInfo = [];
      for (let i = 0; i < paymentResult.length; i++) {
        postsInfo.push(
          await query(
            "SELECT posts.post_title AS 'postTitle', posts.post_description AS 'postDescription', posts.post_price AS 'postPrice', posts.post_type AS 'postType', posts.product_type AS 'productType', posts.poster_id AS 'posterID', users.name AS 'name' FROM posts JOIN users ON posts.poster_id = users.id WHERE posts.id = ?",
            [paymentResult[i].postID]
          )
        );
      }
      return res.send({
        code: 200,
        message: postsInfo,
        message2: paymentResult,
      });
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });
  router.get("/getSoldPosts", async (req, res) => {
    try {
      const soldPostsInfo = await query(
        "SELECT posts.post_title AS 'postTitle', posts.post_description AS 'postDescription', posts.post_price AS 'postPrice', posts.post_type AS 'postType', posts.product_type AS 'productType', library.date AS 'date', library.user_id as 'buyerID', library.additional_tag as 'additionalTag', library.value as 'libraryValue', library.date as 'buyDate', users.name as 'buyerName' FROM posts JOIN library ON posts.id = library.post_id JOIN users ON users.id = library.user_id WHERE posts.poster_id = ?",
        [res.locals.account.id]
      );
      return res.send({
        code: 200,
        message: soldPostsInfo,
      });
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  });
  router.post("/updateName", async (req, res) => {
    try {
      if (req.body.name.length < 2)
        return res.send({ code: 401, message: "Invalid name." });
      console.log(req.body.name, res.locals.account.id);
      await query("UPDATE users SET name = ? WHERE id = ?", [
        req.body.name,
        res.locals.account.id,
      ]);
      return res.send({ code: 200, message: "Name changed successfully." });
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/updateUsername", async (req, res) => {
    try {
      let usernameRegex = /^[a-zA-Z]\w{3,16}$/g;
      if (!usernameRegex.test(req.body.username))
        return res.send({ code: 401, message: "Invalid username." });
      await query("UPDATE users SET username = ? WHERE id = ?", [
        req.body.username,
        res.locals.account.id,
      ]);
      return res.send({ code: 200, message: "Username changed successfully." });
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/updateBiography", async (req, res) => {
    console.log("Reach bio graphy paiya" + res.locals.account.id + ":" + req.body.biography);
    try {
      await query("UPDATE users SET biography = ? WHERE id = ?", [
        req.body.biography,
        res.locals.account.id,
      ]);
      return res.send({
        code: 200,
        message: "Biography changed successfully.",
      });
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/updateLink", async (req, res) => {
    try {
      await query("UPDATE users SET meeting_link = ? WHERE id = ?", [
        req.body.meeting_link,
        res.locals.account.id,
      ]);
      return res.send({ code: 200, message: "Link changed successfully." });
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/withdrawBalance", async (req, res) => {
    try {
      const user = await query("SELECT * FROM users WHERE id = ?", [
        res.locals.account.id,
      ]);
      await query(
        "INSERT INTO withdrawal_requests (user_id, payment_mail, timestamp, value) VALUES (?, ?, ?, ?)",
        [
          res.locals.account.id,
          req.body.mail,
          new Date().toDateString(),
          user[0].balance,
        ]
      );
      await query("UPDATE users SET balance = 0 WHERE id = ?", [
        res.locals.account.id,
      ]);
      /*var transporter = nodemailer.createTransport({
                host: 'smtp.zoho.eu',
                port: 465,
                secure: true, //ssl
                auth: {
                    user: 'payment@afroboost.com',
                    pass: '1234BassiAfroboost!'
                }
            });

            transporter.sendMail({
                from: 'payment@afroboost.com',
                to: 'office@afroboost.com',
                subject: 'Money deposited to Afroboost.',
                text: "User " + req.body.mail + " wants a withdrawal of " + user[0].balance + ". PayPal account of the user is associated with the e-mail provided in this mail. "
            });*/

      return res.sendStatus(200);
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.get("/getBalance", async (req, res) => {
    try {
      const user = await query("SELECT * FROM users WHERE id = ?", [
        res.locals.account.id,
      ]);
      console.log('/getbalance and the ' + user[0].name + 'has :' + user[0].balance);
      return res.send({ code: 200, message: user[0].balance });
    } catch {
      console.log(error);
      return res.send(200);
    }
  });

  router.post("/uploadPicture", async (req, res) => {
    try {
      const picture = req.files.uploadedPicture;
      if (!["jpg", "png", "jpeg"].includes(picture.name.split(".").pop())) {
        return res.send({ code: 401, message: "Invalid picture format." });
      }

      await picture.mv(
        __dirname +
        "/images/profilepic/" +
        res.locals.account.id.toString() +
        ".png"
      );
      return res.send({
        code: 200,
        message: "Profile picture successfully changed.",
      });
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/uploadCover", async (req, res) => {
    try {
      const picture = req.files.uploadedPicture;
      if (!["jpg", "png", "jpeg"].includes(picture.name.split(".").pop())) {
        return res.send({ code: 401, message: "Invalid picture format." });
      }

      await picture.mv(
        __dirname + "/images/cover/" + res.locals.account.id.toString() + ".png"
        // __dirname + "/var/www/afroboost/images/cover/" + res.locals.account.id.toString() + ".png"
      );
      return res.send({
        code: 200,
        message: "Cover picture successfully changed.",
      });
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/getUser", async (req, res) => {
    console.log(req.body.username);
    try {
      const user = await query(
        "SELECT id, name, username, meeting_link,is_blocked,biography FROM users WHERE LOWER(username) = LOWER(?)",
        [req.body.username]
      );
      let userdata = user[0];
      const videoCount = await query(
        "SELECT COUNT(*) AS 'count' FROM posts, users WHERE posts.post_type = 'video' AND posts.poster_id = users.id AND users.username = ?",
        [req.body.username]
      );
      const audioCount = await query(
        "SELECT COUNT(*) AS 'count' FROM posts, users WHERE posts.post_type = 'audio' AND posts.poster_id = users.id AND users.username = ?",
        [req.body.username]
      );
      const imageCount = await query(
        "SELECT COUNT(*) AS 'count' FROM posts, users WHERE posts.post_type = 'image' AND posts.poster_id = users.id AND users.username = ?",
        [req.body.username]
      );
      console.log(userdata);
      console.log(videoCount);
      if (!userdata) return res.send({ code: 404, message: "User not found." });
      return res.send({
        code: 200,
        message: userdata,
        statistics: [
          audioCount[0].count,
          videoCount[0].count,
          imageCount[0].count,
        ],
      });
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });
  router.post("/activateVoucher", async (req, res) => {
    try {
      const voucherCount = await query(
        "SELECT COUNT(*) AS count FROM vouchers WHERE voucher_code = ? AND activated = 0 AND expirydate >= CURDATE()",
        [`${req.body.code}`]
      );

      const voucher = await query(
        "SELECT * FROM vouchers WHERE voucher_code = ?",
        [`${req.body.code}`]
      );
      console.log("Ustaad yaha fit scene he :" + req.body.code);
      console.log(voucherCount);
      console.log(voucher);

      if (voucher.length === 0) return res.sendStatus(404);
      if (voucher[0].activated === 1) return res.sendStatus(403);
      if (voucherCount[0].count === 0) return res.sendStatus(404);

      const commissionPercentage = voucher[0].commissions;
      const voucherValue = voucher[0].value;

      // if (!commissionPercentage || isNaN(commissionPercentage)) {
      //   console.log("Handle invalid commission percentage");
      //   return res.sendStatus(500);
      // }

      if (!voucherValue || isNaN(voucherValue)) {
        console.log("Handle invalid voucher value");
        return res.sendStatus(500);
      }

      const commissionAmount = voucherValue * (commissionPercentage / 100);
      const userAmount = voucherValue - commissionAmount;

      if (voucher[0].email) {
        // If voucher has an email, check if it matches the user's email
        console.log("voucher email:" + voucher[0].email + " user email:" + res.locals.account.mail_address)
        if (voucher[0].email !== res.locals.account.mail_address) {
          return res.sendStatus(403); // Forbidden
        }
        await query(
          "UPDATE users SET balance = balance + ? WHERE id = ?",
          [userAmount, res.locals.account.id]
        );
      } else {
        // If voucher doesn't have an email, update balance for all accounts
        await query(
          "UPDATE users SET balance = balance + ? WHERE id = ?",
          [userAmount, res.locals.account.id]
        );
      }

      // Update the admin's balance
      await query("UPDATE users SET balance = balance + ? WHERE id = ?", [
        commissionAmount,
        4, // Assuming the admin's ID is 4
      ]);

      await query("UPDATE vouchers SET activated = 1 WHERE voucher_code = ?", [
        `${req.body.code}`,
      ]);

      io.to(`user ${res.locals.account.id}`).emit(
        `notification`,
        `Voucher activated!`
      );

      await query(
        "INSERT INTO notifications (user_id, text, link) VALUES (?, ?, ?)",
        [res.locals.account.id, "Voucher activated!", "/transfer"]
      );

      return res.sendStatus(200);
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });






  router.post("/generateVoucher", async (req, res) => {
    try {
      if (res.locals.account.id == 4) {
        let code = voucher_codes.generate({
          length: 8,
          count: 1,
        });

        console.log("Original expiry date from request body:", req.body.expirydate);

        // Convert req.body.expirydate to MySQL DATE format
        let expiryDate = new Date(req.body.expirydate);
        let formattedExpiryDate = expiryDate.toISOString().slice(0, 10);

        console.log("Formatted expiry date:", formattedExpiryDate);

        await query(
          "INSERT INTO vouchers (voucher_code, timestamp, value, activated, email, expirydate, commissions) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [code, new Date(), req.body.value, 0, req.body.email, formattedExpiryDate, req.body.commissions]
        );

        io.to(`user ${res.locals.account.id}`).emit(
          `notification`,
          `Voucher generated!`
        );

        await query(
          "INSERT INTO notifications (user_id, text, link) VALUES (?, ?, ?)",
          [res.locals.account.id, "Voucher generated!", "/transfer"]
        );

        return res.send({ code: 200, message: code });
      }
      return res.sendStatus(403);
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });


  router.get("/getNotifications", async (req, res) => {
    try {
      const notifications = await query(
        "SELECT * FROM notifications WHERE user_id = ?",
        res.locals.account.id
      );
      return res.send({ code: 200, message: notifications });
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/seenNotification", async (req, res) => {
    try {
      await query("UPDATE notifications SET seen = 1 WHERE id = ?", [
        req.body.id,
      ]);
      return res.sendStatus(200);
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.get('/list-users', async (req, res) => {
    try {
      const users = await query(`SELECT * FROM users ORDER BY id DESC LIMIT ${req.query.page ? req.query.page * 10 : 0},10`)
      return res.status(200).send({
        users
      })
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 767 ~ router.get ~ error", error)
      return res.sendStatus(500);
    }
  })

  router.get('/delete-block-user', async (req, res) => {
    try {
      let statement;
      if (!req.query.type) return res.status(400).send({ message: 'type is required.' })
      if (!req.query.id) return res.status(400).send({ message: 'id is required.' })
      let type = req.query.type;
      let id = req.query.id
      if (['block', 'unblock'].includes(req.query.type)) statement = `UPDATE users SET is_blocked=${req.query.type === "block" ? true : false}  WHERE id=${id}`;
      else statement = `DELETE FROM users WHERE id=${id} `;
      await query(statement)
      return res.status(200).send({ message: `User is ${type}ed.` })
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 778 ~ router.post ~ error", error)
      return res.sendStatus(500);
    }
  })

  return router;
};
