// GLOBAL VARIABLES =====================
var DESK_MATRIX;
var NAMES_OF_PLAYERS = ["?", "Computer"];
var PLAYER_COLORS = new Array(2);
var ME_SCORE, COMP_SCORE;
var TURN_TIMER;
var pROW, pCOLUMN, nROW, nCOLUMN;
//=======================================

$(document).ready(function () {
    // draw the game desk
    for (var i = 0; i < 8; i++) {
        $('table').append('<tr> </tr>');
        for (var j = 0; j < 8; j++)
            $('tr').eq(i).append('<td> </td>');
    }
    // set settings
    $('form').show();
    $('.timer, .player, #btnGiveUp').hide();
    $('#btnsPanel').css('margin-left', '100px');
    $('#btnStart').click(startGame);
    $('form .mePlayer').css('border', '3px solid #ae2323'); // choose checker
    $('form div').click(chooseColor); // choose checker's color
    //startGame();
});

function chooseColor() {
    var isBorder = $(this).css('border').split(' ');

    if (isBorder[1] == 'none') {
        if ($(this).hasClass('mePlayer')) {
            $('form .mePlayer').css('border', '3px solid #ae2323');
            $('form .compPlayer').css('border', 'none');
            PLAYER_COLORS[0] = $('form .mePlayer').css('background');
            PLAYER_COLORS[1] = $('form .compPlayer').css('background');
        }
        else {
            $('form .compPlayer').css('border', '3px solid #ae2323');
            $('form .mePlayer').css('border', 'none');
            PLAYER_COLORS[0] = $('form .compPlayer').css('background');
            PLAYER_COLORS[1] = $('form .mePlayer').css('background');
        }
    }
}

function fillDesk() {
    $('td').html(''); // crear desk
    //init desk with me/comp checkers
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            // player: comp
            if (DESK_MATRIX[i][j] == "comp") {
                $('tr').eq(i).children().eq(j)
                     .html('<div class="checker compPlayer"> </div>');
            }
            // player: me
            if (DESK_MATRIX[i][j] == "me") {
                $('tr').eq(i).children().eq(j)
                     .html('<div class="checker mePlayer"> </div>');
            }
            // player: meQueen
            if (DESK_MATRIX[i][j] == "meQueen") {
                $('tr').eq(i).children().eq(j)
                     .html('<div class="checker meQueen"> </div>');
            }
            // player: compQueen
            if (DESK_MATRIX[i][j] == "compQueen") {
                $('tr').eq(i).children().eq(j)
                     .html('<div class="checker compQueen"> </div>');
            }
        }
    }
    //// swap colors
    //$('.mePlayer').css('background', PLAYER_COLORS[0]);
    //$('.compPlayer').css('background', PLAYER_COLORS[1]);
}

function setTimerString(player) {
    //stop previous timer
    clearInterval(TURN_TIMER);
    //set new timer string
    var startSec = 15;
    $('.timer').text(player + "'s Turn: 0:" + startSec);
    TURN_TIMER = setInterval(function () {
        startSec--;
        if (startSec < 10)
            startSec = "0" + startSec;
        $('.timer').text(player + "'s Turn: 0:" + startSec);
        if (startSec == 0) {
            clearInterval(TURN_TIMER);
            if (player == 'Computer') {
                setTimerString(NAMES_OF_PLAYERS[0]);
                makeDragAndDrop();
            }
            else {
                setTimerString(NAMES_OF_PLAYERS[1]);
                checkStepCOMP();
            }
        }
    }, 1000);
}

function startGame() {
    // fill checkers on the desk
    DESK_MATRIX = [["empty", "comp", "empty", "comp", "empty", "comp", "empty", "comp"],
    ["comp", "empty", "comp", "empty", "comp", "empty", "comp", "empty"],
    ["empty", "comp", "empty", "comp", "empty", "comp", "empty", "comp"],
    ["empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty"],
    ["empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty"],
    ["me", "empty", "me", "empty", "me", "empty", "me", "empty"],
    ["empty", "me", "empty", "me", "empty", "me", "empty", "me"],
    ["me", "empty", "me", "empty", "me", "empty", "me", "empty"]];
    fillDesk();
    // set a dialog settings
    $("#dialog").dialog({
        autoOpen: false,
        modal: true,
        buttons: { Ok: function () { $(this).dialog("close"); } },
        show: { effect: "blind", duration: 1000 },
        hide: { effect: "blind", duration: 1000 }
    });
    // other settings
    $('form').hide();
    $('#btnGiveUp').click(giveUp);
    makeDragAndDrop();
    $('.timer, .player, #btnGiveUp').show();
    $('#btnsPanel').css('margin-left', '32px');
    $('#btnStart').text('Reset').off();
    // set name of player and set the score
    ME_SCORE = 0;
    COMP_SCORE = 0;
    NAMES_OF_PLAYERS[0] = $('input').val();
    $('.player span').html(NAMES_OF_PLAYERS[0] + ": "
        + ME_SCORE + "<br />Comp: " + COMP_SCORE);
    setTimerString(NAMES_OF_PLAYERS[0]);
}

