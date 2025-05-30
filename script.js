// --- PUZZLE DATA ---
// This is where you define your Strands puzzles.
// The 'grid' array represents the letters in the grid.
// The 'wordPaths' object maps each word to an array of {row, col} coordinates.
// These coordinates define the exact path of the word in the grid.
// IMPORTANT: All letters in the grid MUST be part of a word (theme or spangram).
// Generating these dynamically is complex. Manual creation is easier for specific puzzles.

const puzzles = [
    {
        id: 1,
        theme: "YOU!!!!", // Updated theme

        words: ["HARIGUETTE", "DEFENESTRATE", "ILLSLAPYOUDA", "WAFFLING", "YEAVUH"],
        spangram: "HARICATCHPHRASES", // Must touch two opposite sides

        // !!! IMPORTANT: THIS IS A PLACEHOLDER 8x8 GRID !!!
        // You MUST design your own 8x8 grid here, ensuring all remaining words
        // (HARIGUETTE, DEFENESTRATE, ILLSLAPYOUDA, WAFFLING, YEAVUH, HARICATCHPHRASES)
        // are placed, and that NO LETTERS ARE LEFT OVER.
        // This is the most challenging part for an 8x8 grid, especially with custom words.
        grid: [
            ['A', 'F', 'N', 'G', 'I', 'L', 'Y', 'E'],
            ['W', 'A', 'F', 'I', 'L', 'S', 'L', 'A'],
            ['H', 'R', 'L', 'A', 'A', 'H', 'U', 'V'],
            ['E', 'I', 'C', 'T', 'P', 'O', 'U', 'D'],
            ['T', 'E', 'U', 'C', 'Y', 'A', 'S', 'A'],
            ['T', 'G', 'H', 'P', 'H', 'R', 'E', 'S'],
            ['E', 'F', 'I', 'R', 'A', 'H', 'E', 'T'],
            ['D', 'E', 'N', 'E', 'S', 'T', 'R', 'A']
        ],

        // !!! IMPORTANT: YOU MUST RE-MAP ALL WORD PATHS FOR THE NEW 8x8 GRID !!!
        // Every word's path will likely change because the grid layout has to be re-designed.
        // Each path must define the exact {row, col} coordinates for each letter.
        // Paths must be contiguous cells.
        // The spangram's path must still connect opposite sides (e.g., r:0 to r:7 or c:0 to c:7).
        wordPaths: {
            "HARIGUETTE": [
                {r:6, c:5}, {r:6, c:4}, {r:6, c:3}, {r:6, c:2}, {r:5, c:1}, {r:4, c:2}, {r:4, c:1}, {r:5, c:0}, {r:4, c:0}, {r:3, c:0}],
            "DEFENESTRATE": [{r:7, c:0}, {r:6, c:0}, {r:6, c:1}, {r:7, c:1}, {r:7, c:2}, {r:7, c:3}, {r:7, c:4}, {r:7, c:5}, {r:7, c:6}, {r:7, c:7}, {r:6, c:7}, {r:6, c:6}],
            "ILLSLAPYOUDA":[{r:0, c:4}, {r:0, c:5}, {r:1, c:6}, {r:1, c:5}, {r:1, c:4}, {r:2, c:4}, {r:3, c:4}, {r:4, c:4}, {r:3, c:5}, {r:3, c:6}, {r:3, c:7}, {r:4,c:7}],
            "WAFFLING": [{r:1, c:0}, {r:0, c:0}, {r:0, c:1}, {r:1, c:2}, {r:2, c:2}, {r:1, c:3}, {r:0, c:2}, {r:0, c:3}],
            "YEAVUH": [{r:0, c:6}, {r:0, c:7}, {r:1, c:7}, {r:2, c:7}, {r:2, c:6}, {r:2, c:5}],
            "HARICATCHPHRASES": [{r:2, c:0}, {r:1, c:1}, {r:2, c:1}, {r:3, c:1}, {r:3, c:2}, {r:2, c:3}, {r:3, c:3}, {r:4, c:3}, {r:5, c:2}, {r:5, c:3}, {r:5, c:4}, {r:5, c:5}, {r:4, c:5}, {r:4, c:6}, {r:5, c:6},{r:5, c:7}]

        }
    }
    // Add more puzzles here in the future!
];


