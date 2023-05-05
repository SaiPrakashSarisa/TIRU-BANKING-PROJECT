const url = new URLSearchParams(window.location.search);

const errormsg = url.get("error");

if (errormsg) {
  document.getElementById("tout").innerHTML = errormsg;
  setTimeout(() => {
    document.getElementById("tout").innerHTML = "";
  }, 3000);
}