function giveUp() {
    theWinnerIs(NAMES_OF_PLAYERS[1]);
    $("#dialog").dialog("open");
}

function makeDragAndDrop() {
    //make checker draggable
    $('.mePlayer, .meQueen').draggable({
        disabled: false,
        containment: 'table',
        cursor: 'default',
        stack: 'td',
        revert: true,
        drag: setPrevIndex
    });

    //make checker droppable
    $('td').droppable({
        accept: '.mePlayer, .meQueen',
        drop: checkStepME
    });
}

function setPrevIndex() {
    pROW = $(this).parents('tr').index();
    pCOLUMN = $(this).parent().index();
}

function setNextIndex(obj) {
    nROW = obj.parent().index();
    nCOLUMN = obj.index();
}

function checkStepME() {
    setNextIndex($(this));
    var droppedCorrect = false, attack = false;

    if (DESK_MATRIX[nROW][nCOLUMN] == 'empty') {
        // standart step
        if (nROW == (pROW - 1)
                && (nCOLUMN == pCOLUMN - 1 || nCOLUMN == pCOLUMN + 1)) {
            droppedCorrect = true;
        }
        else {
            // attack step
            var tempCol = (nCOLUMN == pCOLUMN + 2) ? (pCOLUMN + 2) : (pCOLUMN - 2);
            var tempCol2 = (nCOLUMN == pCOLUMN + 2) ? (pCOLUMN + 1) : (pCOLUMN - 1);
            if (nROW == pROW - 2 && nCOLUMN == tempCol
                    && DESK_MATRIX[pROW - 1][tempCol2] == "comp") {
                droppedCorrect = true;
                attack = true;
            }
        }
        // queen step

        if (droppedCorrect) {
            if (DESK_MATRIX[pROW][pCOLUMN] == 'me' && nROW == 0)
                DESK_MATRIX[nROW][nCOLUMN] = "meQueen";
            else {
                if (DESK_MATRIX[pROW][pCOLUMN] == 'me')
                    DESK_MATRIX[nROW][nCOLUMN] = "me";
                else if (DESK_MATRIX[pROW][pCOLUMN] == 'meQueen')
                    DESK_MATRIX[nROW][nCOLUMN] = 'meQueen';
            }
            DESK_MATRIX[pROW][pCOLUMN] = "empty";
            if (attack) {
                // remove "comp checker"
                DESK_MATRIX[pROW - 1][tempCol2] = "empty";
                $('tr').eq(pROW - 1).children()
                    .eq(tempCol2).children().effect("explode", {}, 500);
                //set new score
                $('.player span').html(NAMES_OF_PLAYERS[0] + ": " +
                    ++ME_SCORE + "<br />Comp: " + COMP_SCORE);
            }

            // check if continue the game else the player is the winner
            if (12 - ME_SCORE > 0) {
                fillDesk(); // refresh the game desk
                setTimerString(NAMES_OF_PLAYERS[1]);
                checkStepCOMP();
            }
            else theWinnerIs(NAMES_OF_PLAYERS[0]);
        }
    }
}

