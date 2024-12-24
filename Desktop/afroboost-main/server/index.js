const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const http = require("http");
const fs = require("fs");
const https = require("https");

const privateKey = fs.readFileSync(
  "/etc/letsencrypt/live/afroboost.com/privkey.pem",
  "utf8"
);
const certificate = fs.readFileSync(
  "/etc/letsencrypt/live/afroboost.com/cert.pem",
  "utf8"
);
const ca = fs.readFileSync(
  "/etc/letsencrypt/live/afroboost.com/chain.pem",
  "utf8"
);

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca,
};

var connection = mysql.createPool({
  host: "localhost",
  user: "mujtaba",
  charset: "utf8mb4",
  password: "Admin123",
  database: "afroboost_db",
  port: '3306'
});

var secret = "E9A6CA5C98ADC60C80EEE0E2A0069BF920FBB3C6ABE8C82EF3178F842323460D";
const util = require("util");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());
const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);
const io = require("socket.io")(httpsServer, {
  cors: {
    origin: "*",
  },
});
const rimraf = require("rimraf");
const auth = require("./auth")(connection);
const user = require("./user")(connection, io);
const post = require("./post")(connection, io);
const postV2 = require("./post.v2")(connection, io);
const emojis = require("./emoticons")(connection, io);
const v2_routes = require("./v2/route")(connection);

const query = util.promisify(connection.query).bind(connection);
var admin = require("firebase-admin");

