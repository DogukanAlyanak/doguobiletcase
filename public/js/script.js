// Developer Variables
/* summary
    need for obilet api connections
/summary */
const AuthCode = `Basic JEcYcEMyantZV095WVc3G2JtVjNZbWx1` // REd3cEIia3spV295VVc3G2FtVjNZbWx1



// General Variables
const todayDate = new Date().toLocaleDateString("fr-CA")
const tomorrow = new Date(new Date().getTime() + 86400000)
const tomorrowDate = tomorrow.toLocaleDateString("fr-CA")

var ip = "0.0.0.0";
$.getJSON("https://api.ipify.org/?format=json", function (e) {
    ip = e.ip;
});




var obUserID
var obDeviceID

var originID = 0;
var destinationID = 0;





// Remember User Variables
// Developer Variables
/* summary
    Necessary for users to reach quickly on arrival
/summary */
if (localStorage.getItem('originID') == null) {
    localStorage.setItem('originID', 0)
}
if (localStorage.getItem('destinationID') == null) {
    localStorage.setItem('destinationID', 0)
}
if (localStorage.getItem('originText') == null) {
    localStorage.setItem('originText', "")
}
if (localStorage.getItem('destinationText') == null) {
    localStorage.setItem('destinationText', "")
}
if (localStorage.getItem('journeyDate') == null) {
    localStorage.setItem('journeyDate', tomorrowDate)
}









// Create Ob Sesion
/* summary
    Necessary for session on obilet
    code is :
        1. getSesion --> ID and Device from o bilet api
        2. save id and device id to client session (local storage)
        3. if has origin write inputs to station and destination station data from client session (local storage)
        4. if empty necessary variables (origin and destination inputs) then disable to find ticket button.
/summary */
$(document).ready(function () {

    obUserID = localStorage.getItem('obUserID')
    obDeviceID = localStorage.getItem('obDeviceID')
    if (localStorage.getItem('obUserID') == null) {
        if (ip == "127.0.0.1") {
            ip = "95.70.244.43";    // Test
        }


        // Obilet GetSession
        setTimeout(() => {
            $.ajax({
                "url": "https://v2-api.obilet.com/api/client/getsession",
                "method": "POST",
                "timeout": 0,
                "headers": {
                    "Content-Type": "application/json",
                    "Authorization": AuthCode
                },
                "data": JSON.stringify({
                    "type": 1,
                    "connection": {
                        "ip-address": ip,
                        "port": "5117"
                    },
                    "browser": {
                        "name": "Chrome",
                        "version": "99.0.4844.82"
                    }
                }),
                success: function (res) {
                    obUserID = res.data["session-id"];
                    obDeviceID = res.data["device-id"];
                    localStorage.setItem("obUserID", obUserID)
                    localStorage.setItem("obDeviceID", obDeviceID)
                },
                error: function (e) {
                    console.log("error");
                    console.log(e);
                }
            });
            $(`.loading-screen`).css(`display`,`none`)
        }, 200);
    } else {
        $(`.loading-screen`).css(`display`,`none`)
    }

    $(`#originInput`).val(localStorage.getItem('originText'))
    $(`#destinationInput`).val(localStorage.getItem('destinationText'))
    $(`#journeyDepartureDate`).val(localStorage.getItem('journeyDate'))

    
    // Find Ticket Button Control
    if ($(`#destinationInput`).val() == "" || $(`#originInput`).val() == "") {
        $(`#findTicketButton`).prop("disabled", true)
    } else {
        $(`#findTicketButton`).prop("disabled", false)
    }
})



// Change Origin Input
$(document).on(`change`, `#originInput`, function () {
    let value = $(this).val()
    getBusStation(value, "origin")
    localStorage.setItem('originText', value)
})
$(document).on(`change`, `#destinationInput`, function () {
    let value = $(this).val()
    getBusStation(value, "destination")
    localStorage.setItem('destinationText', value)
})



// CHANGE STATION
$(document).on(`click`, `#changeStationBtn`, function () {
    let phvalue1 = $(`#originInput`).attr(`placeholder`)
    let phvalue2 = $(`#destinationInput`).attr(`placeholder`)

    $(`#originInput`).attr(`placeholder`, phvalue2)
    $(`#destinationInput`).attr(`placeholder`, phvalue1)

    /*------------------------------------------------------------------*/
    let value1 = $(`#originInput`).val()
    let value2 = $(`#destinationInput`).val()

    $(`#originInput`).val(value2)
    $(`#destinationInput`).val(value1)

    localStorage.setItem('originText', value2)
    localStorage.setItem('destinationText', value1)
    /*------------------------------------------------------------------*/

    let vvalue1 = originID
    let vvalue2 = destinationID

    originID = vvalue2
    destinationID = vvalue1

    localStorage.setItem('originID', originID)
    localStorage.setItem('destinationID', destinationID)
})



