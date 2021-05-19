const express = require("express");
const router = express.Router();
const nodeFetch = require("node-fetch");

router.get("/", (req, res) => {
  res.render('./shoes/shoeHome', {loggedin: req.isAuthenticated()})
})

router.get("/:name", (req,res) => {
  const name = req.params.name
  const page = './shoes/'+name
  res.render(page, {loggedin: req.isAuthenticated()})
})

module.exports = router;
