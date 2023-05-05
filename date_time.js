exports.dateAndTime = () => {
  const timestamp = new Date();

  let year = timestamp.getFullYear();
  let date = timestamp.getDate();
  let hours = timestamp.getHours();
  let mins = timestamp.getMinutes();
  let sec = timestamp.getSeconds();
  let mon = timestamp.getMonth();

  if (date < 10) {
    date += "0";
  }
  if (hours < 10) {
    hours = "0" + hours;
  }
  if (mins < 10) {
    mins = "0" + mins;
  }
  if (sec < 10) {
    sec = "0" + sec;
  }
  if (mon < 10) {
    mon = "0" + mon;
  }

  const time = hours + ":" + mins + ":" + sec;
  const datee = year + "-" + mon + "-" + date;
  return { date: datee, time: time };
};
