const { generateRandomString, findUser, urlsForUser } = require("./helpers");
const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
// const cookieParser = require('cookie-parser');
const cookieSession = require("cookie-session");

app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(cookieSession({ name: "session", secret: "purple-dinosaur" }));

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
};

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
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
  const loggedInUser = req.session.user_id;
  const templateVars = {
    user: users[loggedInUser],
    urls: urlsForUser(loggedInUser, loggedInUser, urlDatabase),
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const loggedInUser = req.session.user_id;
  const templateVars = {
    user: users[loggedInUser],
  };
  if (loggedInUser !== undefined) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const loggedInUser = req.session.user_id;
  const templateVars = {
    user: users[loggedInUser],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]["longURL"],
  };
  if (loggedInUser === undefined) {
    res.send("Please Login first.\n");
  } else if (urlDatabase[req.params.shortURL] === undefined) {
    res.send("Corresponding longURL hasn't been created.\n");
  } else if (urlDatabase[req.params.shortURL]["userID"] !== loggedInUser) {
    res.send("shortURL used by another user\n");
  } else {
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  const loggedInUser = req.session.user_id;
  const templateVars = {
    user: users[loggedInUser],
  };
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL] === undefined) {
    return res.render("u_index", templateVars);
  }
  res.redirect(urlDatabase[shortURL]["longURL"]);
});

app.get("/register", (req, res) => {
  const loggedInUser = req.session.user_id;
  const templateVars = {
    user: users[loggedInUser],
    message: undefined
  };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const loggedInUser = req.session.user_id;
  const templateVars = {
    user: users[loggedInUser],
    message: undefined
  };
  res.render("urls_login", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = {
    longURL: "http://" + req.body.longURL,
    userID: req.session.user_id,
  };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.newURL;
  const loggedInUser = req.session.user_id;
  if (loggedInUser === undefined) {
    res.send("Please Login first.\n");
  } else if (urlDatabase[req.params.shortURL] === undefined) {
    res.send("Corresponding record doesn't exit. Nothing to edit.\n");
  } else if (urlDatabase[req.params.shortURL]["userID"] !== loggedInUser) {
    res.send(
      "You are not the creator of this record. You are not allowed to edit this record.\n"
    );
  } else {
    urlDatabase[shortURL]["longURL"] = "http://" + longURL;
    res.redirect(`/urls`);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const loggedInUser = req.session.user_id;
  if (loggedInUser === undefined) {
    res.send("Please Login first.\n");
  } else if (urlDatabase[req.params.shortURL] === undefined) {
    res.send("Corresponding record doesn't exit. Nothing to delete.\n");
  } else if (urlDatabase[req.params.shortURL]["userID"] !== loggedInUser) {
    res.send(
      "You are not the creator of this record. You are not allowed to delete this record.\n"
    );
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect(`/urls`);
  }
});

app.post("/login", (req, res) => {
  const loggedInUser = req.session.user_id;
  const templateVars = {
    user: users[loggedInUser],
    message: undefined
  };
  const username = req.body.email;
  const password = req.body.password;
  const user = findUser(username, users);
  if (user === undefined) {
    // res.status(403);
    templateVars.message = "Please register first.\n";
    res.render("urls_login", templateVars);
  } else if (
    user !== undefined &&
    bcrypt.compareSync(password, user.password)
  ) {
    req.session.user_id = user.id;
    res.redirect(`/urls`);
  } else {
    // res.status(403)
    templateVars.message = "wrong password\n";
    res.render("urls_login", templateVars);
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});

app.post("/register", (req, res) => {
    const loggedInUser = req.session.user_id;
    const templateVars = {
      user: users[loggedInUser],
      message: undefined
    };
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "") {
    // res.status(400);
    templateVars.message = "Can't be empty email or password.\n";
    res.render('urls_register', templateVars);
  }
  if (findUser(email, users) !== undefined) {
    // res.status(400);
    templateVars.message = "Email registered already.\n";
    res.render('urls_register', templateVars);
  } else {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = generateRandomString(6);
    users[newUser] = { id: newUser, email: email, password: hashedPassword };
    req.session.user_id = newUser;
    res.redirect(`/urls`);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
