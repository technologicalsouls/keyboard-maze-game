//set up Matter
const {
    Engine,
    Render,
    Runner,
    World,
    Bodies,
} = Matter;

const cells = 3;
const width = 600;
const height = 600;
//unit relative to above dimen
const unitLength = width / cells;

const engine = Engine.create();
const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes:true,
        width,
        height
    }
});
Render.run(render);
Runner.run(Runner.create(), engine);
//end of Matter set up

// WALLS
const walls = [
    Bodies.rectangle(width/2, 0, width, 40, {isStatic: true}),
    Bodies.rectangle(width/2, height, width, 40, {isStatic: true}),
    Bodies.rectangle(0, height/2, 40, height, {isStatic: true}),
    Bodies.rectangle(width, height/2, 40, height, {isStatic: true})
];
World.add(world, walls);

// MAZE (grid) GENERATION
//shuffle -  for neighbors
const shuffle = (arr) => {
    let counter = arr.length;
    while (counter > 0) {
        //get random index inside array
        const index = Math.floor(Math.random() * counter);

        counter--;

        // swapping elements
        const temp = arr[counter];
        // swap at index counter to current
        arr[counter] = arr[index];
        arr[index] = temp;
    }
    return arr;
};

const grid = Array(cells) //rows
    .fill(null)
    .map(() => Array(cells).fill(false)); //columns

// VERTICAL ARRAYS
const verticals = Array(cells).
    fill(null)
    .map(() => Array(cells-1).fill(false));

// HORIZONTAL ARRAYS
const horizontals = Array(cells-1)
    .fill(null)
    .map(() => Array(cells).fill(false));

// console.log(grid);

// PICK RANDOM STARTING CELL - starting point
//need index of vert and hori (random between 0-2)
//mult cells var by random number
const startRow = Math.floor(Math.random() * cells);
const startColumn = Math.floor(Math.random() * cells);

//FOR THAT CELL - build a randomly-ordered list of neighbors
const stepThroughCell = (row, column) => {
    //check -- if have visited the cell at [row, column], then return
    if (grid[row][column]) {
        return;
    }   //mark this cell as being visited
    grid[row][column] = true;
    // else -- assemble randomly-ordred list of neighbors
        // figure out (neighbor coordinates) -- then randomize
    const neighbors = shuffle([
        //add third element to array - flag the direction of move // [nextRow, nextColumn, direction]
        [row -1, column, 'up'],
        [row, column + 1, 'right'],
        [row + 1, column, 'down'],
        [row, column - 1, 'left']
    ]);
    // console.log(neighbors);
    //ITERATING FOR NEIGH
        // for each neigbhor...
    for (let neighbor of neighbors) {
        const [nextRow, nextColumn, direction] = neighbor;
        //EXTREME CASES - see if that neighbor is out of bounds
        if (nextRow < 0 || nextRow >= cells || nextColumn < 0 || nextColumn >= cells) {
            continue; //don't leave for loop, just move on
        }
        //if we have visited that neigh, contn to next neighbor
        if (grid[nextRow][nextColumn]) {
            continue;
        }
        // remove a wall from either horizontals or verticals
        // update verticals
        if (direction === 'left') {
            verticals[row][column - 1] = true;
        } else if (direction === 'right') {
            verticals[row][column] = true;
        } //update horizontal
        else if (direction === 'up') {
            horizontals[row - 1][column] = true;
        } else if (direction === 'down') {
            horizontals[row][column] = true;
        }
        stepThroughCell(nextRow, nextColumn);
    }
    //visit that next cell

};

stepThroughCell(startRow, startColumn);
// stepThroughCell(1, 1);
// console.log(horizontals);

// draw grid lines (MatterJS rectangles)
//draw rows
horizontals.forEach( (row, rowIndex) => {
    row.forEach( (open, columnIndex) => {
        if (open) {
            return;
        }
        //draw rectangle
        const wall = Bodies.rectangle(
            columnIndex * unitLength + (unitLength / 2),
            rowIndex * unitLength + unitLength,
            unitLength,
            1,
            {
                isStatic: true
            }
        );
        World.add(world, wall);
    });
})

verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }
        const wall = Bodies.rectangle(
            columnIndex * unitLength + unitLength,
            rowIndex * unitLength + (unitLength / 2),
            1,
            unitLength,
            {
                isStatic: true
            }
        );
        World.add(world, wall);
    });
});