// --- GAME STATE VARIABLES ---
const GRID_SIZE = 8;
let currentPuzzle = null;
let currentGrid = [];
let selectedCells = []; // Stores {row, col, element} of currently selected cells
let foundWords = new Set(); // Stores found words (e.g., "RAKE")
let hintsUsed = 0;
const MAX_HINTS = 3;
let isSelecting = false; // Flag for drag selection
let isTouching = false; // Flag for touch selection

// NEW: Variable to store the word currently being hinted
let hintedWord = null;

// --- DOM ELEMENTS ---
const themeDisplay = document.getElementById('themeDisplay');
const strandsGridContainer = document.getElementById('strandsGridContainer');
const currentWordDisplay = document.getElementById('currentWordDisplay');
const foundWordsList = document.getElementById('foundWordsList');
const submitWordBtn = document.getElementById('submitWordBtn');
const clearSelectionBtn = document.getElementById('clearSelectionBtn');
const hintBtn = document.getElementById('hintBtn');
const hintsRemainingSpan = document.getElementById('hintsRemaining');
const messageBox = document.getElementById('messageBox');
const messageBoxTitle = document.getElementById('messageBoxTitle');
const messageBoxText = document.getElementById('messageBoxText');
const messageBoxCloseBtn = document.getElementById('messageBoxClose');
const stackingGameButton = document.getElementById('stackingGameButton'); // <-- ADDED THIS LINE


// --- GAME INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    loadPuzzle(puzzles[0]); // Load the first puzzle
    addEventListeners();
});

function loadPuzzle(puzzle) {
    currentPuzzle = puzzle;
    currentGrid = puzzle.grid; // Assign the pre-defined grid
    selectedCells = [];
    foundWords = new Set();
    hintsUsed = 0;
    hintedWord = null; // Reset hinted word on puzzle load

    themeDisplay.querySelector('span').textContent = currentPuzzle.theme;
    hintsRemainingSpan.textContent = MAX_HINTS;
    currentWordDisplay.textContent = '';
    foundWordsList.innerHTML = '';
    submitWordBtn.disabled = true; // Disable submit until selection is made

    stackingGameButton.style.display = 'none'; // <-- ENSURE BUTTON IS HIDDEN ON LOAD
    renderGrid();
    updateButtonStates();
}

function renderGrid() {
    strandsGridContainer.innerHTML = ''; // Clear existing grid
    strandsGridContainer.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const cell = document.createElement('div');
            cell.classList.add('strands-cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.textContent = currentGrid[r][c];
            strandsGridContainer.appendChild(cell);
        }
    }
}

function addEventListeners() {
    // Mouse Events for selection
    strandsGridContainer.addEventListener('mousedown', startSelection);
    strandsGridContainer.addEventListener('mouseover', duringSelection);
    document.addEventListener('mouseup', endSelection);

    // Touch Events for selection
    strandsGridContainer.addEventListener('touchstart', startSelection);
    strandsGridContainer.addEventListener('touchmove', duringSelection);
    document.addEventListener('touchend', endSelection);

    submitWordBtn.addEventListener('click', handleSubmitWord);
    clearSelectionBtn.addEventListener('click', clearSelection);
    hintBtn.addEventListener('click', handleHint);
    messageBoxCloseBtn.addEventListener('click', hideMessageBox);
}

// --- SELECTION LOGIC ---

function startSelection(e) {
    e.preventDefault();
    // Don't clear selection if a word is currently hinted and the user is interacting with it
    // Or if the selection is already a part of a found word
    let targetCell = e.target.closest('.strands-cell');
    if (targetCell && (targetCell.classList.contains('found') || targetCell.classList.contains('spangram-found'))) {
        // If they click on a found word, don't start a selection
        return;
    }

    clearSelection(); // Always clear previous selection at the start of a new one

    if (!targetCell) return;

    if (e.type === 'touchstart') {
        isTouching = true;
        targetCell = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
        if (!targetCell || !targetCell.classList.contains('strands-cell')) return;
    } else {
        isSelecting = true;
    }

    addCellToSelection(targetCell);
}

