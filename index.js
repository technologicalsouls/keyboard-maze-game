//set up Matter
const {
    Engine,
    Render,
    Runner,
    World,
    Bodies,
    Body,
    Events
} = Matter;

const cellsHorizontal = 8;
const cellsVertical = 6;
const width = window.innerWidth;
const height = window.innerHeight;

const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const engine = Engine.create();

engine.world.gravity.y = 0; //disable gravity

const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes:false,
        width,
        height
    }
});
Render.run(render);
Runner.run(Runner.create(), engine);
//end of Matter set up

// WALLS- WINDOW FRAME -
const walls = [
    Bodies.rectangle(width/2, 0, width, 2, {isStatic: true}),
    Bodies.rectangle(width/2, height, width, 2, {isStatic: true}),
    Bodies.rectangle(0, height/2, 2, height, {isStatic: true}),
    Bodies.rectangle(width, height/2, 2, height, {isStatic: true})
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

//Grid - Verticals and Horizontals
const grid = Array(cellsVertical) //number of rows
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false)); //columns

// VERTICAL ARRAYS
const verticals = Array(cellsVertical).
    fill(null)
    .map(() => Array(cellsHorizontal - 1).fill(false));

// HORIZONTAL ARRAYS
const horizontals = Array(cellsVertical -1)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

// console.log(grid);

// PICK RANDOM STARTING CELL - starting point
//need index of vert and hori (random between 0-2)
//mult cells var by random number
const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

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
        if (
            nextRow < 0 ||
            nextRow >= cellsVertical ||
            nextColumn < 0 ||
            nextColumn >= cellsHorizontal
        ) {
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
};

stepThroughCell(startRow, startColumn);
// stepThroughCell(1, 1);
// console.log(horizontals);

// draw grid lines (MatterJS rectangles)
//draw rows
horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }
        //draw rectangle
        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + (unitLengthX / 2),  //center x direction
            rowIndex * unitLengthY + unitLengthY, //y dir
            unitLengthX,
            1,
            {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: 'gray'
                }
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
            columnIndex * unitLengthX + unitLengthX,
            rowIndex * unitLengthY + (unitLengthY / 2),
            1,
            unitLengthY,
            {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: 'gray'
                }
            }
        );
        World.add(world, wall);
    });
});

// GOAL
const goal = Bodies.rectangle(
    width - (unitLengthX / 2),
    height - (unitLengthY / 2),
    unitLengthX * 0.6,
    unitLengthY * 0.6,
    {
        isStatic: true,
        label: 'goal',
        render: {
            fillStyle: 'pink'
        }
    }
);
World.add(world, goal);

// BALL
const ballRadius = Math.min(unitLengthX, unitLengthY)/4;
const ball = Bodies.circle(
    unitLengthX / 2,
    unitLengthY / 2,
    ballRadius,
    {
        label: 'ball',
        render: {
            fillStyle: 'white'
        }
    }
);
World.add(world, ball);

document.addEventListener('keydown', event => {
    const { x, y } = ball.velocity;
    if (event.keyCode === 87) {
        // console.log('move ball up');
        Body.setVelocity(ball, {x, y: y - 5 });
    }
    if (event.keyCode === 68) {
        // console.log('move ball right');
        Body.setVelocity(ball, {x: x+5, y: y });
    }
    if (event.keyCode === 83) {
        // console.log('move ball down');
        Body.setVelocity(ball, {x: x, y: y+5 });
    }
    if (event.keyCode === 65) {
        // console.log('move ball left');
        Body.setVelocity(ball, {x: x-5, y: y });
    }
});

// WIN CONDITION
Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach( collision => {
        const labels = ['ball', 'goal'];
        if (
            labels.includes(collision.bodyA.label) &&
            labels.includes(collision.bodyB.label)
        ) {
            document.querySelector('.winner').classList.remove('hidden');
            //turn gravity back on
            world.gravity.y = 1;
            //loop over all walls - remove static flag
            world.bodies.forEach(body => {
                if (body.label === 'wall') {
                    Body.setStatic(body, false);
                }
            });
        }
    });
});