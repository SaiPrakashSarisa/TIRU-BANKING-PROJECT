const { rcompareIdentifiers } = require("semver");

exports.createaccountnum = () => {
  const timestamp = new Date();

  let year = timestamp.getFullYear();
  let date = timestamp.getDate();
  let hours = timestamp.getHours();
  let mins = timestamp.getMinutes();
  let sec = timestamp.getSeconds();

  if (date < 10) {
    date += "0";
  }
  if (hours < 10) {
    hours = hours + "0";
  }
  if (mins < 10) {
    mins = mins + "0";
  }
  if (sec < 10) {
    sec = sec + "0";
  }

  const accnum = "" + year + date + hours + mins + sec;

  return accnum;
};
