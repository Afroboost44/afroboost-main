const { sendEmail } = require("./emailjs");
const socialLogin = require("./socialLogin");

module.exports = (connection) => {
  const express = require("express");
  const util = require("util");
  const router = express.Router();
  const bcrypt = require("bcrypt");
  const { v4: uuid } = require('uuid')
  const jwt = require("jsonwebtoken");
  const getUser = async () => {
    const users = await query("SELECT * FROM USERS");
    return users;
  }
  const query = util.promisify(connection.query).bind(connection);
  // const emailjs=require('ema')
  var encryptor = require("simple-encryptor")(
    "KoDskDmek4dfkEIdoDEMjddi4rdKFSakfia45odksdfskro43ikDKsei4l3sdkk3j4jewrsfjjfI4slfkfkDioIDkEJEjekFOFOf34olrkfdKFIifs"
  );
  var secret =
    "E9A6CA5C98ADC60C80EEE0E2A0069BF920FBB3C6ABE8C82EF3178F842323460D";

  var GOOGLE_APPLICATION_CREDENTIALS = "./service-account-file.json";
  var admin = require("firebase-admin");
  router.post("/register", async (req, res) => {
    console.log("Bhai yaha tk fit scene ee");
    console.log(req.body);
    try {
      console.log("Debug1");
      const salt = bcrypt.genSaltSync(10);
      const password = bcrypt.hashSync(req.body.password, salt);
      let mailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
      let usernameRegex = /^[a-z]\w{3,30}$/g;
      if (!mailRegex.test(req.body.mail_address))
        return res.send({ code: 407, message: "Invalid e-mail address." });
      if (req.body.password.length < 6)
        return res.send({ code: 413, message: "Weak password." });
      let numberOfUsernames = await query(
        "SELECT COUNT(*) as 'count' FROM users WHERE username = ?",
        [req.body.username]
      );
      console.log("Debug2");
      if (numberOfUsernames[0].count != 0)
        return res.send({
          code: 408,
          message: "Username has been already chosen by another user.",
        });
      console.log("Debug3");
      let numberOfMails = await query(
        "SELECT COUNT(*) as 'count' FROM users WHERE mail_address = ?",
        [req.body.mail_address]
      );
      console.log("Debug4");
      if (numberOfMails[0].count != 0)
        return res.send({ code: 409, message: "E-mail is already in use." });
      let currentDate = new Date().toISOString().split("T")[0];
      console.log("currentDate", currentDate);

      // Function to generate a random alphanumeric string
      function generateRandomString(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
      }
      console.log("Debug5");
      // ...
      let fcmToken = generateRandomString(10); // Generate a random 10-character string
      console.log(process.env.ENVFILE_CHECK);
      let result = await query(
        "INSERT INTO users (`name`, username, mail_address, password, phone_number, balance, date_joined, is_blocked, meeting_link, fcm_token) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          req.body.name,
          req.body.username,
          req.body.mail_address,
          password,
          req.body.phone_number || "",
          0,
          currentDate,
          0,
          "",
          fcmToken
        ]
      );
      console.log(result);
      return res.send({ code: 200, message: "Registration successful" });
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post("/login", async (req, res) => {
    try {
      const account = await query(
        "SELECT * FROM users WHERE mail_address = ?",
        [req.body.mail_address]
      );
      if (!account[0]) {
        return res.sendStatus(404);
      }
      const matching = await bcrypt.compare(
        req.body.password,
        account[0].password
      );
      const salt = bcrypt.genSaltSync(10);
      const password = bcrypt.hashSync(req.body.password, salt);
      console.log(password)
      // if (!matching) return res.sendStatus(405);
      if (account[0].is_blocked) return res.status(401).send({ message: 'Admin has blocked you' })
      let token = jwt.sign({ account: account[0] }, secret);
      return res.send({
        code: 200,
        message: token,
        fullName: account[0].name,
        username: account[0].username,
        userID: account[0].id,
      });
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  });

  router.post('/forgot-password', async (req, res) => {
    console.log("Forget password reach");
    try {
      let currentDate = new Date().toISOString().split("T")[0];
      var id = uuid()
      const account = await query("SELECT * FROM users WHERE mail_address = ?",
        [req.body.mail_address]
      )
      if (!account.length) {
        return res.status(404).send({
          message: "account not found."
        })
      }
      let result = await query(
        "INSERT INTO ForgotPassword (`id`, mail_address,date_requested) VALUES (?, ?, ?)",
        [
          id,
          req.body.mail_address,
          currentDate,
        ]
      );

      // await sendEmail("template_pq6qbuc", {
      // await sendEmail("template_qnv1kqm", {
      //   user_email: req.body.mail_address,
      //   link: `https://afroboost.com/forgot-password/${id}`
      // })
      // return res.status(200).send({
      //   id,
      //   message: "mail send successfully"
      // })

      const templateId = "template_qnv1kqm"; // Replace with the ID of your EmailJS template
      const templateParams = {
        user_email: req.body.mail_address,
        link: `https://afroboost.com/forgot-password/${id}` // Replace with your reCAPTCHA response
        // link: `http://localhost:3000/forgot-password/${id}` // Replace with your reCAPTCHA response
      };

      sendEmail(templateId, templateParams)
        .then(() => {
          console.log('Email sent successfully!');
          return res.status(200).send({
            message: "Demande de réinitialisation du mot de passe envoyée à votre adresse e-mail vérifier votre courrier"
          })
        })
        .catch((error) => {
          console.error('Failed to send email:', error);
        });
    } catch (error) {
      console.log("🚀 ~ file: auth.js ~ line 120 ~ router.post ~ error", error)
      return res.status(503).send({
        message: "Serice unavailable"
      })
    }
  })
  router.post('/reset-password', async (req, res) => {
    try {
      let id = req.body.id;
      const salt = bcrypt.genSaltSync(10);
      const password = bcrypt.hashSync(req.body.password, salt);
      let forgotPasswordRequest = await query("SELECT * FROM ForgotPassword WHERE id = ?",
        [id]
      )
      if (!forgotPasswordRequest.length) {
        return res.status(400).send({
          message: "Incorrect Information Provided"
        })
      }
      forgotPasswordRequest = forgotPasswordRequest[0]
      const user = await query(`UPDATE users SET password="${password}" WHERE mail_address="${forgotPasswordRequest.mail_address}"`)
      await query(`DELETE FROM ForgotPassword WHERE id="${id}"`)
      return res.status(200).send({
        message: "Mot de passe réinitialisé avec succès.."
      })
    } catch (error) {
      console.log("🚀 ~ file: auth.js ~ line 144 ~ router.post ~ error", error)
      return res.status(503).send({
        message: "Serice unavailable"
      })
    }
  })
  router.get('/social_login', async (req, res) => {
    try {
      let type = req.query.type.toLowerCase();
      let response = await socialLogin[type](req.headers.id_token)
      if (response) {
        const account = await query(
          "SELECT * FROM users WHERE mail_address = ?",
          [response.email]
        );
        if (!account.length) {
          return res.status(412).send({
            message: "No account found"
          })
        }
        if (account[0].is_blocked) {
          return res.status(412).send({
            message: "your account is blocked"
          })
        }
        let token = jwt.sign({ account: account[0] }, secret);
        return res.send({
          code: 200,
          message: token,
          fullName: account[0].name,
          username: account[0].username,
          userID: account[0].id,
        })
      }
    } catch (error) {
      console.log("🚀 ~ file: auth.js ~ line 164 ~ router.get ~ error", error)
      if (error.code) return res.status(error.code).send(error)
      return res.status(503).send({
        message: "Serice unavailable"
      })
    }

  })
  return router;
};
