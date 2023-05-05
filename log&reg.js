const express = require("express");
const router = express.Router();
const path = require("path");
const bodyParser = require("body-parser");
const fs = require("fs");
const acc = require("../util/acc_num");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { scan } = require("micromatch");
const DT = require("../util/sandbox/date_time");

require("dotenv").config();

router.use(cookieParser());
router.use(bodyParser.urlencoded({ extended: true }));

const filepath = path.join(__dirname, "..", "views");

const usersdatafile = path.join(__dirname, "..", "Json_Files", "userdata.json");
const savingsdatafile = path.join(
  __dirname,
  "..",
  "JSon_Files",
  "savings.json"
);
const creditcardfile = path.join(
  __dirname,
  "..",
  "Json_Files",
  "creditcard.json"
);
router.post("/adduser", (req, res) => {
  const { fullname, username, pno, password, email, address } = req.body;
  // console.log(req.body);

  const accno = acc.createaccountnum();

  const user = {
    fullname: fullname,
    username: username,
    pno: pno,
    password: password,
    email: email,
    address: address,
    accnum: accno,
  };

  // console.log(user);

  const getUsers = () => {
    try {
      const data = fs.readFileSync(usersdatafile);
      return data.length === 0 ? [] : JSON.parse(data);
    } catch (err) {
      return [];
    }
  };

  const users = getUsers();

  // console.log(users);

  users.push(user);

  fs.writeFile(usersdatafile, JSON.stringify(users), (err) => {
    if (err) throw err;
    res.redirect("/");
  });
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const data = fs.readFileSync(usersdatafile);

  const users = JSON.parse(data);

  const user = users.find((user) => {
    return user.username === username && user.password === password;
  });

  if (user) {
    const token = jwt.sign(
      { fullname: user.fullname, email: user.email, accno: user.accnum },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1hr" }
    );

    res.cookie("token", token, { httpOnly: true, secure: true });
    res.redirect("/dashboard");
  } else {
    res.sendStatus(401);
  }
});

const validate = (req, res, next) => {
  const cooktoken = req.cookies.token;

  try {
    const decoded = jwt.verify(cooktoken, process.env.ACCESS_TOKEN_SECRET);
    const username = decoded.username;
    next();
  } catch (err) {
    res.redirect("/?error=Session%20timed%20out!");
  }
};

router.get("/dashboard", validate, (req, res) => {
  const cookie = req.cookies.token;
  const decoded = jwt.verify(cookie, process.env.ACCESS_TOKEN_SECRET);

  const fullname = decoded.fullname;

  const html = fs.readFileSync(filepath + "/dashboard.html", "utf-8");

  const change = html.replace(
    `<p id="element"></p>`,
    `<p id="element">${fullname}</p>`
  );

  res.send(change);
});

router.get("/register", (req, res) => {
  res.sendFile(filepath + "/register.html");
});

router.get("/savings", validate, (req, res) => {
  const cookie = req.cookies.token;
  const decoded = jwt.verify(cookie, process.env.ACCESS_TOKEN_SECRET);
  const accnum = decoded.accno;

  const fullname = decoded.fullname;
  // console.log(accnum);

  const data = fs.readFileSync(savingsdatafile);

  const transactions = JSON.parse(data);

  // console.log(transactions);

  const usertransactions = transactions.filter(
    (transaction) => transaction.accnum === accnum
  );

  // console.log(usertransactions);

  let totalbalance = 0;

  const transactionswithbalance = usertransactions.map((transaction) => {
    if (transaction.type === "credit") {
      totalbalance += transaction.amount;
    } else {
      totalbalance -= transaction.amount;
    }

    return { ...transaction, balance: totalbalance };
  });

  res.render(filepath + "/savings.ejs", {
    data: transactionswithbalance,
    fullname: fullname,
  });

  // res.sendFile(filepath + "/");
});

router.post("/transfer", validate, (req, res) => {
  // // const fullname = decoded.fullname;
  // const data1 = fs.readFileSync(usersdatafile);
  // const userdata = JSON.parse(data1);

  const userbalance = req.body.userbalance;

  console.log(req.body);

  // const usertransactions = userdata.filter(
  //   (transaction) => transaction.accnum === accnum
  // );

  const transferaccnum = req.body.accnum;
  let transferamount = req.body.amount;
  transferamount = Number(transferamount);

  console.log(transferaccnum);
  console.log(transferamount);

  const data2 = fs.readFileSync(usersdatafile);
  const userdata = JSON.parse(data2);

  console.log(userdata);

  const transfertransactions = userdata.filter(
    (transaction) => transaction.accnum === transferaccnum
  );

  console.log(transfertransactions);

  console.log("Before If");

  if (transfertransactions.length != 0) {
    if (transferamount <= userbalance) {
      const cookie = req.cookies.token;
      const decoded = jwt.verify(cookie, process.env.ACCESS_TOKEN_SECRET);

      const accnum = decoded.accno;

      const data1 = fs.readFileSync(savingsdatafile);
      const transactions = JSON.parse(data1);

      const { date, time } = DT.dateAndTime();

      const transaction1 = {
        accnum: transferaccnum,
        type: "credit",
        amount: transferamount,
        time: time,
        date: date,
      };

      const transaction2 = {
        accnum: accnum,
        type: "debit",
        amount: transferamount,
        time: time,
        date: date,
      };

      transactions.push(transaction1, transaction2);

      fs.writeFile(savingsdatafile, JSON.stringify(transactions), (err) => {
        if (err) throw err;
        res.redirect("/savings");
      });
    }
  }
});

