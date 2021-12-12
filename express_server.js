

function generateRandomString(length) {
    let result = '';
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < length; i++) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

const findUser = (email, userDatabase) => {
    for(const user in userDatabase) {
        if(email === userDatabase[user].email) {
            return userDatabase[user];
        }
    }
    return undefined;
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
    const loggedInUser = req.cookies["user_id"];
    const templateVars = {
        user: users[loggedInUser],
        urls: urlDatabase
      };
    res.render("urls_index", templateVars); // user_id in cookie detected by email
});

app.get("/urls/new", (req, res) => {
    const loggedInUser = req.cookies["user_id"];
    const templateVars = {
        user: users[loggedInUser],
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
    const loggedInUser = req.cookies["user_id"];
    const templateVars = { 
        user: users[loggedInUser],
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
    const loggedInUser = req.cookies["user_id"];
    const templateVars = {
        user: users[loggedInUser],
      };
    res.render("urls_register", templateVars);
  });

  app.get("/login", (req, res) => {
    const loggedInUser = req.cookies["user_id"];
    const templateVars = {
        user: users[loggedInUser],
      };
    res.render("urls_login", templateVars);
});

app.post("/urls/:id", (req, res) => {
    urlDatabase[req.params.id] = 'http://' + req.body.newURL;
    res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
    const username = req.body.email;
    const password = req.body.password;
    const user = findUser(username, users);
    if(user === undefined) {
        res.status(403);
        res.send('Please register first.');
    } else if(user !== undefined && user.password === password) {
        res.cookie('user_id', user.id);
        res.redirect(`/urls`);
    } else {
        res.status(403);
        res.send('wrong password');
    }
});

app.post("/logout", (req, res) => {
    res.clearCookie('user_id');
    res.redirect(`/urls`);
});

app.post("/register", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    if(email === '' || password === '') {
        res.status(400);
        res.send('Can\'t be empty email or password.');
    }
    if(findUser(email, users) !== undefined) {
        res.status(400);
        res.send('Email registered already.');
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
