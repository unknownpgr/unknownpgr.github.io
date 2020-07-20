function dateFormat(d, displayTime = false) {
  let ret =
    ("0" + d.getDate()).slice(-2) +
    "-" +
    ("0" + (d.getMonth() + 1)).slice(-2) +
    "-" +
    d.getFullYear();
  if (displayTime) {
    ret +=
      " " +
      ("0" + d.getHours()).slice(-2) +
      ":" +
      ("0" + d.getMinutes()).slice(-2);
  }
  return ret;
}

export default dateFormat;
