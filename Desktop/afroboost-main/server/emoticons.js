
module.exports = (connection, io) => {
  const express = require("express");
  const util = require("util");
  const router = express.Router();
  const jwt = require("jsonwebtoken");
  const fileUpload = require("express-fileupload");
  const fs = require('fs');

  const query = util.promisify(connection.query).bind(connection);

  var secret = "E9A6CA5C98ADC60C80EEE0E2A0069BF920FBB3C6ABE8C82EF3178F842323460D";

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
      return res.sendStatus(500);
    }
  });

  router.get("/", async (req, res) => {
    try {
      await fs.readdir('./imoticon/', (err, files) => {
        if (err) return res.send(500);
        return res.send({ code: 200, files: files, message: "Emojis successfully fetched" });
      });
    } catch {
      console.log(error);
      return res.send(500);
    }
  });

  router.post("/", async (req, res) => {
    try {
      const picture = req.files.emoji;
      if (!["jpg", "png", "jpeg"].includes(picture.name.split(".").pop())) {
        return res.send({ code: 401, message: "Invalid emoji format." });
      }

      await picture.mv(
        __dirname +
        "/imoticon/" +
        new Date().toISOString() +
        ".png"
      );
      return res.send({
        code: 200,
        message: "Emoji successfully added.",
      });
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.delete("/:fileName", async (req, res) => {
    const fileName = req.params.fileName;
    try {
      if (!fileName) {
        return res.status(403).json({ message: "File name is required" });
      }
      const filePath = `./imoticon/${fileName}`;
      await fs.stat(filePath, async function (err, stats) {
        if (err) {
          return res.status(403).json({ message: "The file does not exist" });
        }

        await fs.unlink(filePath, function (err) {
          if (err) return res.status(500).json({ message: "An error occured when deleting the file" });
          return res.send({ code: 200, message: "Emojis successfully deleted" });
        });
      });
    } catch {
      return res.send(500);
    }
  });

  return router;
};