function checkStepCOMP() {
    //wait 1-4 seconds before making next step
    var secToWait = Math.floor((Math.random() * 4) + 2) * 1000;

    setTimeout(function () {
        var defence = false, attack = false;
        var tempCol, tempCol2, tempCol3;

        /* ATTACK */
        for (var i = 0; i < 8; i++) {
            for (var j = 0; j < 8; j++) {
                if (DESK_MATRIX[i][j] == "comp") {
                    tempCol = (j - 1 >= 0) ? (j - 1) : (j + 1);
                    do {
                        if (DESK_MATRIX[i + 1][tempCol] == "me") {
                            tempCol = (j - 1 == tempCol) ? (j - 2) : (j + 2);
                            if (DESK_MATRIX[i + 2][tempCol] == "empty") {
                                pROW = i;
                                pCOLUMN = j;
                                nROW = i + 2;
                                nCOLUMN = tempCol;
                                tempCol2 = (j - 2 == tempCol) ? (j - 1) : (j + 1); // "me" column position
                                attack = true;
                                break;
                            }
                        }
                        tempCol = (tempCol == j - 1) ? (j + 1) : (j - 1);
                    } while (tempCol != j - 1);
                }
                if (attack) break;
            }
            if (attack) break;
        }

        /* DEFENCE */
        if (!attack) {
            for (var i = 0; i < 8; i++) {
                for (var j = 0; j < 8; j++) {
                    if (DESK_MATRIX[i][j] == "comp") {
                        tempCol = (j - 1 >= 0) ? (j - 1) : (j + 1);
                        do {
                            if (DESK_MATRIX[i + 1][tempCol] == "me") {
                                if (i - 1 >= 0) {
                                    // if "me" should attack
                                    tempCol2 = (tempCol == j - 1) ? (j + 1) : (j - 1);
                                    if (DESK_MATRIX[i - 1][tempCol2] == "empty") {
                                        if (i - 2 >= 0) {
                                            // defence by another checker
                                            if (tempCol2 == j - 1) {
                                                tempCol3 = (j - 2 >= 0) ? (j - 2) : (j);
                                            }
                                            else if (tempCol2 == j + 1) {
                                                tempCol3 = (j + 2 <= 7) ? (j + 2) : (j);
                                            }
                                            do {
                                                if (DESK_MATRIX[i - 2][tempCol3] == "comp") {
                                                    nROW = i - 1;
                                                    nCOLUMN = tempCol2;
                                                    pROW = i - 2;
                                                    pCOLUMN = tempCol3;
                                                    defence = true;
                                                    break;
                                                }
                                                tempCol3 = (tempCol3 == j + 2) ? (j) : (j + 2);
                                            } while (tempCol3 != j + 2);
                                        }
                                        if (!defence) {
                                            // run away
                                            nROW = i + 1;
                                            nCOLUMN = (j - 1 == tempCol) ? (j + 1) : (j - 1);
                                            if (DESK_MATRIX[nROW][nCOLUMN] == "empty") {
                                                pROW = i;
                                                pCOLUMN = j;
                                                defence = true;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                            tempCol = (tempCol == j - 1) ? (j + 1) : (j - 1);
                        } while (tempCol != j - 1);
                    }
                    if (defence) break;
                }
                if (defence) break;
            }
        }

        /* RANDOM */
        if (!attack && !defence) {
            var random = false;
            do {
                do {
                    pROW = Math.floor((Math.random() * 8));
                    pCOLUMN = Math.floor((Math.random() * 8));
                } while (DESK_MATRIX[pROW][pCOLUMN] != "comp");
                // store current index
                nROW = pROW + 1;
                nCOLUMN = pCOLUMN - 1;
                if (DESK_MATRIX[nROW][nCOLUMN] != "empty") {
                    nCOLUMN = pCOLUMN + 1;
                    if (DESK_MATRIX[nROW][nCOLUMN] == "empty") {
                        random = true;
                    }
                }
                else random = true;
            } while (!random);
        }
        /* MAKE STEP */
        if (defence || attack || random) {
            if (DESK_MATRIX[pROW][pCOLUMN] == 'comp' && nROW == 7)
                DESK_MATRIX[nROW][nCOLUMN] = "compQueen";
            else {
                if (DESK_MATRIX[pROW][pCOLUMN] == 'comp')
                    DESK_MATRIX[nROW][nCOLUMN] = "comp";
                else if (DESK_MATRIX[pROW][pCOLUMN] == 'compQueen')
                    DESK_MATRIX[nROW][nCOLUMN] = 'compQueen';
            }
            DESK_MATRIX[pROW][pCOLUMN] = "empty";
            if (attack) {
                // remove "me checker"
                DESK_MATRIX[pROW + 1][tempCol2] = "empty";  
                $('tr').eq(pROW + 1).children()
                    .eq(tempCol2).children().effect("explode", {}, 500);
                //set score
                $('.player span').html(NAMES_OF_PLAYERS[0] + ": "
                    + ME_SCORE + "<br />Comp: " + ++COMP_SCORE);
            }
            // get coordinates and set animation
            var prev = $('tr').eq(pROW).children().eq(pCOLUMN);
            var prevOffset = $(prev).offset();
            var nextOffset = $('tr').eq(nROW).children().eq(nCOLUMN).offset();
            var CSStop = nextOffset.top - prevOffset.top;
            var CSSleft = nextOffset.left - prevOffset.left;
            prev.children().animate({
                top: '+=' + CSStop + 'px',
                left: '+=' + CSSleft + 'px'
            }, 800, function () {
                /*callback function
                  draw the checker
                  after effect */
                var checker = $('tr').eq(nROW).children().eq(nCOLUMN);
                if (DESK_MATRIX[nROW][nCOLUMN] == 'comp' && nROW == 7)
                    checker.html('<div class="checker compQueen"> </div>');
                else {
                    if (DESK_MATRIX[nROW][nCOLUMN] == 'comp')
                        checker.html('<div class="checker compPlayer"> </div>');
                    else if (DESK_MATRIX[nROW][nCOLUMN] == 'compQueen') 
                        checker.html('<div class="checker compQueen"> </div>');
                }
            });      
        }
        // check if continue the game else the player is the winner
        if (12 - COMP_SCORE > 0) {
            setTimerString(NAMES_OF_PLAYERS[0]);
            makeDragAndDrop();
        }
        else theWinnerIs(NAMES_OF_PLAYERS[1]);
    }, secToWait);
}

function theWinnerIs(player) {
    $("#dialog").append('<p>The Winner Is: ' + player + '!</p>');
    clearInterval(TURN_TIMER);
}