const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const router = express.Router();
router.use(bodyParser.json());

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// router.get("/dashboard", (req, res) => {
//   res.sendFile(path.join(__dirname, "../public/dashboard.html"));
// });

module.exports = router;