// app.use("/static", express.static("live"));
app.use("/auth", auth);
app.use("/user", user);
app.use("/post", post);
app.use("/post/v2", postV2);
app.use("/emojis", emojis);
app.use("/api/v2", v2_routes)
// app.get("/", (req, res) => {
//   res.send("Hello world.");
// });
app.get("/", (req, res) => {
  connection.getConnection((error, connection) => {
    if (error) {
      console.error('Error getting database connection:', error);
    } else {
      console.log('Successfully connected to the database!');
      // Perform your database operations here
      // For example: connection.query("SELECT * FROM your_table", (err, results) => { ... });
      connection.release(); // Release the connection back to the pool
    }
  });

  res.send("Hello world.");
});
app.get("/aboutus", (req, res) => {
  res.sendFile("/var/www/afroboost/server/À propos.pdf");
});
app.get("/afroboostvideo", (req, res) => {
  res.sendFile("/var/www/afroboost/server/afroboost.mp4");
});
app.get("/header_logo", (req, res) => {
  res.sendFile("/var/www/afroboost/server/logo.png");
});
app.get("/afroboostbanner", (req, res) => {
  res.sendFile("/var/www/afroboost/server/afroboostbanner.png");
});
app.get("/getTermsFile", async (req, res) => {
  return res.sendFile("/var/www/afroboost/server/terms.pdf");
});
app.get("/messagefile/:jwt/:filename", async (req, res) => {
  try {
    var decoded = jwt.verify(req.params.jwt, secret);
    const checkThread = await query(
      "SELECT * FROM conversations WHERE id = ?",
      [req.params.filename.split(",")[0]]
    );
    if (checkThread[0]) {
      if (
        checkThread[0].thread_a === decoded.account.id ||
        checkThread[0].thread_b === decoded.account.id
      ) {
        const getImage = path.join(__dirname, 'images', 'uploads/' + req.params.filename);

        if (fs.existsSync(getImage)) {
          return res.sendFile(getImage);

        }

      }
    }
    return res.sendStatus(405);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});
app.get('/getVouchers', async (req, res) => {
  if (req.header('X-Auth-Token') === 'guest') {
    return res.sendStatus(403);
  }

  try {
    console.log("Voucher get is under processing....")

    // Read the voucher images from the appropriate destination folder
    const voucherFolder = __dirname + 'images/vouchers/';
    fs.readdir(voucherFolder, (error, files) => {
      if (error) {
        console.error(error);
        return res.sendStatus(500);
      }

      // Extract the filenames and create an array of voucher objects
      const vouchers = files.map((file) => ({
        voucherID: file.split('_')[0],
        imageURL: `${req.protocol}://${req.get('host')}/images/vouchers/${file}`,
      }));
      res.setHeader('Content-Disposition', 'attachment');
      return res.status(200).json({ message: vouchers });
    });
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
});
app.get("/meet/id/:id", async (req, res) => {
  try {
    const qqr = await query("SELECT * FROM users WHERE id = ?", [
      req.params.id,
    ]);
    if (!qqr[0].meeting_link) return res.redirect("https://afroboost.com");
    return res.redirect(qqr[0].meeting_link);
  } catch (err) {
    // err
    console.log(err);
    return res.sendStatus(405);
  }
});

app.get("/meet/:username", async (req, res) => {
  try {
    console.log(req.params);
    const qqr = await query("SELECT * FROM users WHERE username = ?", [
      req.params.username,
    ]);
    console.log(qqr);
    if (!qqr[0].meeting_link) return res.redirect("https://afroboost.com");
    return res.redirect(qqr[0].meeting_link);
  } catch (err) {
    // err
    console.log(err);
    return res.sendStatus(405);
  }
});

app.get("/audio/:id/:jwt/:filename", async (req, res) => {
  let demoPrefix = "";
  res.set("Access-Control-Allow-Origin", "*");
  try {
    if (req.params.jwt !== "guest") {
      var decoded = jwt.verify(req.params.jwt, secret);
      const library = await query(
        "SELECT COUNT(*) FROM library WHERE post_id = ? and user_id = ?",
        [req.params.id, decoded.account.id]
      );
      if (library[0]["COUNT(*)"] === 0) demoPrefix = "preview-";
      const post = await query("SELECT * FROM posts WHERE id = ?", [
        req.params.id,
      ]);
      if (post[0].post_price === 0 || post[0].poster_id === decoded.account.id)
        demoPrefix = "";
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
    } else {
      if (post[0].post_price !== 0) demoPrefix = "preview-";
    }
  } catch (err) {
    // err
    console.log(err);
    return res.sendStatus(405);
  }
  try {
    const existsMP3 = fs.existsSync(
      __dirname +
      "/posts/" +
      req.params.id.toString() +
      "/" +
      demoPrefix +
      req.params.id.toString() +
      ".mp3"
    );
    if (existsMP3)
      return res.sendFile(
        __dirname +
        "/posts/" +
        req.params.id.toString() +
        "/" +
        demoPrefix +
        req.params.id.toString() +
        ".mp3"
      );
    return res.sendStatus(404);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
});
app.get("/imagenotype/:id/:number", async (req, res) => {
  try {
    const existsJPG = fs.existsSync(
      __dirname +
      "/posts/" +
      req.params.id.toString() +
      "/" +
      req.params.number +
      "-" +
      req.params.id.toString() +
      ".jpg"
    );
    const existsFLV = fs.existsSync(
      __dirname +
      "/posts/" +
      req.params.id.toString() +
      "/" +
      req.params.number +
      "-" +
      req.params.id.toString() +
      ".flv"
    );
    const existsMP4 = fs.existsSync(
      __dirname +
      "/posts/" +
      req.params.id.toString() +
      "/" +
      req.params.number +
      "-" +
      req.params.id.toString() +
      ".mp4"
    );
    const existsAVI = fs.existsSync(
      __dirname +
      "/posts/" +
      req.params.id.toString() +
      "/" +
      req.params.number +
      "-" +
      req.params.id.toString() +
      ".avi"
    );
    const existsPNG = fs.existsSync(
      __dirname +
      "/posts/" +
      req.params.id.toString() +
      "/" +
      req.params.number +
      "-" +
      req.params.id.toString() +
      ".png"
    );
    const existsJPEG = fs.existsSync(
      __dirname +
      "/posts/" +
      req.params.id.toString() +
      "/" +
      req.params.number +
      "-" +
      req.params.id.toString() +
      ".jpeg"
    );
    if (existsFLV) {
      return res.send({ code: 200, message: "video" });
    }
    if (existsMP4) {
      return res.send({ code: 200, message: "video" });
    }
    if (existsAVI) {
      return res.send({ code: 200, message: "video" });
    }
    if (existsJPG) {
      return res.send({ code: 200, message: "image" });
    }
    if (existsPNG) {
      return res.send({ code: 200, message: "image" });
    }
    if (existsJPEG) {
      return res.send({ code: 200, message: "image" });
    }
    return res.sendStatus(404);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});
app.get("/imageno/:id/:number", async (req, res) => {
  try {
    const existsJPG = fs.existsSync(
      __dirname +
      "/posts/" +
      req.params.id.toString() +
      "/" +
      req.params.number +
      "-" +
      req.params.id.toString() +
      ".jpg"
    );
    const existsFLV = fs.existsSync(
      __dirname +
      "/posts/" +
      req.params.id.toString() +
      "/" +
      req.params.number +
      "-" +
      req.params.id.toString() +
      ".flv"
    );
    const existsMP4 = fs.existsSync(
      __dirname +
      "/posts/" +
      req.params.id.toString() +
      "/" +
      req.params.number +
      "-" +
      req.params.id.toString() +
      ".mp4"
    );
    const existsAVI = fs.existsSync(
      __dirname +
      "/posts/" +
      req.params.id.toString() +
      "/" +
      req.params.number +
      "-" +
      req.params.id.toString() +
      ".avi"
    );
    const existsPNG = fs.existsSync(
      __dirname +
      "/posts/" +
      req.params.id.toString() +
      "/" +
      req.params.number +
      "-" +
      req.params.id.toString() +
      ".png"
    );
    const existsJPEG = fs.existsSync(
      __dirname +
      "/posts/" +
      req.params.id.toString() +
      "/" +
      req.params.number +
      "-" +
      req.params.id.toString() +
      ".jpeg"
    );
    if (existsFLV) {
      return res.sendFile(
        __dirname +
        "/posts/" +
        req.params.id.toString() +
        "/" +
        req.params.number +
        "-" +
        req.params.id.toString() +
        ".flv"
      );
    }
    if (existsMP4) {
      return res.sendFile(
        __dirname +
        "/posts/" +
        req.params.id.toString() +
        "/" +
        req.params.number +
        "-" +
        req.params.id.toString() +
        ".mp4"
      );
    }
    if (existsAVI) {
      return res.sendFile(
        __dirname +
        "/posts/" +
        req.params.id.toString() +
        "/" +
        req.params.number +
        "-" +
        req.params.id.toString() +
        ".avi"
      );
    }
    if (existsJPG) {
      return res.sendFile(
        __dirname +
        "/posts/" +
        req.params.id.toString() +
        "/" +
        req.params.number +
        "-" +
        req.params.id.toString() +
        ".jpg"
      );
    }
    if (existsPNG)
      return res.sendFile(
        __dirname +
        "/posts/" +
        req.params.id.toString() +
        "/" +
        req.params.number +
        "-" +
        req.params.id.toString() +
        ".png"
      );
    if (existsJPEG)
      return res.sendFile(
        __dirname +
        "/posts/" +
        req.params.id.toString() +
        "/" +
        req.params.number +
        "-" +
        req.params.id.toString() +
        ".jpeg"
      );
    return res.sendStatus(404);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

app.get("/image/:id/:jwt/:filename", async (req, res) => {
  try {
    if (req.params.jwt !== "guest") {
      var decoded = jwt.verify(req.params.jwt, secret);
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
    }
  } catch (err) {
    // err
    console.log(err);
    return res.sendStatus(405);
  }
  try {
    const existsJPG = fs.existsSync(
      __dirname +
      "/posts/" +
      req.params.id.toString() +
      "/" +
      req.params.id.toString() +
      ".jpg"
    );
    const existsPNG = fs.existsSync(
      __dirname +
      "/posts/" +
      req.params.id.toString() +
      "/" +
      req.params.id.toString() +
      ".png"
    );
    const existsJPEG = fs.existsSync(
      __dirname +
      "/posts/" +
      req.params.id.toString() +
      "/" +
      req.params.id.toString() +
      ".jpeg"
    );
    if (existsJPG)
      return res.sendFile(
        __dirname +
        "/posts/" +
        req.params.id.toString() +
        "/" +
        req.params.id.toString() +
        ".jpg"
      );
    if (existsPNG)
      return res.sendFile(
        __dirname +
        "/posts/" +
        req.params.id.toString() +
        "/" +
        req.params.id.toString() +
        ".png"
      );
    if (existsJPEG)
      return res.sendFile(
        __dirname +
        "/posts/" +
        req.params.id.toString() +
        "/" +
        req.params.id.toString() +
        ".jpeg"
      );
    return res.sendStatus(404);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
});

app.get("/video/:id/:jwt/:filename", async (req, res) => {
  console.log(req.params.jwt, req.params.id, req.params.filename);
  var demoPrefix = "";
  var decoded = null;
  if (req.params.jwt != "guest") {
    decoded = jwt.verify(req.params.jwt, secret);
  }
  if (decoded && decoded.account.id != 4) {
    try {
      if (req.params.jwt != "guest") {
        const library = await query(
          "SELECT COUNT(*) FROM library WHERE post_id = ? and user_id = ?",
          [req.params.id, decoded.account.id]
        );
        if (library[0]["COUNT(*)"] === 0) demoPrefix = "preview-";
        const post = await query("SELECT * FROM posts WHERE id = ?", [
          req.params.id,
        ]);
        if (
          post[0].post_price === 0 ||
          post[0].poster_id === decoded.account.id
        )
          demoPrefix = "";
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
      } else {
        if (post[0].post_price !== 0) demoPrefix = "preview-";
      }
    } catch (err) {
      // err
      console.log("ER", err);
      return res.sendStatus(405);
    }
  } else {
    demoPrefix = "";
  }
  try {
    const existsMP4 = fs.existsSync(
      __dirname +
      "/posts/" +
      req.params.id.toString() +
      "/" +
      demoPrefix +
      req.params.id.toString() +
      ".mp4"
    );
    const existsAVI = fs.existsSync(
      __dirname +
      "/posts/" +
      req.params.id.toString() +
      "/" +
      demoPrefix +
      req.params.id.toString() +
      ".avi"
    );
    const existsFLV = fs.existsSync(
      __dirname +
      "/posts/" +
      req.params.id.toString() +
      "/" +
      demoPrefix +
      req.params.id.toString() +
      ".flv"
    );
    if (existsMP4)
      return res.sendFile(
        __dirname +
        "/posts/" +
        req.params.id.toString() +
        "/" +
        demoPrefix +
        req.params.id.toString() +
        ".mp4"
      );
    if (existsAVI)
      return res.sendFile(
        __dirname +
        "/posts/" +
        req.params.id.toString() +
        "/" +
        demoPrefix +
        req.params.id.toString() +
        ".avi"
      );
    if (existsFLV)
      return res.sendFile(
        __dirname +
        "/posts/" +
        req.params.id.toString() +
        "/" +
        demoPrefix +
        req.params.id.toString() +
        ".flv"
      );
    return res.sendStatus(404);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
});

app.get("/coverImage/:id", async (req, res) => {
  try {
    const existsJPG = fs.existsSync(
      __dirname + "/images/cover/" + req.params.id.toString() + ".jpg"
    );
    const existsPNG = fs.existsSync(
      __dirname + "/images/cover/" + req.params.id.toString() + ".png"
    );
    const existsJPEG = fs.existsSync(
      __dirname + "/images/cover/" + req.params.id.toString() + ".jpeg"
    );
    if (existsJPG)
      return res.sendFile(
        __dirname + "/images/cover/" + req.params.id.toString() + ".jpg"
      );
    if (existsPNG)
      return res.sendFile(
        __dirname + "/images/cover/" + req.params.id.toString() + ".png"
      );
    if (existsJPEG)
      return res.sendFile(
        __dirname + "/images/cover/" + req.params.id.toString() + ".jpeg"
      );
    return res.sendFile(__dirname + "/defaultcover.jpg");
  } catch (error) {
    console.error(error);
    return res.sendFile(__dirname + "/defaultcover.jpg");
  }
});

app.get("/profileImage/:id", async (req, res) => {
  try {
    const existsJPG = fs.existsSync(
      __dirname + "/images/profilepic/" + req.params.id.toString() + ".jpg"
    );
    const existsPNG = fs.existsSync(
      __dirname + "/images/profilepic/" + req.params.id.toString() + ".png"
    );
    const existsJPEG = fs.existsSync(
      __dirname + "/images/profilepic/" + req.params.id.toString() + ".jpeg"
    );
    if (existsJPG)
      return res.sendFile(
        __dirname + "/images/profilepic/" + req.params.id.toString() + ".jpg"
      );
    if (existsPNG)
      return res.sendFile(
        __dirname + "/images/profilepic/" + req.params.id.toString() + ".png"
      );
    if (existsJPEG)
      return res.sendFile(
        __dirname + "/images/profilepic/" + req.params.id.toString() + ".jpeg"
      );
    return res.sendFile(__dirname + "/default.png");
  } catch (error) {
    console.error(error);
    return res.sendFile(__dirname + "/default.png");
  }
});

app.get("/postThumbnail/:id", (req, res) => {
  try {
    if (
      fs.existsSync(
        __dirname + "/posts/" + req.params.id.toString() + "/thumbnail.png"
      )
    )
      return res.sendFile(
        __dirname + "/posts/" + req.params.id.toString() + "/thumbnail.png"
      );
    const existsJPG = fs.existsSync(
      __dirname +
      "/posts/" +
      req.params.id.toString() +
      "/" +
      req.params.id.toString() +
      ".jpg"
    );
    const existsPNG = fs.existsSync(
      __dirname +
      "/posts/" +
      req.params.id.toString() +
      "/" +
      req.params.id.toString() +
      ".png"
    );
    const existsJPEG = fs.existsSync(
      __dirname +
      "/posts/" +
      req.params.id.toString() +
      "/" +
      req.params.id.toString() +
      ".jpeg"
    );
    if (existsJPG)
      return res.sendFile(
        __dirname +
        "/posts/" +
        req.params.id.toString() +
        "/" +
        req.params.id.toString() +
        ".jpg"
      );
    if (existsPNG)
      return res.sendFile(
        __dirname +
        "/posts/" +
        req.params.id.toString() +
        "/" +
        req.params.id.toString() +
        ".png"
      );
    if (existsJPEG)
      return res.sendFile(
        __dirname +
        "/posts/" +
        req.params.id.toString() +
        "/" +
        req.params.id.toString() +
        ".jpeg"
      );
    const existsJPG2 = fs.existsSync(
      __dirname +
      "/posts/" +
      req.params.id.toString() +
      "/" +
      "0" +
      "-" +
      req.params.id.toString() +
      ".jpg"
    );
    const existsPNG2 = fs.existsSync(
      __dirname +
      "/posts/" +
      req.params.id.toString() +
      "/" +
      "0" +
      "-" +
      req.params.id.toString() +
      ".png"
    );
    const existsJPEG2 = fs.existsSync(
      __dirname +
      "/posts/" +
      req.params.id.toString() +
      "/" +
      "0" +
      "-" +
      req.params.id.toString() +
      ".jpeg"
    );
    if (existsJPG2)
      return res.sendFile(
        __dirname +
        "/posts/" +
        req.params.id.toString() +
        "/" +
        "0" +
        "-" +
        req.params.id.toString() +
        ".jpg"
      );
    if (existsPNG2)
      return res.sendFile(
        __dirname +
        "/posts/" +
        req.params.id.toString() +
        "/" +
        "0" +
        "-" +
        req.params.id.toString() +
        ".png"
      );
    if (existsJPEG2)
      return res.sendFile(
        __dirname +
        "/posts/" +
        req.params.id.toString() +
        "/" +
        "0" +
        "-" +
        req.params.id.toString() +
        ".jpeg"
      );
    return res.sendFile("/var/www/afroboost/server/example.png");
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
});

app.get('/imoticon/:id', async (req, res) => {
  const imoticon = fs.existsSync(__dirname + '/imoticon' + '/' + req.params.id)
  if (imoticon) {
    return res.sendFile(__dirname + '/imoticon' + '/' + req.params.id)
  }

})
app.get('/random/:id', async (req, res) => {
  const random = fs.existsSync(__dirname + '/random' + '/' + req.params.id)
  if (random) {
    return res.sendFile(__dirname + '/random' + '/' + req.params.id)
  }
});

app.get('/validatesessionwithQR', async (req, res) => {
  try {
    const validate = await query('SELECT id, quantity, qrstatus FROM library WHERE validation=1');

    for (let i = 0; i < validate.length; i++) {
      const id = validate[i].id;
      const quantity = validate[i].quantity;
      const qrstatus = validate[i].qrstatus;

      if (!qrstatus && quantity > 0) {
        const startSession = await query(
          "UPDATE `library` SET `qrstatus`=?, `quantity`=? WHERE id=?",
          [1, quantity - 1, id]
        );

        if (startSession.affectedRows > 0) {
          console.log("QR code data received successfully for ID: ", id);
        } else {
          console.log("No session is validated, so no session is started for ID: ", id);
        }
      } else {
        console.log("Quantity is zero or QR code already received for ID: ", id);
      }
    }

    res.status(200).json("La session a démarré avec succès");
  } catch (error) {
    res.status(500).json("La session n'est pas démarrée, l'utilisateur n'a peut-être pas validé la session d'aujourd'hui");
  }
});


const httpPort = process.env.HTTP_PORT || 3003;
const httpsPort = process.env.HTTPS_PORT || 3004;

httpServer.listen(httpPort, () => {
  console.log(`HTTP server running on port ${httpPort}`);
});

httpsServer.listen(httpsPort, () => {
  console.log(`HTTPS server running on port ${httpsPort}`);
});

module.exports = {
  query,
};