// DATE - TODAY - TOMORROW
$(document).on(`click`, `#todayJourneyBtn`, function () {
    $(`#journeyDepartureDate`).val(todayDate)
    localStorage.setItem('journeyDate', todayDate)
})
$(document).on(`click`, `#tomorrowJourneyBtn`, function () {
    $(`#journeyDepartureDate`).val(tomorrowDate)
    localStorage.setItem('journeyDate', tomorrowDate)
})
$(document).on(`change`, `#journeyDepartureDate`, function () {
    let value = $(this).val()
    if (new Date(value).getTime() < new Date(todayDate).getTime()) {
        setAlert("Lütfen geçmiş bir tarih girmeyiniz!")
        $(`#journeyDepartureDate`).val(tomorrowDate)
    }
    localStorage.setItem('journeyDate', value)
})



// Select Journey
$(document).on(`click`, `#findTicketButton`, function () {
    let selectedDate = $(`#journeyDepartureDate`).val().trim()
    findJourneys(originID, destinationID, dateFormat(selectedDate))
    $(`.section1`).css(`display`, `none`)
    $(`.section2`).css(`display`, `block`)
})



// Find Journeys
function findJourneys(oriID, destID, jourDate = todayDate) {
    $(`.loading-screen`).css(`display`,`block`)
    $.ajax({
        "url": "https://v2-api.obilet.com/api/journey/getbusjourneys",
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json",
            "Authorization": AuthCode
        },
        "data": JSON.stringify({
            "device-session": {
                "session-id": obUserID,
                "device-id": obDeviceID
            },
            "date": todayDate,
            "language": "tr-TR",
            "data": {
                "origin-id": oriID,
                "destination-id": destID,
                "departure-date": jourDate
            }
        }),
        success: function (res) {
            $(`.loading-screen`).css(`display`,`none`)
            sortJourneys(res.data)
        },
        error: function (e) {
            $(`.loading-screen`).css(`display`,`none`)
            console.log("error");
            console.log(e);
        }
    });
}



// Sort Journeys
function sortJourneys(data) {
    $.each(data, function (i, item) {
        let departureDate = item.journey.departure.split("T")[0].replaceAll("-", " / ")
        let departureHours = item.journey.departure.split("T")[1].substring(0, 5)
        let partnerLogo = ` https://s3.eu-central-1.amazonaws.com/static.obilet.com/images/partner/${item["partner-id"]}-sm.png`
        let departureStation = item.journey.origin
        let arrivalStation = item.journey.destination
        let price = item.journey["internet-price"]

        let comp = `<div class="ticket-card"><div class="ticket-head"><div class="left-col">${departureDate}</div><div class="right-col">${departureHours}</div></div><div class="ticket-body"><div class="ticket-brand"><img class="ticket-comp" src="${partnerLogo}" alt=""></div><div class="ticket-marks"><img class="ticket-go-arrow" src="public/media/go-arrow.svg" alt=""></div><div class="ticket-stations"><div class="ticket-stations-left"><h6>${departureStation}</h6></div><div class="ticket-stations-right"><h6>${arrivalStation}</h6></div></div></div><div class="ticket-footer"><div class="ticket-footer-left">${price} <span class="tl">₺</span></div><div class="ticket-footer-right">Bilet al <i class="wi-arrow-right"></i></div></div></div>`
        $(`#journeyList`).append(comp)
    })
}



// Get Bus Location ID
function getBusStation(word = "", stationType = "origin") {
    let date = dateFormat().replaceAll(" ", "T");

    $.ajax({
        "url": "https://v2-api.obilet.com/api/location/getbuslocations",
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json",
            "Authorization": AuthCode
        },
        "data": JSON.stringify({
            "data": word,
            "device-session": {
                "session-id": obUserID,
                "device-id": obDeviceID
            },
            "date": date,
            "language": "tr-TR"
        }),
        success: function (res) {
            if (stationType == "origin") {
                originID = res.data[0]["id"]
                localStorage.setItem('originID', originID)
            }
            if (stationType == "destination") {
                destinationID = res.data[0]["id"]
                localStorage.setItem('destinationID', destinationID)
            }
        },
        error: function (e) {
            console.log("error");
            console.log(e);
        }
    });
}


// Back Page Button
$(document).on(`click`, `#backPageButton`, function () {
    $(`.section2`).css(`display`, `none`)
    $(`.section1`).css(`display`, `block`)
})



