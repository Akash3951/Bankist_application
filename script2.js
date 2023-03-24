"use strict";
import "core-js/stable";
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2020-05-27T17:01:17.194Z",
    "2020-07-11T23:36:17.929Z",
    "2020-07-12T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2022-11-24T14:43:26.374Z",
    "2022-11-23T18:49:59.371Z",
    "2022-11-20T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

//ELEMENTS
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance_value");
const labelSumIn = document.querySelector(".summary_value--in");
const labelSumOut = document.querySelector(".summary_value--out");
const labelSumInterest = document.querySelector(".summary_value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login_btn");
const btnTransfer = document.querySelector(".form_btn--transfer");
const btnLoan = document.querySelector(".form_btn--loan");
const btnClose = document.querySelector(".form_btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login_input--user");
const inputLoginPin = document.querySelector(".login_input--pin");
const inputTransferTo = document.querySelector(".form_input--to");
const inputTransferAmount = document.querySelector(".form_input--amount");
const inputLoanAmount = document.querySelector(".form_input--loan-amount");
const inputCloseUsername = document.querySelector(".form_input--user");
const inputClosePin = document.querySelector(".form_input--pin");

//FORMATING MOVEMENTS DATE.
const formatMovementsDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24)));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return "today";
  if (daysPassed === 1) return "yesterday";
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const year = date.getFullYear();
    return new Intl.DateTimeFormat(locale).format(date);
  }
};

//FORMATING CURRENCY AND NUMBERS.
const formatCurr = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
};

//ADDING MOVEMENTS IN THE MOVEMENT CONTAINER
const displayMovements = function (accn, sort = false) {
  containerMovements.innerHTML = "";

  //SORTING
  const movs = sort
    ? accn.movements.slice().sort((a, b) => a - b)
    : accn.movements;

  accn.movements.forEach(function (mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal";

    //ADDING DATE TO EVERY MOVEMENTS.
    const date = new Date(accn.movementsDates[i]);
    const displayDate = formatMovementsDate(date, accn.locale);

    //FORMATING MOVEMENTS NUMBERS
    const formattedMov = formatCurr(mov, accn.locale, accn.currency);

    const html = `
    <div class="movement_row">
      <div class="movement_type movement_type--${type}">${i + 1} ${type}</div>
      <div class="movement_date">${displayDate}</div>
      <div class="movement_value">${formattedMov}</div>
    </div>
  `;
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

//CALCULATING BALANACE
const calcDisplayBalance = function (accn) {
  const balance = accn.movements.reduce((acc, mov) => {
    return acc + mov;
  }, 0);
  labelBalance.textContent = formatCurr(balance, accn.locale, accn.currency);
  accn.balance = balance;
};

//CREATING USERNAME
const createUserName = function (accs) {
  accs.forEach((acc) => {
    acc.userName = acc.owner
      .toLowerCase()
      .split(" ")
      .map((name) => {
        return name[0];
      })
      .join("");
  });
};
createUserName(accounts);

//UPDATING SUMMARY VALUES
const calcDisplaySummary = function (accn) {
  //CALCULATING INCOMES
  const incomes = accn.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov);
  labelSumIn.textContent = formatCurr(incomes, accn.locale, accn.currency);

  // CALCULATING OUTGOINGS
  const out = accn.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCurr(
    Math.abs(out),
    accn.locale,
    accn.currency
  );

  //CALCULATIING INTERESTS
  const interest = accn.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * accn.interestRate) / 100)
    .filter((int) => int >= 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCurr(
    interest,
    accn.locale,
    accn.currency
  );
};

//UPDATE UI FUNCTION
const updateUI = function (accn) {
  displayMovements(accn);
  calcDisplayBalance(accn);
  calcDisplaySummary(accn);
};

//ADDING LOGOUT TIMER
const setLogoutTimer = function () {
  let time = 60 * 5;
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    //IN EACH CALL PRINT THE REMAINING TIME TO THE UI.
    labelTimer.textContent = `${min}:${sec}`;

    //DECREASE TIME BY 1SEC.
    time--;

    //WHEN 0 SECOND STOP TIMER AND LOGOUT USER.
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = "Log in to get started";
      containerApp.style.opacity = 0;
    }
  };
  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

let currentAccount, timer;
//ADDING EVENT HANDLERS ON LOGIN BUTTON
btnLogin.addEventListener("click", (e) => {
  e.preventDefault();
  currentAccount = accounts.find(
    (accn) => accn.userName === inputLoginUsername.value
  );
  if (currentAccount?.pin === +inputLoginPin.value) {
    //DISPLAY UI AND MESSAGE
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(" ")[0]
    }`;
    containerApp.style.opacity = 100;

    //ADDING CURRENT DATE AND TIME
    // const now = new Date();
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);

    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

    const now = new Date();
    const option = {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      // weekday: 'long',
    };

    // const locale = navigator.language;
    // console.log(locale);

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      option
    ).format(now);

    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur();

    //UPDATE UI
    updateUI(currentAccount);

    //TIMER
    if (timer) clearInterval(timer);
    timer = setLogoutTimer();
  }
});

//EVENT HANDLER ON TRANSFER BUTTON
btnTransfer.addEventListener("click", (e) => {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAccn = accounts.find(
    (accn) => inputTransferTo.value === accn.userName
  );
  inputTransferAmount.value = inputTransferTo.value = "";
  inputTransferAmount.blur();
  if (
    amount > 0 &&
    receiverAccn &&
    currentAccount.balance >= amount &&
    receiverAccn.userName !== currentAccount.userName
  ) {
    currentAccount.movements.push(-amount);
    receiverAccn.movements.push(amount);

    //ADDING DATE AFTER TRANSFER
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAccn.movementsDates.push(new Date().toISOString());

    //UPDATE UI
    updateUI(currentAccount);

    //RESET TIMER
    clearInterval(timer);
    timer = setLogoutTimer();
  }
});

//EVENT HANDLER ON LOAN BUTTON
btnLoan.addEventListener("click", (e) => {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov >= amount * 0.1)
  ) {
    setTimeout(function () {
      //ADD MOVEMENT
      currentAccount.movements.push(amount);

      //ADDING DATE AFTER LOAN
      currentAccount.movementsDates.push(new Date().toISOString());

      //UPDATE UI
      updateUI(currentAccount);
    }, 3000);
  }

  //RESET TIMER
  clearInterval(timer);
  timer = setLogoutTimer();

  inputLoanAmount.value = "";
  inputLoanAmount.blur();
});

//EVENT HANDLER ON CLOSE BUTTON
btnClose.addEventListener("click", (e) => {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentAccount.userName &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      (accn) => accn.userName === currentAccount.userName
    );
    accounts.splice(index, 1);

    //HIDE UI
    containerApp.style.opacity = 0;
  }
  inputClosePin.value = inputCloseUsername.value = "";
  inputClosePin.blur();
});

//EVENT HANDLER ON SORT BUTTON
let sorted = true;
btnSort.addEventListener("click", (e) => {
  e.preventDefault();
  displayMovements(currentAccount.movements, sorted);
  sorted = !sorted;
});

import "core-js/stable";
