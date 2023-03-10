// alert('howdy!');

const dayLocale = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const monthLocale = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'Jule',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const daydateEl = document.getElementById('daydate');
const dayEl = daydateEl.children[0];
const dateEl = daydateEl.children[1];
const monthEl = daydateEl.children[2];
const yearEl = daydateEl.children[3];

const clockEl = document.getElementById('clk');
const hourEl = clockEl.children[0];
const minuteEl = clockEl.children[2];
const secondEl = clockEl.children[3].children[0];
const milisecondEl = clockEl.children[3].children[1];

const setDateTime = setInterval(function () {
  var d = new Date();
  currentTime = {
    Hour: String(d.getHours()).padStart(2, '0'),
    Minute: String(d.getMinutes()).padStart(2, '0'),
    Second: String(d.getSeconds()).padStart(2, '0'),
    Milisecond: String(Math.trunc(d.getMilliseconds() / 10)).padStart(2, '0'),
  };

  currentDate = {
    Day: d.getDay(),
    Date: d.getDate(),
    Month: d.getMonth(),
    Year: d.getFullYear(),
  };

  if (currentDate.Date !== dateEl.innerText) {
    dayEl.innerText = dayLocale[currentDate.Day];
    dateEl.innerText = currentDate.Date;
    monthEl.innerText = monthLocale[currentDate.Month];
    yearEl.innerText = currentDate.Year;
  }

  hourEl.innerText = currentTime.Hour;
  minuteEl.innerText = currentTime.Minute;
  secondEl.innerText = currentTime.Second;
}, 50);