// Functions
function dateFormat(e = new Date()) {
    if (e.length < 11) {
        e = e + " 00:00:00";
    }
    let date = new Date(e);
    let dateStr =
        ("00" + (date.getMonth() + 1)).slice(-2) + "/" +
        ("00" + date.getDate()).slice(-2) + "/" +
        date.getFullYear() + " " +
        ("00" + date.getHours()).slice(-2) + ":" +
        ("00" + date.getMinutes()).slice(-2) + ":" +
        ("00" + date.getSeconds()).slice(-2);
    return dateStr
}


// Alerts
var alertCount = 0
function setAlert(message, state = "warning", errorCode = "") {
    let errorText = "";
    let icon = "";
    switch (state) {
        case "error":
            errorText = "Hata"
            icon = "fa-solid fa-triangle-exclamation"
            break;
        case "info":
            errorText = "Bilgi"
            icon = "fa-solid fa-exclamation"
            break;

        default:
            errorText = "Uyarı"
            icon = "fa-solid fa-circle-exclamation"
            break;
    }


    let alertItem = `<div class="alert-item alert-${state} alert-item-${++alertCount}"><h4 class="alert-status">
    <i class="${icon}"></i> ${errorText}!</h4><h4 class="alert-text">${message}</h4></div>`
    $(`.alert-area`).append(alertItem)

    setTimeout(() => {
        $(`.alert-item-${alertCount}`).css(`display`, `none`)
        for (let i = alertCount - 1; i > 0; i--) {
            $(`.alert-item-${i}`).remove()
        }
        setTimeout(() => {
            $(`.alert-item-${alertCount}`).remove()
        }, 2000);
    }, 7000);
}









/* Search Advice /////////////////////////////////////////////////////////////*/
$(document).on(`keyup`, `#originInput`, function () {
    let value = $(this).val()
    getSearchBusStations(value, "origin")
    $(`#dropdown-origin-content`).css("display", "block")
})
$(document).on(`keyup`, `#destinationInput`, function () {
    let value = $(this).val()
    getSearchBusStations(value, "destination")
    $(`#dropdown-destination-content`).css("display", "block")
})

function getSearchBusStations(word = "", stationType = "origin") {
    let date = dateFormat().replaceAll(" ", "T");

    $.ajax({
        "url": "https://v2-api.obilet.com/api/location/getbuslocations",
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json",
            "Authorization": AuthCode
        },
        "data": JSON.stringify({
            "data": word,
            "device-session": {
                "session-id": obUserID,
                "device-id": obDeviceID
            },
            "date": date,
            "language": "tr-TR"
        }),
        success: function (res) {
            if (stationType == "origin") {
                $(`#dropdown-origin-content`).html("")

                $.each(res.data, function (i, station) {
                    let comp = `<li value="${station.id}">${station.name}</li>`
                    $(`#dropdown-origin-content`).append(comp)
                })
            }
            if (stationType == "destination") {
                $(`#dropdown-destination-content`).html("")

                $.each(res.data, function (i, station) {
                    let comp = `<li value="${station.id}">${station.name}</li>`
                    $(`#dropdown-destination-content`).append(comp)
                })
            }
        },
        error: function (e) {
            console.log("error");
            console.log(e);
        }
    });
}

// Click Origin dropdown item
$(document).on(`click`, `#dropdown-origin-content li`, function () {
    let value = $(this).val()
    let name = $(this).html()
    originID = value
    localStorage.setItem('originID', value)
    $(`#originInput`).val(name)
    localStorage.setItem('originText', name)
    $(this).parent().css("display", "none")
})

// Click Destination dropdown item
$(document).on(`click`, `#dropdown-destination-content li`, function () {
    let value = $(this).val()
    let name = $(this).html()
    destinationID = value
    localStorage.setItem('destinationID', value)
    $(`#destinationInput`).val(name)
    localStorage.setItem('destinationText', name)
    $(this).parent().css("display", "none")
})




// Fınd Ticket Button Disable Control
$(document).on(`change`, `#originInput`, function () {
    let value = $(this).val()
    if (value == "" || $(`#destinationInput`).val() == "") {
        $(`#findTicketButton`).prop("disabled", true)
    } else {
        $(`#findTicketButton`).prop("disabled", false)
    }
})
$(document).on(`change`, `#destinationInput`, function () {
    let value = $(this).val()
    if (value == "" || $(`#originInput`).val() == "") {
        $(`#findTicketButton`).prop("disabled", true)
    } else {
        $(`#findTicketButton`).prop("disabled", false)
    }
})

$(document).on(`click`, window, function () {
    $(`#dropdown-origin-content`).css("display", "none")
    $(`#dropdown-destination-content`).css("display", "none")
})