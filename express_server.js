

function generateRandomString(length) {
    let result = '';
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < length; i++) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
    const templateVars = {
        username: req.cookies["username"],
        urls: urlDatabase
      };
    res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    const templateVars = {
        username: req.cookies["username"],
      };
    res.render("urls_new", templateVars);
  });

app.post("/urls", (req, res) => {
    const shortURL = generateRandomString(6);
    urlDatabase[shortURL] = 'http://' + req.body.longURL;
    res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => { 
    delete urlDatabase[req.params.shortURL];
    res.redirect(`/urls`);
});

app.get("/urls/:shortURL", (req, res) => {
    const templateVars = { 
        username: req.cookies["username"],
        shortURL: req.params.shortURL, 
        longURL: urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
    const templateVars = { username: req.cookies["username"] };
    const shortURL = req.params.shortURL;
    const longURL = urlDatabase[shortURL];
    if (longURL === undefined) {
        return res.render("u_index", templateVars);
    }
    res.redirect(longURL);
  });

app.post("/urls/:id", (req, res) => {
    urlDatabase[req.params.id] = 'http://' + req.body.newURL;
    res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
    res.cookie('username', req.body.username);
    res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
    res.clearCookie('username')
    res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
