// Element selector functions
function elementClass(classname) {
    return document.getElementsByClassName(classname);
}

function elementID(id) {
    return document.getElementById(id);
}

// Find room where movie is played
function roomFinder(movie) {
    switch (movie) {
        case "The Predator":
            return room_1;
            break;
        case "Airplane":
            return room_2;
            break;
        case "The Room":
            return room_three.room;
            break;
        case "Dredd":
            return room_four.room;
            break;
        default:
            console.log("Movie/Room not found");
    }
}

// This creates the theater room element with all the seats, no style
function renderRoom(room) {
    // create room container
    let room_div = document.createElement("div");
    room_div.id = "theater-room";
    room.forEach(function(row, row_nr) {
        // create a row container
        let row_div = document.createElement("div");
        row_div.className = "row";
        row_div.id = "row-" + row_nr;
        // create seats and asign proper name and class
        row.forEach(function(seatobject) {
                let seat_div = document.createElement("div");
                seat_div.className = "seat"
                seat_div.id = seatobject.number;
                seat_div.innerText = seatobject.number;
                if (seatobject.ticketnr === '') {
                    seat_div.className += " seatOpen";
                } else {
                    seat_div.className += " seatTaken";
                }
                row_div.appendChild(seat_div);
            })
            // Insert row with seats into room
        room_div.appendChild(row_div);
    })
    return room_div;
}

// This function checks if there are reserved seats in the searcharray
// The catch is that array1 is and array of objects.
function excludeFoundSeats(objectArray, array) {
    let check = 0;
    let extractedSeatsArray = [];
    objectArray.forEach((seatObject) => extractedSeatsArray.push(seatObject.number));
    array.forEach((value) => {
        if (extractedSeatsArray.includes(value)) {
            check++;
        }
    })
    if (check > 0) {
        return false;
    } else {
        return true;
    }
}
// This function returns an array with all the seat in the center columns 
function centerColumnSeats(theater) {
    const totalColumns = theater[0].length;
    const edgeColumns = Math.round(totalColumns / 4);
    let centeredSeats = [];
    theater.forEach((row) => {
        row.forEach((seat, seatcolumn) => {
            if (((seatcolumn + 1) > edgeColumns) && (seatcolumn < (totalColumns - edgeColumns))) {
                centeredSeats.push(seat.number);
            }
        })
    })
    return centeredSeats;
}

// This function returns the combination of seats that has the most seats located in the center columns.
function searchCenteredSeats(seatClassMultiArray, allCenteredSeatsArray) {
    let fullCenter = [];
    let partCenter = [];
    let matchlv = [];
    seatClassMultiArray.forEach((seatCombination) => {
        let found = 0;
        seatCombination.forEach((seat) => {
            if (allCenteredSeatsArray.includes(seat)) {
                found++;
                if (found === seatCombination.length) {
                    fullCenter.push(seatCombination);
                } else if (found > 0) {
                    matchlv.push(found);
                    partCenter.push(seatCombination);
                }
            }
        })
    })
    if (fullCenter.length > 0) {
        return fullCenter[0];
    } else if (partCenter.length > 0) {
        let bestMatch = matchlv.indexOf(Math.max(...matchlv));
        return partCenter[bestMatch];
    } else {
        return seatClassMultiArray[0];
    }
}

// These variabels are used in the seatFinder function.
let remainingSeats = 0;
let nrSeatsNeeded = 0;
let return_array = [];

