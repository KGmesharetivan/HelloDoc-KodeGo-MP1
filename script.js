let arrAppointment;

$(function () {
  if (typeof Storage !== "undefined") {
    arrAppointment = localStorage.getItem("tbAppointment");
    arrAppointment = JSON.parse(arrAppointment);
    $("#btn_clear_storage").prop("disabled", false);
    $(`#btn_clear_storage`).show();
    if (arrAppointment == null || arrAppointment == "[null]") {
      $("#btn_clear_storage").prop("disabled", true);
      $(`#btn_clear_storage`).hide();
      arrAppointment = [];
      arrAppointment.push(JSON.parse(localStorage.getItem("tbAppointment")));
      localStorage.setItem("tbAppointment", JSON.stringify(arrAppointment));
    }
  } else {
    iziToast.warning({
      title: "Caution",
      message:
        "Sorry, but your web browser do not support localstorage, therefore this app won't work as it suposed to. Try updating your browser first.",
      overlay: true,
      zindex: 999,
      position: "center",
      timeout: 20000,
    });
  }

  $('[data-toggle="popover"]').popover();

  print(false, true);
});

let today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();

let months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

showCalendar(currentMonth, currentYear);

function showCalendar(month, year) {
  let firstDay = new Date(year, month).getDay();
  let daysInMonth = new Date(year, month + 1, 0).getDate();
  let tbl = document.getElementById("days");
  tbl.innerHTML = "";

  $("#month").text(months[month]);
  $("#month").data("val", month);
  $("#year").text(year);

  let date = 1;

  for (let i = 0; i < 6; i++) {
    let row = document.createElement("tr");
    row.className = `week week_${i}`;

    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < firstDay) {
        let cell = document.createElement("td");
        let cellText = document.createTextNode("");
        cell.classList.add("inactive");
        cell.classList.add("disabled");
        cell.classList.add("bg-secondary");
        cell.setAttribute("data-day", date);
        cell.appendChild(cellText);
        row.appendChild(cell);
      } else if (date > daysInMonth) {
        break;
      } else {
        let cell = document.createElement("td");
        let cellText = document.createTextNode(date);

        if (
          date === today.getDate() &&
          year === today.getFullYear() &&
          month === today.getMonth()
        ) {
          $(cell).addClass(
            "text-white active bg-primary today text-center font-weight-bold"
          );
          $(cell).attr("data-day", date);
          put_badges_new(cell);
        } else if (
          date < today.getDate() &&
          year <= today.getFullYear() &&
          month <= today.getMonth()
        ) {
          $(cell).addClass(
            "inactive disabled text-white bg-light text-muted text-center font-weight-light"
          );
          $(cell).attr("data-day", date);
          $(cell).attr("disabled", "disabled");
        } else if (
          date >= today.getDate() &&
          year >= today.getFullYear() &&
          month >= today.getMonth()
        ) {
          $(cell).addClass(
            "active text-dark text-center font-weight-normal bg-white"
          );
          $(cell).attr("data-day", date);
          put_badges_new(cell);
        } else {
          $(cell).addClass("text-center text-secondary bg-white");
        }

        cell.appendChild(cellText);
        row.appendChild(cell);
        date++;
      }
    }
    tbl.appendChild(row);
  }
}

$("#days td.active").on("click", function () {
  // Remove background classes from all active days
  $("#days td.active").removeClass(
    "text-white active bg-primary today text-center font-weight-bold"
  );

  // Set the Date Input
  $("#date").val(
    $(this).text() +
      "/" +
      ($("#month").data("val") + 1) +
      "/" +
      $("#year").text()
  );

  // Enable or disable the Submit button based on input fields
  if (is_empty()) {
    $("#submit").prop("disabled", true);
  } else {
    $("#submit").prop("disabled", false);
  }

  // Focus handling
  if ($("#description").val() == null || $("#description").val() == "") {
    $("#description").focus();
  } else {
    $("#submit").focus();
  }

  // Add background classes to the clicked day
  $(this).removeClass("bg-white");
  $(this).removeClass("text-dark");
  $(this).addClass(
    "text-white active bg-primary today text-center font-weight-bold"
  );

  // Update badges for all active days
  $("#days td.active").each(function () {
    put_badges_new(this);
  });

  updateAppointmentButtonState();
});

$("#days td.inactive").on("click", function () {
  iziToast.error({
    title: "Error",
    message: "You can make appointments just today and foward",
    overlay: true,
    zindex: 999,
    position: "center",
    timeout: 3000,
  });
});

