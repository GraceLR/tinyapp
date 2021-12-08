

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

const users = { 
    "userRandomID": {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    },
   "user2RandomID": {
      id: "user2RandomID", 
      email: "user2@example.com", 
      password: "dishwasher-funk"
    }
  }

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

  app.get("/register", (req, res) => {
    const templateVars = {
        username: req.cookies["username"],
      };
    res.render("urls_register", templateVars);
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

app.post("/register", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const findUser = (email, userDatabase) => {
        for(const user in userDatabase) {
            if(email === userDatabase[user].email) {
                return user;
            }
        }
        return undefined;
    }
    if(findUser(email, users) !== undefined) {
        return res.send('Email already registered, please login.')
    } else {
        const newUser = generateRandomString(6);
        users[newUser] = { id: newUser, email: email, password: password };
        res.cookie('user_id', newUser);
        res.redirect(`/urls`);
    }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
  
});
