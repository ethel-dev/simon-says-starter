// Basic interaction
// We have a 3x3 grid, so we need to rig up event listeners and DOM interaction for each button
// The goal is to have a SIMON game where the goal is to get as many combinations right as possible in a row.
// One mistake resets your score and resets the game.

// Constants
const AMOUNT_OF_MOVES = 5;

// Time Constants (ms)
const FLASH_TIME = 500;
const BETWEEN_FLASH_TIME = 200;
const BETWEEN_ROUNDS = 2100;

// Global variables
// We're going to use these to keep track of the game state
// These are generally bad practice, but we're going to use them for simplicity in learning

// This is a flag to prevent the user from clicking the buttons while the game is playing
// Try unlocking this right away when starting and clicking the buttons.
let lockButtons = false;

// This is an array to store the buttons
let buttons = Array();

// This is a variable to store the interaction button
let interaction = document.getElementById('interaction');

// This is a variable to store the sequence of the player input
let sequenceResponseBuffer = [];
let score = 0;

// This is a variable to store the random sequence
let sequence = [];

// This is a variable to store the AbortController, which helps us manage our timeouts
let controller = null;
let flashTimeoutBuffer = [];

// Main function, initializes variables and gets game ready to start
function main() {
    // Select all the buttons
    buttons = document.querySelectorAll('.grid-item');
    console.log(document.getElementById("auto-restart"))
    score = 0;
    controller = new AbortController()

    // Local storage for auto-restart, so it remembers the user's preference
    if (localStorage.getItem('auto-restart') === null) {
        localStorage.setItem('auto-restart', document.getElementById('auto-restart').checked);
    }
    document.getElementById('auto-restart').addEventListener('change', function(e) {
        localStorage.setItem('auto-restart', e.target.checked);
    });
    document.getElementById('auto-restart').checked = (localStorage.getItem('auto-restart') === 'true');

    // Add an event listener to each button
    // We have to handle game state with button responses
    buttons.forEach(button => {
        button.addEventListener('click', async function(e) {
            if (!lockButtons) {
                // e is the event callback object
                // e.target is the button that was clicked
                // e.target.id is the id of the button that was clicked
                await briefLight(e.target);

                // How would we get the corresponding number for the button?
                // TODO...
                let idOfButton = parseInt(e.target.id, 10);

                // Now we have to judge the response based on the input.
                // What are conditions where we need to call our game end functions?
                // TODO...
                sequenceResponseBuffer.push(idOfButton);

                // YOU GOT ONE WRONG
                if (idOfButton !== sequence[sequenceResponseBuffer.length - 1]) {
                    await judgeResponse();
                } else {
                    score++;
                }

                await displayScore();

                // ALL CORRECT
                if (sequenceResponseBuffer.length === sequence.length) {
                    await judgeResponse();
                }
            }
        });
    });

    // Add an event listener to the interaction/restart button
    interaction.addEventListener('click', async function() {
        interaction.innerText = "restart game";
        await clearTimeouts();
        score = 0;
        await allFlash("lit");
        await startGame();
    });
}

// This function starts a new game
// Generate new sequence
async function startGame() {
    // How would you generate a new sequence with randomSequence and start a new round?
    // No need to reset score here
    displayScore();
    sequenceResponseBuffer = [];
    lockButtons = true;
    sequence = await randomSequence(AMOUNT_OF_MOVES);
    await displaySequence(sequence);
    lockButtons = false;
}

// Random sequence of n numbers generator, to make the challenge question
async function randomSequence(n) {
    let rseq = [];
    for (let i = 0; i < n; i++) {
        rseq.push(Math.floor(Math.random() * 9));
    }
    return rseq;
}

// This function judges the response from the player.
// It is called when the player makes an incorrect move or when the player correctly gets through the pattern.
// Based on auto-restart preferences and whether you succeeded or failed, it will continue the game differently
async function judgeResponse() {
    await clearTimeouts();
    await dimAll();
    lockButtons = true;

    // TODO... judgement tree
    // keep in mind the allFlash(class) function that animates .correct or .incorrect classes onto the grid
    // how would you compare the sequenceResponseBuffer and the code sequence?
    if (sequenceResponseBuffer.join("") === sequence.join("")) {
        await allFlash("correct");
        await startGame();
    } else {
        await allFlash("incorrect");

        score = 0;
        displayScore();

        if (document.getElementById("auto-restart").checked) {
            await startGame();
        }
    }
}

// This displays score and also manages high score local storage
async function displayScore() {
    if (localStorage.getItem('highscore') === null) {
        localStorage.setItem('highscore', score);
    } else {
        if (score > localStorage.getItem('highscore')) {
            localStorage.setItem('highscore', score);
        }
    }
    document.querySelector('#score').textContent = score;
    document.querySelector('#high-score').textContent = localStorage.getItem('highscore');
}

// This is the event listener that will run the main function when the DOM is loaded
document.addEventListener('DOMContentLoaded', main);