function make_appointment() {
  if (is_empty() == false) {
    if (is_past_date() == false) {
      compare();
      if (is_overlap() == false) {
        var appointment = {
          id:
            $("#date").inputmask("unmaskedvalue") +
            $("#start_time").inputmask("unmaskedvalue") +
            $("#end_time").inputmask("unmaskedvalue"),
          date: $("#date").val(),
          description: $("#description").val(),
          start_time: $("#start_time").val(),
          end_time: $("#end_time").val(),
        };

        SaveDataToLocalStorage(appointment);
        $("#btn_clear_storage").prop("disabled", false);
        $(`#btn_clear_storage`).show();
        print();

        clear_input();
        iziToast.success({
          title: "Success",
          message: "Appointment created",
        });
      } else {
        clear_input();
        iziToast.error({
          title: "Error",
          message: "This appointment is overlapping another one",
          overlay: true,
          zindex: 999,
          position: "center",
          timeout: 3000,
        });
      }
    } else {
      iziToast.error({
        title: "Error",
        message: "Selected date is in the past",
        overlay: true,
        zindex: 999,
        position: "center",
        timeout: 3000,
      });
    }
  } else {
    iziToast.error({
      title: "Error",
      message: "All input fields are needed in order to make an appointment",
      overlay: true,
      zindex: 999,
      position: "center",
      timeout: 3000,
    });
  }
}

function updateAppointmentButtonState() {
  if (is_empty() || is_past_date() || is_overlap()) {
    $("#submit").prop("disabled", true);
  } else {
    $("#submit").prop("disabled", false);
  }
}

$("#date, #description").on("input change", function () {
  updateAppointmentButtonState();
});

// $("#end_time, #start_time").focusout(function () {
//   compare();
// });

$("#end_time, #start_time, #date").keyup(function () {
  if (is_empty() == true) {
    $("#submit").prop("disabled", true);
  } else {
    $("#submit").prop("disabled", false);
  }
});

function clear_input() {
  $("#date").val("");
  $("#description").val("");
  $("#start_time").val("");
  $("#end_time").val("");
  $("#submit").prop("disabled", true);
}

function is_empty() {
  if (
    $("#date").val() == null ||
    $("#date").val() == "" ||
    $("#description").val() == null ||
    $("#description").val() == ""
  ) {
    return true;
  }
  return false;
}

function compare() {
  var startTime = Date.parse(get_Date($("#start_time").val()));
  var endTime = Date.parse(get_Date($("#end_time").val()));

  if (startTime > endTime) {
    $("#submit").prop("disabled", true);
    clear_input();
    iziToast.warning({
      title: "Caution",
      message: "Start Time is greater than end time",
      overlay: true,
      zindex: 999,
      position: "center",
      timeout: 2000,
    });
  }
  if (startTime == endTime) {
    $("#submit").prop("disabled", true);
    clear_input();
    iziToast.warning({
      title: "Caution",
      message: "Start Time equals end time",
      overlay: true,
      zindex: 999,
      position: "center",
      timeout: 2000,
    });
  }
}

function is_past_date() {
  var today = new Date();
  var arrDate = GetDateInput();
  var selected_date = new Date(
    arrDate[2],
    arrDate[1] - 1,
    arrDate[0],
    0,
    0,
    0,
    0
  );
  if (selected_date < today) {
    return true;
  }
  return false;
}

function GetDateInput() {
  var date = $("#date").val();
  console.log("Date input value:", date);

  if (date === "") {
    // Handle the case when date input is empty by returning an array with empty strings
    return ["", "", ""];
  }

  return date.split("/");
}

function is_overlap(sTime, eTime) {
  if (sTime == undefined || eTime == undefined) {
    sTime = $("#start_time").val();
    eTime = $("#end_time").val();
  }
  if (+get_Date(sTime) < +get_Date(eTime)) {
    var timeList = localStorage.getItem("tbAppointment");
    if (timeList == null || timeList == "[null]") {
      return false;
    } else {
      timeList = JSON.parse(timeList);
    }

    for (let i = 0; i < timeList.length; i++) {
      const element = timeList[i];
      if (element.date == $("#date").val()) {
        if (
          (sTime > element.start_time && sTime < element.end_time) ||
          (eTime > element.start_time && eTime < element.end_time) ||
          (sTime < element.start_time && eTime >= element.end_time) ||
          (sTime <= element.start_time && eTime > element.end_time) ||
          (sTime == element.start_time && eTime == element.end_time)
        ) {
          return true;
        }
      }
    }
    return false;
  } else {
    return false;
  }
}

function get_Date(time, arrDate = false) {
  if (arrDate == false || arrDate.includes("")) {
    // Handle the case when date input is empty or contains empty strings
    return null;
  }

  console.log("arrDate before creating Date object:", arrDate);
  var date = new Date(arrDate[2], arrDate[1] - 1, arrDate[0], 0, 0, 0, 0);
  var _t = time.split(":");
  date.setHours(_t[0], _t[1], 0, 0);
  return date;
}