// This funtion looks for available seats
async function seatFinder(groupsize, theaterroom) {
    const total_rows = theaterroom.length;
    const center_row = Math.round(total_rows / 2);
    const best_rows = [center_row, (center_row + 1), (center_row + 2)];
    const centeredSeats = centerColumnSeats(theaterroom);

    // Set up global variabels for new search
    if (nrSeatsNeeded == 0) {
        nrSeatsNeeded = groupsize;
        return_array = [];
        remainingSeats = 0;
    }

    let posible_seating = [];
    let best_seats = [];
    let secondbest_seats = [];
    let thirdbest_seats = [];

    // loop rows This can be a function to be reused.
    theaterroom.forEach(function(row_array, row_nr) {
        let current_row = row_nr;
        row_array.forEach(function(seat) {
            // add row to seat object and push to posible_seating
            seat["seat_row"] = current_row;
            posible_seating.push(seat);
            if (posible_seating.length == groupsize) {
                // check if all available
                if (posible_seating.every((seat) => seat.ticketnr === '' && seat.seat_row == current_row ? true : false) && excludeFoundSeats(posible_seating, return_array)) {
                    let push_array = [];
                    posible_seating.forEach(function(bookedseat) {
                        switch (true) {
                            case current_row === best_rows[0] || current_row === best_rows[1] || current_row === best_rows[2]:
                                push_array.push(bookedseat.number);
                                if (push_array.length === posible_seating.length) {
                                    best_seats.push(push_array);
                                    // console.log(best_seats);
                                }
                                break;
                            case current_row > best_rows[2]:
                                push_array.push(bookedseat.number);
                                if (push_array.length === posible_seating.length) {
                                    secondbest_seats.push(push_array);
                                    // console.log(secondbest_seats);
                                }
                                break;
                            case current_row < best_rows[0]:
                                push_array.push(bookedseat.number);
                                if (push_array.length === posible_seating.length) {
                                    thirdbest_seats.push(push_array);
                                    // console.log(thirdbest_seats);
                                }
                                break;
                            default:
                                console.log("Row classification err");
                        }
                    })
                    posible_seating.splice(0, 1);
                } else {
                    // This leaves seats in posible_seating that could be usefull in the next loop.
                    posible_seating.reverse().forEach(function(seat, index) {
                        if (seat.ticketnr === '' && seat.seat_row == current_row) {
                            return;
                        } else {
                            posible_seating.splice(index);
                            posible_seating.reverse();
                        }
                    })
                }
            }
        })
    })

    if (best_seats.length > 0) {
        return_array.push(...(searchCenteredSeats(best_seats, centeredSeats)));
        if (return_array.length == nrSeatsNeeded) {
            nrSeatsNeeded = 0;
            return return_array;
        } else {
            return seatFinder(remainingSeats, theaterroom);
        }
    } else if (secondbest_seats.length > 0) {
        return_array.push(...(searchCenteredSeats(secondbest_seats, centeredSeats)));
        if (return_array.length == nrSeatsNeeded) {
            nrSeatsNeeded = 0;
            return return_array;
        } else {
            return seatFinder(remainingSeats, theaterroom);
        }
    } else if (thirdbest_seats.length > 0) {
        return_array.push(...(searchCenteredSeats(thirdbest_seats, centeredSeats)));
        if (return_array.length == nrSeatsNeeded) {
            nrSeatsNeeded = 0;
            return return_array;
        } else {
            return seatFinder(remainingSeats, theaterroom);
        }
    } else {
        remainingSeats++;
        if (remainingSeats == nrSeatsNeeded) {
            console.log("Group is too big, no " + nrSeatsNeeded + " seats found");
            remainingSeats = 0;
            return null;
        }
        console.log("Seats left: " + remainingSeats);
        return seatFinder((groupsize - 1), theaterroom);
    }
}


function showSeats(selected_room, foundseats) {
    let overview = document.getElementById('seats-overview');
    let room = document.getElementById('theater-room');
    if (room) {
        room.remove();
    }
    overview.appendChild(renderRoom(selected_room));
    // console.log("This is foundseats: " + foundseats);
    if (foundseats.length > 0) {
        // This compansates if the seat search gets broken up in parts.
        foundseats.forEach(function(seat) {
            elementID(seat).className = "seat seatAdvised";
        })
    } else {
        alert("No seating posibilities found. Please reduce groupsize.");
    }
}

// Set group size limit for the groupsize input.
// The max is the max theater row length.
Array.from(elementClass('movies')).forEach(function(movie) {
    movie.addEventListener("click", function(event) {
        let row_length = roomFinder(movie.value)[0].length;
        elementID("groupsize").setAttribute("max", row_length.toString());
        elementID("groupsize").value = 1;
    })
})

// Variabels used by eventhandelers
// Referance and copy of the theaterroom.
let selected_room;
let selected_room_copy;
let availableSeats;
let selectedMovie;
let selectedDate;

//Eventhandeler book-btn
elementID("book-btn").addEventListener("click", function(event) {
    let num_seats = elementID("groupsize").value;

    // check radio input & find theatherroom
    Array.from(elementClass('movies')).forEach(function(movie) {
        if (movie.checked) {
            selectedMovie = movie.value;
            selectedDate = elementID("date").value;
            selected_room = roomFinder(movie.value);
            // Copy selected_room with Lodash library
            selected_room_copy = selected_room.map(a => {
                let deepcopy = _.cloneDeep(a);
                return [...deepcopy];
            });
        }
    })
    seatFinder(num_seats, selected_room_copy).then(
        function(value) {
            if (value) {
                showSeats(selected_room, value);
                availableSeats = value;
                console.log("Availableseats: " + availableSeats);
            } else {
                alert("No seats found. PLease try a smaller group.")
            }
        }
    );
})
elementID("reserve-btn").addEventListener("click", function(event) {
    let random_id = Math.floor(Math.random() * 10000 + 1);
    let bookingdata = {
        booking_id: random_id,
        date: selectedDate,
        movie: selectedMovie,
        seats: availableSeats
    };
    console.log(bookingdata);
})