function duringSelection(e) {
    if (!isSelecting && !isTouching) return;

    let targetCell = e.target.closest('.strands-cell');
    if (e.type === 'touchmove') {
        targetCell = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
        if (!targetCell || !targetCell.classList.contains('strands-cell')) return;
    }

    if (!targetCell) return;

    const currentRow = parseInt(targetCell.dataset.row);
    const currentCol = parseInt(targetCell.dataset.col);

    if (selectedCells.length > 0 &&
        selectedCells[selectedCells.length - 1].row === currentRow &&
        selectedCells[selectedCells.length - 1].col === currentCol) {
        return;
    }

    if (selectedCells.length === 0 ||
        isAdjacent(selectedCells[selectedCells.length - 1], {row: currentRow, col: currentCol})) {
        addCellToSelection(targetCell);
    } else {
        const indexInSelection = selectedCells.findIndex(c => c.row === currentRow && c.col === currentCol);
        if (indexInSelection !== -1 && indexInSelection === selectedCells.length - 2) {
            removeLastCellFromSelection();
        } else {
            return;
        }
    }
}

function endSelection() {
    isSelecting = false;
    isTouching = false;
    updateButtonStates();
}
function addCellToSelection(cellElement) {
    const row = parseInt(cellElement.dataset.row);
    const col = parseInt(cellElement.dataset.col);

    // Prevent selecting cells already part of a FOUND word
    // Hinted cells are NOT found yet, so they SHOULD be selectable.
    if (cellElement.classList.contains('found') || cellElement.classList.contains('spangram-found')) {
        return; // Do not allow selection of already found words.
    }

    // Add cell if not already in selection
    const isAlreadySelected = selectedCells.some(c => c.row === row && c.col === col);
    if (!isAlreadySelected) {
        selectedCells.push({ row, col, element: cellElement });
        cellElement.classList.add('selected');
        updateCurrentWordDisplay();
    }
    // No specific handling for 'hint-reveal' here, as they are meant to be selected.
}

function isAlreadySelected(row, col) {
    return selectedCells.some(c => c.row === row && c.col === col);
}


function removeLastCellFromSelection() {
    if (selectedCells.length > 0) {
        const lastCell = selectedCells.pop();
        lastCell.element.classList.remove('selected');
        updateCurrentWordDisplay();
    }
}

function clearSelection() {
    selectedCells.forEach(cell => {
        // Only remove 'selected' class, not 'hint-reveal' if it's there
        cell.element.classList.remove('selected');
    });
    selectedCells = [];
    currentWordDisplay.textContent = '';
    updateButtonStates();
}

function updateCurrentWordDisplay() {
    const word = selectedCells.map(cell => cell.element.textContent).join('');
    currentWordDisplay.textContent = word;
    updateButtonStates();
}

function isAdjacent(cell1, cell2) {
    const dr = Math.abs(cell1.row - cell2.row);
    const dc = Math.abs(cell1.col - cell2.col);
    return dr <= 1 && dc <= 1 && (dr + dc > 0); // Must be within 1 unit, and not the same cell
}

// --- GAME LOGIC ---