router.post("/deposit", validate, (req, res) => {
  const cookie = req.cookies.token;
  const decoded = jwt.verify(cookie, process.env.ACCESS_TOKEN_SECRET);

  const accnum = decoded.accno;
  //getting user balance

  // const userbalance = req.body.userbalance;
  let withdrawamount = req.body.amount;
  withdrawamount = Number(withdrawamount);

  const data = fs.readFileSync(savingsdatafile);
  const transactions = JSON.parse(data);

  const usertransactions = transactions.filter(
    (transaction) => transaction.accnum === accnum
  );

  const { date, time } = DT.dateAndTime();

  // if (usertransactions.length != 0) {
  const transaction1 = {
    accnum: accnum,
    type: "credit",
    amount: withdrawamount,
    time: time,
    date: date,
  };

  transactions.push(transaction1);
  fs.writeFile(savingsdatafile, JSON.stringify(transactions), (err) => {
    if (err) throw err;
    res.redirect("/savings");
  });
  // }
});

router.post("/withdraw", (req, res) => {
  const cookie = req.cookies.token;
  const decoded = jwt.verify(cookie, process.env.ACCESS_TOKEN_SECRET);

  const accnum = decoded.accno;
  //getting user balance

  // const userbalance = req.body.userbalance;
  let withdrawamount = req.body.amount;
  withdrawamount = Number(withdrawamount);

  const data = fs.readFileSync(savingsdatafile);
  const transactions = JSON.parse(data);

  const usertransactions = transactions.filter(
    (transaction) => transaction.accnum === accnum
  );

  const { date, time } = DT.dateAndTime();

  // if (usertransactions.length != 0) {
  const transaction1 = {
    accnum: accnum,
    type: "debit",
    amount: withdrawamount,
    time: time,
    date: date,
  };

  transactions.push(transaction1);
  fs.writeFile(savingsdatafile, JSON.stringify(transactions), (err) => {
    if (err) throw err;
    res.redirect("/savings");
  });
});

router.get("/creditcard", (req, res) => {
  const cookie = req.cookies.token;
  const decoded = jwt.verify(cookie, process.env.ACCESS_TOKEN_SECRET);

  const accnum = decoded.accno;
  const fullname = decoded.fullname;

  const data = fs.readFileSync(creditcardfile);

  const cards = JSON.parse(data);

  const usercards = cards.filter((card) => card.accnum === accnum);

  // console.log(usercards);

  const usercardsdata = usercards.map((card) => {
    const card1 = card.cardnumber.slice(0, 4);
    const card2 = card.cardnumber.slice(4, 8);
    const card3 = card.cardnumber.slice(8, 12);
    const card4 = card.cardnumber.slice(12, 16);

    // console.log(card1);
    // console.log(card2);
    // console.log(card3);
    // console.log(card4);

    return {
      ...card,
      card1: card1,
      card2: card2,
      card3: card3,
      card4: card4,
      fullname: fullname,
    };
  });

  console.log(usercardsdata);

  res.render(filepath + "/creditcard.ejs", { data: usercardsdata });
});

router.post("/addcard", (req, res) => {
  const cookie = req.cookies.token;
  const decoded = jwt.verify(cookie, process.env.ACCESS_TOKEN_SECRET);

  const data = fs.readFileSync(creditcardfile);

  const creditcards = JSON.parse(data);

  const accnum = decoded.accno;

  const { cardnum, limit, exp, duedate, type, cvv } = req.body;

  const carddetails = {
    accnum: accnum,
    cardnumber: cardnum,
    expiry: exp,
    cvv: cvv,
    limit: limit,
    duedate: duedate,
    type: type,
  };
  creditcards.push(carddetails);

  fs.writeFile(creditcardfile, JSON.stringify(creditcards), (req, res) => {
    if (err) throw err;
    res.render(filepath + "/creditcard.ejs");
  });
});

router.get("/loans", (req, res) => {
  res.render(filepath + "/loans.ejs");
});

router.get("/investments", (req, res) => {
  res.sendFile(filepath + "/investments.html");
});

router.get("/", (req, res) => {
  //   console.log(__dirname);
  //   console.log(filepath);
  res.sendFile(filepath + "/login.html");
});

module.exports = router;