//////////////////////////////////////////////////////////
///////////////////// Theaterrooms ///////////////////////
// Rooms 1 and 2 are hardcoded
// Room 3 is auto genereated with the theaterroom makeroom class method

// This is the theaterroom class
class theaterroom {
    constructor(name, rows, rowLength, seatsTaken) {
        this.room = name;
        this.rows = rows;
        this.rowLength = rowLength;
        this.seatsTaken = seatsTaken;
        this.totalSeats = rows * rowLength;
    }
    makeRoom() {
        let seatnumber = 0;
        let seatsTakenArray = [];
        // Make aan array of randomly selected seats
        // Generate seatstaken amount of random numbers between 1 and totalseats
        if (Array.isArray(this.seatsTaken)) {
            console.log("We got array");
            seatsTakenArray.push(...this.seatsTaken);
        } else {
            while (seatsTakenArray.length < this.seatsTaken) {
                let randomNumber = Math.floor(Math.random() * this.totalSeats + 1);
                if(seatsTakenArray.indexOf(randomNumber) === -1) seatsTakenArray.push(randomNumber);
            }
        }
        
        console.log(seatsTakenArray);
        this.room = [];
        for (let rowcount = 0; rowcount < this.rows; rowcount++) {
            let seatRow = [];
            for (let seatcount = 0; seatcount < this.rowLength; seatcount++) {
                seatnumber++;
                let ticketnumber = '';
                if (seatsTakenArray.includes(seatnumber)) {
                    ticketnumber = Math.floor(Math.random() * 1000 + 10);
                }
                seatRow.push({
                    number: seatnumber.toString(),
                    ticketnr: ticketnumber.toString()
                })
            }
            this.room.push(seatRow);
        }
        return this.room;
    }
}

let bluebirdSeats = [1,2,11,12,13,20,21,22,23,24,25,32,33,49,50]
const room_three = new theaterroom("three", 5, 10, bluebirdSeats);
room_three.makeRoom();
console.log(room_three.room);

const room_four = new theaterroom("four", 12, 10, 60);
room_four.makeRoom();
console.log(room_four.room);


let room_1 = [
    // row 1
    [
        { number: '1', ticketnr: '1' },
        { number: '2', ticketnr: '2' },
        { number: '3', ticketnr: '' },
        { number: '4', ticketnr: '3' },
        { number: '5', ticketnr: '' },
        { number: '6', ticketnr: '' },
        { number: '7', ticketnr: '4' },
        { number: '8', ticketnr: '' },
        { number: '9', ticketnr: '' }
    ],
    // row 2
    [
        { number: '10', ticketnr: '' },
        { number: '11', ticketnr: '' },
        { number: '12', ticketnr: '' },
        { number: '13', ticketnr: '' },
        { number: '14', ticketnr: '' },
        { number: '15', ticketnr: '' },
        { number: '16', ticketnr: '' },
        { number: '17', ticketnr: '' },
        { number: '18', ticketnr: '' }
    ],
    // row 3
    [
        { number: '19', ticketnr: '5' },
        { number: '20', ticketnr: '6' },
        { number: '21', ticketnr: '7' },
        { number: '22', ticketnr: '8' },
        { number: '23', ticketnr: '' },
        { number: '24', ticketnr: '' },
        { number: '25', ticketnr: '' },
        { number: '26', ticketnr: '' },
        { number: '27', ticketnr: '' }
    ],
    // row 4
    [
        { number: '28', ticketnr: '49' },
        { number: '29', ticketnr: '' },
        { number: '30', ticketnr: '50' },
        { number: '31', ticketnr: '11' },
        { number: '32', ticketnr: '' },
        { number: '33', ticketnr: '' },
        { number: '34', ticketnr: '2' },
        { number: '35', ticketnr: '' },
        { number: '36', ticketnr: '' }
    ],
    // row 5
    [
        { number: '37', ticketnr: '12' },
        { number: '38', ticketnr: '34' },
        { number: '39', ticketnr: '56' },
        { number: '40', ticketnr: '78' },
        { number: '41', ticketnr: '45' },
        { number: '42', ticketnr: '43' },
        { number: '43', ticketnr: '' },
        { number: '44', ticketnr: '' },
        { number: '45', ticketnr: '' }
    ],
    // row 6
    [
        { number: '46', ticketnr: '' },
        { number: '47', ticketnr: '' },
        { number: '48', ticketnr: '' },
        { number: '49', ticketnr: '' },
        { number: '50', ticketnr: '' },
        { number: '51', ticketnr: '4' },
        { number: '52', ticketnr: '5' },
        { number: '53', ticketnr: '8' },
        { number: '54', ticketnr: '9' }
    ],
    // row 7
    [
        { number: '55', ticketnr: '' },
        { number: '56', ticketnr: '' },
        { number: '57', ticketnr: '' },
        { number: '58', ticketnr: '78' },
        { number: '59', ticketnr: '89' },
        { number: '60', ticketnr: '' },
        { number: '61', ticketnr: '90' },
        { number: '62', ticketnr: '' },
        { number: '63', ticketnr: '' }
    ],
    // row 8
    [
        { number: '64', ticketnr: '' },
        { number: '65', ticketnr: '' },
        { number: '66', ticketnr: '' },
        { number: '67', ticketnr: '' },
        { number: '68', ticketnr: '67' },
        { number: '69', ticketnr: '' },
        { number: '70', ticketnr: '' },
        { number: '71', ticketnr: '' },
        { number: '72', ticketnr: '' }
    ],
    // row 9
    [
        { number: '73', ticketnr: '21' },
        { number: '74', ticketnr: '' },
        { number: '75', ticketnr: '32' },
        { number: '76', ticketnr: '' },
        { number: '77', ticketnr: '' },
        { number: '78', ticketnr: '89' },
        { number: '79', ticketnr: '90' },
        { number: '80', ticketnr: '' },
        { number: '81', ticketnr: '' }
    ],
    // row 10
    [
        { number: '82', ticketnr: '' },
        { number: '83', ticketnr: '73' },
        { number: '84', ticketnr: '' },
        { number: '85', ticketnr: '' },
        { number: '86', ticketnr: '' },
        { number: '87', ticketnr: '' },
        { number: '88', ticketnr: '' },
        { number: '89', ticketnr: '' },
        { number: '90', ticketnr: '' }
    ]
];