function handleSubmitWord() {
    const currentWord = selectedCells.map(cell => cell.element.textContent).join('').toUpperCase();

    if (currentWord.length === 0) {
        showMessageBox("No word selected", "Please select letters to form a word.");
        return;
    }

    const normalizedFoundWords = Array.from(foundWords).map(w => w.toUpperCase());
    const normalizedThemeWords = currentPuzzle.words.map(w => w.toUpperCase());
    const normalizedSpangram = currentPuzzle.spangram.toUpperCase();

    let foundExactPath = false;
    let foundWordKey = '';
    let isSpangramCheck = false;

    for (const wordKey in currentPuzzle.wordPaths) {
        const path = currentPuzzle.wordPaths[wordKey];
        if (path.length !== selectedCells.length) continue;

        let pathMatches = true;
        for (let i = 0; i < path.length; i++) {
            if (selectedCells[i].row !== path[i].r || selectedCells[i].col !== path[i].c) {
                pathMatches = false;
                break;
            }
        }

        if (pathMatches) {
            foundExactPath = true;
            foundWordKey = wordKey;
            if (wordKey.toUpperCase() === normalizedSpangram) {
                isSpangramCheck = true;
            }
            break;
        }
    }


    if (normalizedFoundWords.includes(currentWord) && foundExactPath) {
        showMessageBox("Already Found!", `You've already found "${currentWord}".`);
        clearSelection();
        return;
    }

    if (foundExactPath) {
        if (isSpangramCheck) {
            const spangramPath = currentPuzzle.wordPaths[currentPuzzle.spangram];
            const touchesOppositeSides = checkSpangramTouch(spangramPath);

            if (touchesOppositeSides) {
                markWordAsFound(currentWord, true);
                showMessageBox("Spangram Found!", `"${currentWord}" is the Spangram!`);
            } else {
                showMessageBox("Not the Spangram", `"${currentWord}" is not the Spangram or does not touch opposite sides.`);
                clearSelection();
            }
        } else if (normalizedThemeWords.includes(currentWord)) {
            markWordAsFound(currentWord, false);
            showMessageBox("Word Found!", `"${currentWord}" is correct!`);
        } else {
            showMessageBox("Not a Word", `"${currentWord}" is not a theme word or the Spangram.`);
            clearSelection();
        }
    } else {
        showMessageBox("Not a Word", `"${currentWord}" is not a theme word or the Spangram, or the path is incorrect.`);
        clearSelection();
    }
    // After any submission, check for game completion
    checkGameCompletion(); // <--- CALL checkGameCompletion HERE
}

function markWordAsFound(word, isSpangram) {
    foundWords.add(word);

    const path = currentPuzzle.wordPaths[word.toUpperCase()];

    if (path) {
        path.forEach(coords => {
            const cellElement = document.querySelector(`.strands-cell[data-row="${coords.r}"][data-col="${coords.c}"]`);
            if (cellElement) {
                cellElement.classList.remove('selected');
                cellElement.classList.add(isSpangram ? 'spangram-found' : 'found');
                cellElement.style.pointerEvents = 'none'; // Make cells unclickable once found

                // NEW: If this was the hinted word, remove its hint highlight
                if (word.toUpperCase() === hintedWord) {
                    cellElement.classList.remove('hint-reveal');
                }
            }
        });
    }

    // NEW: If the word found was the hinted word, clear the hintedWord state
    if (word.toUpperCase() === hintedWord) {
        hintedWord = null;
    }

    addFoundWordToList(word, isSpangram);
    clearSelection(); // This now only clears 'selected' class, not 'hint-reveal'
    updateButtonStates();

    // The logic to show the "Congratulations!" message and the stacking button
    // is now primarily handled by checkGameCompletion() after every submission.
    // So this specific setTimeout can be removed or left as an initial "well done!"
    // if (foundWords.size === currentPuzzle.words.length + (currentPuzzle.spangram ? 1 : 0)) {
    //     setTimeout(() => showMessageBox("Congratulations!", "You found all the words!"), 1000);
    // }
}

function addFoundWordToList(word, isSpangram) {
    const wordSpan = document.createElement('span');
    wordSpan.classList.add('px-3', 'py-1', 'rounded-full', 'font-semibold', 'text-white', 'text-sm', 'mr-2', 'mb-2');
    wordSpan.textContent = word.toUpperCase();
    if (isSpangram) {
        wordSpan.classList.add('bg-blue-600');
    } else {
        wordSpan.classList.add('bg-green-600');
    }
    foundWordsList.appendChild(wordSpan);
}

function checkSpangramTouch(path) {
    if (!path || path.length === 0) return false;

    let minR = GRID_SIZE, maxR = -1;
    let minC = GRID_SIZE, maxC = -1;

    path.forEach(coords => {
        minR = Math.min(minR, coords.r);
        maxR = Math.max(maxR, coords.r);
        minC = Math.min(minC, coords.c);
        maxC = Math.max(maxC, coords.c);
    });

    const touchesOppositeRows = (minR === 0 && maxR === GRID_SIZE - 1);
    const touchesOppositeCols = (minC === 0 && maxC === GRID_SIZE - 1);

    return touchesOppositeRows || touchesOppositeCols;
}

