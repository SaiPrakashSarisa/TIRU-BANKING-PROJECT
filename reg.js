const fullname_exp = /^[A-Za-z]+(?:\s[A-Za-z]+)+$/;
const username_exp = /^[\S][a-zA-Z\s]+$/;
const pno_exp = /^[6-9]{1}[0-9]{9}$/;
const password_exp = /[a-zA-z0-9]$/;
const email_exp = /[a-zA-Z]+@[A-Za-z]+\.[a-zA-Z]{2,4}$/;
const address_exp = /[a-zA-Z]+[0-9a-zA-Z||0-9]+$/;

function namevalidation() {
  let name = document.getElementById("fullname").value;
  //   console.log(name);
  if (fullname_exp.test(name)) {
    document.getElementById("nameerror").innerHTML = "";
  } else {
    document.getElementById("nameerror").innerHTML =
      "Name must only contain letters!";
  }
}

function uservalidation() {
  let username = document.getElementById("username").value;
  //   console.log(name);
  if (username_exp.test(username)) {
    document.getElementById("usererror").innerHTML = "";
  } else {
    document.getElementById("usererror").innerHTML = "Enter valid username!";
  }
}

function passwordvalidation() {
  let pwd = document.getElementById("password").value;
  //   console.log(name);
  if (password_exp.test(pwd)) {
    document.getElementById("passworderror").innerHTML = "";
  } else {
    document.getElementById("passworderror").innerHTML =
      "Enter valid password!";
  }
}

function repasswordvalidation() {
  let pwdone = document.getElementById("password").value;
  console.log(pwdone);
  let pwdtwo = document.getElementById("re-password").value;
  console.log(pwdtwo);
  //   console.log(name);
  if (pwdone === pwdtwo) {
    document.getElementById("repasserror").innerHTML = "";
    document.getElementById("regbut").disabled = false;
  } else {
    document.getElementById("repasserror").innerHTML =
      "Passwords doesnt match!";
    document.getElementById("regbut").disabled = true;
  }
}

function emailvalidation() {
  let mail = document.getElementById("email").value;
  //   console.log(name);
  if (email_exp.test(mail)) {
    document.getElementById("emailerror").innerHTML = "";
  } else {
    document.getElementById("emailerror").innerHTML =
      "Enter valid email address!";
  }
}

function pnovalidation() {
  let pno = document.getElementById("pno").value;
  if (pno_exp.test(pno)) {
    document.getElementById("pnoerror").innerHTML = "";
  } else {
    document.getElementById("pnoerror").innerHTML = "Enter valid Phone Number!";
  }
}

function addressvalidation() {
  let address = document.getElementById("address").value;
  //   console.log(name);
  if (address_exp.test(address)) {
    document.getElementById("addresserror").innerHTML = "";
  } else {
    document.getElementById("addresserror").innerHTML = "Enter valid address!";
  }
}

function hello() {
  document.getElementById("wow").innerHTML = "Hello There!";
}
