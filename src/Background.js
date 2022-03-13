import React from 'react';
import './Game.css';

const CELL_SIZE = 30;
const WIDTH = '100%';
const HEIGHT = '200%';

class Cell extends React.Component {
    render() {
        const { x, y } = this.props;
        return (
            <div
                className='bg-cell'
                style={{
                    left: `${CELL_SIZE * x + 1}px`,
                    top: `${CELL_SIZE * y + 1}px`,
                    width: `${CELL_SIZE - 1}px`,
                    height: `${CELL_SIZE - 1}px`,
                }}
            />
        );
    }
}

class Background extends React.Component {
    constructor() {
        super();
        this.rows = HEIGHT / CELL_SIZE;
        this.cols = WIDTH / CELL_SIZE;

        this.board = this.makeEmptyBoard();
    }

    state = {
        cells: [],
        isRunning: true,
        interval: 2000,
        iteration: 0,
    };
    //create empty board
    makeEmptyBoard() {
        let board = [];
        for (let y = 0; y < this.rows; y++) {
            board[y] = [];
            for (let x = 0; x < this.cols; x++) {
                board[y][x] = false;
            }
        }

        return board;
    }

    makeCells() {
        let cells = [];
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.board[y][x]) {
                    cells.push({ x, y });
                }
            }
        }

        return cells;
    }
    runIteration() {
        let newBoard = this.makeEmptyBoard();

        //Rules
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                let neighbors = this.calculateNeighbors(this.board, x, y);
                if (this.board[y][x]) {
                    if (neighbors === 2 || neighbors === 3) {
                        newBoard[y][x] = true;
                    } else {
                        newBoard[y][x] = false;
                    }
                } else {
                    if (!this.board[y][x] && neighbors === 3) {
                        newBoard[y][x] = true;
                    }
                }
            }
        }

        this.board = newBoard;
        this.setState({ cells: this.makeCells() });

        this.timeoutHandler = window.setTimeout(() => {
            this.runIteration();
            this.setState({ iteration: this.state.iteration + 1 });
        }, this.state.interval);
    }

    /**
     * Calculate the number of neighbours at point (x, y)
     * @param {Array} board
     * @param {int} x
     * @param {int} y
     */
    calculateNeighbors(board, x, y) {
        let neighbors = 0;
        const dirs = [
            [-1, -1],
            [-1, 0],
            [-1, 1],
            [0, 1],
            [1, 1],
            [1, 0],
            [1, -1],
            [0, -1],
        ];
        for (let i = 0; i < dirs.length; i++) {
            const dir = dirs[i];
            let y1 = y + dir[0];
            let x1 = x + dir[1];

            if (x1 >= 0 && x1 < this.cols && y1 >= 0 && y1 < this.rows && board[y1][x1]) {
                neighbors++;
            }
        }

        return neighbors;
    }

    handleRandom = () => {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                this.board[y][x] = Math.random() >= 0.5;
            }
        }
        this.stopGame();
        this.setState({ cells: this.makeCells() });
    };

    render() {
        const { cells } = this.state;
        return (
            <>
                <div
                    className='bg-Board'
                    style={{ width: WIDTH, height: HEIGHT, backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px` }}
                    onClick={this.handleClick}
                    ref={(n) => {
                        this.boardRef = n;
                    }}>
                    {cells.map((cell) => (
                        <Cell x={cell.x} y={cell.y} key={`${cell.x},${cell.y}`} />
                    ))}
                </div>
            </>
        );
    }
}

export default Background;