let room_2 = [
    // row 1
    [
        { number: '1', ticketnr: '' },
        { number: '2', ticketnr: '1' },
        { number: '3', ticketnr: '2' },
        { number: '4', ticketnr: '' },
        { number: '5', ticketnr: '' },
        { number: '6', ticketnr: '3' },
        { number: '7', ticketnr: '4' },
        { number: '8', ticketnr: '' }
    ],
    // row 2
    [
        { number: '9', ticketnr: '' },
        { number: '10', ticketnr: '' },
        { number: '11', ticketnr: '' },
        { number: '12', ticketnr: '' },
        { number: '13', ticketnr: '' },
        { number: '14', ticketnr: '23' },
        { number: '15', ticketnr: '' },
        { number: '16', ticketnr: '' }
    ],
    // row 3
    [
        { number: '17', ticketnr: '' },
        { number: '18', ticketnr: '' },
        { number: '19', ticketnr: '' },
        { number: '20', ticketnr: '' },
        { number: '21', ticketnr: '7' },
        { number: '22', ticketnr: '8' },
        { number: '23', ticketnr: '9' },
        { number: '24', ticketnr: '10' }
    ],
    // row 4
    [
        { number: '25', ticketnr: '11' },
        { number: '26', ticketnr: '12' },
        { number: '27', ticketnr: '13' },
        { number: '28', ticketnr: '14' },
        { number: '29', ticketnr: '15' },
        { number: '30', ticketnr: '16' },
        { number: '31', ticketnr: '' },
        { number: '32', ticketnr: '' }
    ],
    // row 5
    [
        { number: '33', ticketnr: '' },
        { number: '34', ticketnr: '' },
        { number: '35', ticketnr: '' },
        { number: '36', ticketnr: '' },
        { number: '37', ticketnr: '17' },
        { number: '38', ticketnr: '18' },
        { number: '39', ticketnr: '19' },
        { number: '40', ticketnr: '' }
    ],
    // row 6
    [
        { number: '41', ticketnr: '' },
        { number: '42', ticketnr: '' },
        { number: '43', ticketnr: '20' },
        { number: '44', ticketnr: '21' },
        { number: '45', ticketnr: '22' },
        { number: '46', ticketnr: '23' },
        { number: '47', ticketnr: '' },
        { number: '48', ticketnr: '' }
    ],
    // row 7
    [
        { number: '49', ticketnr: '' },
        { number: '50', ticketnr: '' },
        { number: '51', ticketnr: '' },
        { number: '52', ticketnr: '24' },
        { number: '53', ticketnr: '25' },
        { number: '54', ticketnr: '26' },
        { number: '55', ticketnr: '' },
        { number: '56', ticketnr: '' }
    ],
    // row 8
    [
        { number: '57', ticketnr: '' },
        { number: '58', ticketnr: '' },
        { number: '59', ticketnr: '' },
        { number: '60', ticketnr: '' },
        { number: '61', ticketnr: '' },
        { number: '62', ticketnr: '' },
        { number: '63', ticketnr: '27' },
        { number: '64', ticketnr: '28' }
    ]
];