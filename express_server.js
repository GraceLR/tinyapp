

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
};

const urlsForUser = (id, loggedInUser, urlDatabase) => {
    const urlFiltered = {};
    if(id === loggedInUser) {
        for(const url in urlDatabase) {
            if(urlDatabase[url]['userID'] === id) {
                urlFiltered[url] = urlDatabase[url];
            }
        }
        return urlFiltered;
    } else { 
        return undefined;
    }
};

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
    b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
    i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
  };

const users = { 
    "aJ48lW": {
      id: "aJ48lW", 
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
        urls: urlsForUser(loggedInUser, loggedInUser, urlDatabase)
      };
    if(loggedInUser !== undefined) {
        res.render("urls_index", templateVars);
    } else {
        res.send('Please Login or Register first.\n');
    }
});

app.get("/urls/new", (req, res) => {
    const loggedInUser = req.cookies["user_id"];
    const templateVars = {
        user: users[loggedInUser],
      };
    if(loggedInUser !== undefined) {
        res.render("urls_new", templateVars);
    } else {
        res.redirect("/login");
    }
  });

app.get("/urls/:shortURL", (req, res) => {
    const loggedInUser = req.cookies["user_id"];
    const templateVars = { 
        user: users[loggedInUser],
        shortURL: req.params.shortURL, 
        longURL: urlDatabase[req.params.shortURL]['longURL'] };
        if(loggedInUser === undefined) {
            res.send('Please Login first.\n');
        } else if(urlDatabase[req.params.shortURL] === undefined) {
            res.send('Corresponding longURL hasn\'t been created.\n');
        } else if(urlDatabase[req.params.shortURL]['userID'] !== loggedInUser) {
            res.send('shortURL used by another user\n');
        } else {
            res.render("urls_show", templateVars);
        }
});

app.get("/u/:shortURL", (req, res) => {
    const loggedInUser = req.cookies["user_id"];
    const templateVars = {
        user: users[loggedInUser],
      };
    const shortURL = req.params.shortURL;
    if (urlDatabase[shortURL] === undefined) {
        return res.render("u_index", templateVars);
    }
    res.redirect(urlDatabase[shortURL]['longURL']);
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

app.post("/urls", (req, res) => {
    const shortURL = generateRandomString(6);
    urlDatabase[shortURL] = { longURL: 'http://' + req.body.longURL, userID: req.cookies["user_id"] };
    res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL", (req, res) => {
    const shortURL = req.params.shortURL;
    const longURL = req.body.newURL;
    const loggedInUser = req.cookies["user_id"];
    if(loggedInUser === undefined) {
        res.send('Please Login first.\n');
    } else if(urlDatabase[req.params.shortURL] === undefined) {
        console.log(urlDatabase)
        console.log(req.params.shortURL)
        res.send('Corresponding record doesn\'t exit. Nothing to edit.\n');
    } else if(urlDatabase[req.params.shortURL]['userID'] !== loggedInUser) {
        res.send('You are not the creator of this record. You are not allowed to edit this record.\n');
    } else {
        urlDatabase[shortURL]['longURL'] = 'http://' + longURL;
        res.redirect(`/urls`);
    }
});

app.post("/urls/:shortURL/delete", (req, res) => { 
    const loggedInUser = req.cookies["user_id"];
    if(loggedInUser === undefined) {
        res.send('Please Login first.\n');
    } else if(urlDatabase[req.params.shortURL] === undefined) {
        res.send('Corresponding record doesn\'t exit. Nothing to delete.\n');
    } else if(urlDatabase[req.params.shortURL]['userID'] !== loggedInUser) {
        res.send('You are not the creator of this record. You are not allowed to delete this record.\n');
    } else {
        delete urlDatabase[req.params.shortURL];
        res.redirect(`/urls`);
    }
});

app.post("/login", (req, res) => {
    const username = req.body.email;
    const password = req.body.password;
    const user = findUser(username, users);
    if(user === undefined) {
        res.status(403);
        res.send('Please register first.\n');
    } else if(user !== undefined && user.password === password) {
        res.cookie('user_id', user.id);
        res.redirect(`/urls`);
    } else {
        res.status(403);
        res.send('wrong password\n');
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
        res.send('Can\'t be empty email or password.\n');
    }
    if(findUser(email, users) !== undefined) {
        res.status(400);
        res.send('Email registered already.\n');
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