// --- NEW: checkGameCompletion function ---
// This function determines if the entire puzzle has been solved.
function checkGameCompletion() {
    // Check if the spangram has been found (by checking if its uppercase version is in foundWords)
    const spangramFound = foundWords.has(currentPuzzle.spangram.toUpperCase());

    // Check if all regular theme words have been found
    const allThemeWordsFound = currentPuzzle.words.every(word => foundWords.has(word.toUpperCase()));

    // If both the spangram AND all theme words are found
    if (spangramFound && allThemeWordsFound) {
        // Game is completely won!
        // Prevent further interaction with the grid and buttons
        strandsGridContainer.style.pointerEvents = 'none';
        submitWordBtn.disabled = true;
        clearSelectionBtn.disabled = true;
        hintBtn.disabled = true;

        // Show the final congratulatory message and reveal the stacking game button
        showMessageBox(
            "CONGRATULATIONS!",
            "You've found all the words and the Spangram! You're a Strands master!",
            () => { // This function runs when the message box "OK" button is clicked
                hideMessageBox(); // Hide the current message box

                // --- THIS IS THE KEY PART TO SHOW THE BUTTON ---
                if (stackingGameButton) { // Ensure the button element exists
                    stackingGameButton.style.display = 'flex'; // Make the button visible
                    // Optional: Scroll to the button if it's off-screen
                    // stackingGameButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        );
    }
}


// --- HINT SYSTEM ---

function handleHint() {
    // Prevent getting new hints if one is already active
    if (hintedWord !== null) {
        showMessageBox("Hint Active", `You already have a hint for "${hintedWord}". Find it to get another hint!`);
        return;
    }

    if (hintsUsed >= MAX_HINTS) {
        showMessageBox("No More Hints", "You've used all your hints for this puzzle.");
        return;
    }

    const unfoundWords = currentPuzzle.words.filter(word => !foundWords.has(word.toUpperCase()));

    if (unfoundWords.length === 0) {
        showMessageBox("No Hints Needed", "You've found all the theme words!");
        return;
    }

    hintsUsed++;
    hintsRemainingSpan.textContent = MAX_HINTS - hintsUsed;
    updateButtonStates();

    const hintWordToHighlight = unfoundWords[0]; // Get the first unfound word
    hintedWord = hintWordToHighlight.toUpperCase(); // Store it globally

    const hintPath = currentPuzzle.wordPaths[hintedWord];

    if (hintPath && hintPath.length > 0) {
        hintPath.forEach(coords => {
            const cellElement = document.querySelector(`.strands-cell[data-row="${coords.r}"][data-col="${coords.c}"]`);
            if (cellElement && !cellElement.classList.contains('found') && !cellElement.classList.contains('spangram-found')) {
                cellElement.classList.add('hint-reveal');
                // IMPORTANT: We do NOT remove 'hint-reveal' here, it stays until found
            }
        });
        showMessageBox("Hint Provided", `The letters for a theme word have been highlighted. The theme is "${currentPuzzle.theme}".`);
    } else {
        // This case indicates an issue with the puzzle definition (wordPath missing or empty)
        showMessageBox("Hint Error", "Could not find a valid hint path for an unfound word. Please check puzzle data.");
        // If there was an error, don't count this as a used hint for future hints,
        // but still decrement to prevent spamming if it's a persistent data error.
        hintsUsed--;
        hintsRemainingSpan.textContent = MAX_HINTS - hintsUsed;
    }
}

// --- UI / BUTTON STATE MANAGEMENT ---

function updateButtonStates() {
    submitWordBtn.disabled = selectedCells.length === 0;
    // Disable hint button if all hints are used OR if a word is currently hinted
    hintBtn.disabled = hintsUsed >= MAX_HINTS || hintedWord !== null;
}

// --- MESSAGE BOX FUNCTIONS ---

function showMessageBox(title, text, onCloseAction = null) {
    messageBoxTitle.textContent = title;
    messageBoxText.textContent = text;
    messageBox.classList.add('visible');

    // Clear previous event listeners to prevent multiple calls
    messageBoxCloseBtn.onclick = null;
    messageBoxCloseBtn.textContent = "OK"; // Default button text

    if (onCloseAction) {
        messageBoxCloseBtn.onclick = onCloseAction;
    } else {
        messageBoxCloseBtn.onclick = hideMessageBox;
    }
}

function hideMessageBox() {
    messageBox.classList.remove('visible');
}