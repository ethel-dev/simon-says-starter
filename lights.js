// You do not have to modify this code, it's just helper functions for the lights and their timing
const delay = (ms) => {
    return new Promise((res, rej) => {
        const timeoutId = setTimeout(res, ms);
        flashTimeoutBuffer.push(() => clearTimeout(timeoutId));
        controller.signal.addEventListener('abort', rej);
    })
};

async function clearTimeouts() {
    controller.abort();
    for (let i = 0; i < flashTimeoutBuffer.length; i++) {
        flashTimeoutBuffer[i]();
    }
    flashTimeoutBuffer = [];
}

async function displaySequence(sequence) {
    // Loop through the sequence and light up the buttons
    await clearTimeouts();
    await dimAll();
    lockButtons = true;
    for (let i = 0; i < sequence.length; i++) {
        await briefLight(buttons[sequence[i]]);
        await delay(BETWEEN_FLASH_TIME);
    }
    sequenceResponseBuffer = [];
    lockButtons = false;
}

async function briefLight(button, className="lit") {
    button.classList.add(className);
    await delay(FLASH_TIME);
    button.classList.remove(className);
}

async function dimAll() {
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].classList = "grid-item";
    }
}

// original flash function
// async function allFlash(className="correct") {
//     for (let i = 0; i < buttons.length; i++) {
//         buttons[i].classList.add(className);
//         await delay(75);
//     }
//     await delay(FLASH_TIME);
//     for (let i = 0; i < buttons.length; i++) {
//         buttons[i].classList.remove(className);
//     }
//     await delay(BETWEEN_ROUNDS);
// }

// new flash function
/*
    for (let i = 0; i < buttons.length; i += 2) {
        buttons[i].classList.add(className);
    }
    await delay(FLASH_TIME);
    for (let i = 0; i < buttons.length; i += 2) {
        buttons[i].classList.remove(className);
    }

    await delay(BETWEEN_FLASH_TIME);

    for (let i = 1; i < buttons.length; i += 2) {
        buttons[i].classList.add(className);
    }
    await delay(FLASH_TIME);
    for (let i = 1; i < buttons.length; i += 2) {
        buttons[i].classList.remove(className);
    }

    await delay(BETWEEN_ROUNDS);
*/


async function allFlash(className="correct") {

    if (sequenceResponseBuffer.length === 0) {
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].classList.add(className);
            await delay(75);
        }
        await delay(FLASH_TIME);
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].classList.remove(className);
        }
    } else {
        // Get the last clicked button
        const lastClickedButton = buttons[sequenceResponseBuffer[sequenceResponseBuffer.length - 1]];

        // Get the index of the last clicked button
        const lastClickedButtonIndex = sequenceResponseBuffer[sequenceResponseBuffer.length - 1]

        // Spread the class from the last clicked button to cover all buttons, in 2D 3x3 grid
        // The buttons are laid out in 1d from left to right
        // [0, 1, 2]
        // [3, 4, 5]
        // [6, 7, 8]
        // If we clicked on 4, we would want to have some kind of cool mathmatetical way to spread the class to the other buttons
        
        // Get the row and column of the last clicked button
        // Define the 2D grid
        const grid = [[0, 1, 2], [3, 4, 5], [6, 7, 8]];

        // Convert the 1D index to 2D coordinates
        const start = {x: Math.floor(lastClickedButtonIndex / 3), y: lastClickedButtonIndex % 3};

        // Define the BFS algorithm
        const bfs = async (start) => {
            const queue = [start];
            const visited = new Set();

            while (queue.length > 0) {
                const {x, y} = queue.shift();
                const buttonIndex = grid[x][y];
                buttons[buttonIndex].classList.add(className);
                await delay(75);

                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        const newX = x + dx;
                        const newY = y + dy;

                        if (newX >= 0 && newX < 3 && newY >= 0 && newY < 3 && !visited.has(`${newX},${newY}`)) {
                            queue.push({x: newX, y: newY});
                            visited.add(`${newX},${newY}`);
                        }
                    }
                }
            }
        };

        // Run the BFS algorithm
        await bfs(start);

        await delay(300);
        
        await dimAll();
    }
    await delay(BETWEEN_ROUNDS);
}