function print(clear = false, init = false, edit = false) {
  if (clear != false) {
    $("#appointment_list > tbody").html("");
    return true;
  }
  var data = localStorage.getItem("tbAppointment");
  data = JSON.parse(data);
  if (data[0] !== null) {
    $("#appointment_list > tbody").html("");
    $(`.week td.active`).removeClass("badge1");
    $(`.week td.active`).removeAttr("data-badge");
    let date = [];
    if (data.length !== 0) {
      for (let i = 0; i < data.length; i++) {
        const element = data[i];
        $("#appointment_list > tbody").append(
          `
              <tr>
                  <td class="text-center align-middle">${element.date}</td>
                  <td class="text-center align-middle">${element.description}</td>
                  <td class="text-center align-middle">${element.start_time}</td>
                  <td class="text-center align-middle">${element.end_time}</td>
                  <td class="text-center align-middle">
                      <button class="btn btn-primary btn-sm " onclick="edit_appointment(${element.id})"><i class="fas fa-pencil-alt"></i></button>
                      <button class="btn btn-danger btn-sm " onclick="delete_appointment(${element.id})"><i class="fas fa-trash"></i></button>
                  </td>
              </tr>
              `
        );
        let currDate = element.date.split("/");
        date.push(currDate[0]);
      }
      date = [...new Set(date)];
      date.forEach((element) => {
        let cell = document.querySelector(
          `.week > td.active[data-day='${element}']`
        );
        put_badges_new(cell);
      });
    } else {
      let element = document.querySelector(`.week > td.active[data-badge]`);
      if (element !== null) {
        put_badges_new(element);
      }
    }
  }
}

function SaveDataToLocalStorage(data) {
  var a = [];
  a = JSON.parse(localStorage.getItem("tbAppointment"));

  var a = a.filter(function (el) {
    return el != null;
  });

  a.push(data);
  a.sort(function (sTime1, sTime2) {
    let temp3 = parseInt(sTime1.date.slice(0, 2));
    let temp4 = parseInt(sTime2.date.slice(0, 2));
    let temp1 = Date.parse(get_Date(sTime1.start_time));
    let temp2 = Date.parse(get_Date(sTime2.start_time));

    if (temp3 > temp4) return 1;
    if (temp3 < temp4) return -1;
    if (temp1 > temp2) return 1;
    if (temp1 < temp2) return -1;
  });
  localStorage.setItem("tbAppointment", JSON.stringify(a));
}

function clear_storage() {
  localStorage.clear();
  var arrAppointment = [];
  arrAppointment.push(JSON.parse(localStorage.getItem("tbAppointment")));
  localStorage.setItem("tbAppointment", JSON.stringify(arrAppointment));
  $("#btn_clear_storage").prop("disabled", true);
  $(`#btn_clear_storage`).hide();
  $(`.week td.active`).removeClass("badge1");
  $(`.week td.active`).removeAttr("data-badge");
  print(true);
  iziToast.success({
    title: "Success",
    message: "All appointments deleted",
  });
}

function edit_appointment(id) {
  var data = localStorage.getItem("tbAppointment");
  data = JSON.parse(data);
  if (data[0] !== null) {
    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      if (element.id == id) {
        $("#date").val(element.date);
        $("#description").val(element.description);
        $("#start_time").val(element.start_time);
        $("#end_time").val(element.end_time);
        $("#submit").prop("disabled", false);
        delete_appointment(id);
      }
    }
  }
}

function delete_appointment(id) {
  var data = localStorage.getItem("tbAppointment");
  data = JSON.parse(data);
  if (data[0] !== null) {
    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      if (element == null) {
        data.splice(i, 1);
      }
      if (element.id == id) {
        data.splice(i, 1);
      }
    }
    data = data.filter(function (el) {
      return el != null;
    });

    localStorage.setItem("tbAppointment", JSON.stringify(data));
    print(false, false, true);
    iziToast.success({
      title: "Success",
      message: "Appointment deleted",
    });
  }
}

function put_badges_new(cell) {
  if (cell && cell.getAttribute("data-day")) {
    var data = localStorage.getItem("tbAppointment");
    data = JSON.parse(data);
    if (data[0] !== null) {
      let counter = 0;
      for (let i = 0; i < data.length; i++) {
        const element = data[i];
        if (cell.getAttribute("data-day") == element.date.slice(0, 2)) {
          counter++;
        }
      }

      if (counter >= 1) {
        cell.classList.add("badge1");
        cell.setAttribute("data-badge", counter);
      } else {
        cell.classList.remove("badge1");
        cell.removeAttribute("data-badge");
      }
    }
  }
}

function sort_database(data) {
  return data.sort(function (sTime1, sTime2) {
    let temp3 = parseInt(sTime1.date.slice(0, 1));
    let temp4 = parseInt(sTime2.date.slice(0, 1));
    let temp1 = Date.parse(get_Date(sTime1.start_time));
    let temp2 = Date.parse(get_Date(sTime2.start_time));

    if (temp3 > temp4) return 1;
    if (temp3 < temp4) return -1;
    if (temp1 > temp2) return -1;
    if (temp1 < temp2) return 1;
  });
}
