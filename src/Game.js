import React from 'react';
import './Game.css';

const CELL_SIZE = 20;
const WIDTH = 800;
const HEIGHT = 600;

class Cell extends React.Component {
    render() {
        const { x, y } = this.props;
        return (
            <div
                className='Cell'
                style={{
                    left: `${CELL_SIZE * x + 1}px`,
                    top: `${CELL_SIZE * y + 1}px`,
                    width: `${CELL_SIZE - 1}px`,
                    height: `${CELL_SIZE - 1}px`,
                    borderRadius: `40%`,
                }}
            />
        );
    }
}

class Game extends React.Component {
    constructor() {
        super();
        this.rows = HEIGHT / CELL_SIZE;
        this.cols = WIDTH / CELL_SIZE;

        this.board = this.makeEmptyBoard();
    }

    state = {
        cells: [],
        isRunning: false,
        interval: 1000,
        iteration: 0,
        isLight: true,
    };
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

    getElementOffset() {
        //getBoundingClientRect = get size and relative position to viewport of element
        const rect = this.boardRef.getBoundingClientRect();
        //document.Element = get document root element
        const doc = document.documentElement;

        return {
            x: rect.left + window.pageXOffset - doc.clientLeft,
            y: rect.top + window.pageYOffset - doc.clientTop,
        };
    }
    //create cells from this.board
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

    handleClick = (event) => {
        const elemOffset = this.getElementOffset();
        //clientX/Y = provides MouseEvent coordinate on respective axis
        const offsetX = event.clientX - elemOffset.x;
        const offsetY = event.clientY - elemOffset.y;

        const x = Math.floor(offsetX / CELL_SIZE);
        const y = Math.floor(offsetY / CELL_SIZE);

        //determine wether to render cell
        if (x >= 0 && x <= this.cols && y >= 0 && y <= this.rows) {
            this.board[y][x] = !this.board[y][x];
        }

        this.setState({ cells: this.makeCells() });
    };

    runGame = () => {
        this.setState({
            isRunning: true,
            iteration: this.state.iteration + 1,
        });

        this.runIteration();
    };

    runOnce = () => {
        this.setState({ isRunning: true, iteration: this.state.iteration + 1 });

        this.runIteration();
        this.stopGame();
    };

    stopGame = () => {
        this.setState({ isRunning: false });
        if (this.timeoutHandler) {
            window.clearTimeout(this.timeoutHandler);
            this.timeoutHandler = null;
        }
    };

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

    // handleIntervalChange = (event) => {
    //     this.setState({ interval: event.target.value });
    // };

    speedUp = () => {
        this.setState({ interval: this.state.interval - 100 });
        console.log(this.state.interval);
    };

    slowDown = () => {
        this.setState({ interval: this.state.interval + 100 });
        console.log(this.state.interval);
    };

    handleClear = () => {
        this.board = this.makeEmptyBoard();
        this.stopGame();
        this.setState({ cells: this.makeCells(), isRunning: false, iteration: 0 });
    };

    handleRandom = () => {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                this.board[y][x] = Math.random() >= 0.5;
            }
        }
        this.stopGame();
        this.setState({ cells: this.makeCells(), isRunning: false, iteration: 1 });
    };

    toggleTheme = () => {
        this.setState({ isLight: true });
        var targetTheme = 'light';
        var currentTheme = document.documentElement.getAttribute('data-theme');

        if (currentTheme === 'light') {
            this.setState({ isLight: false });
            targetTheme = 'dark';
        }
        console.log(targetTheme);

        document.documentElement.setAttribute('data-theme', targetTheme);
        localStorage.setItem('theme', targetTheme);
    };

    render() {
        const { cells, isRunning, isLight } = this.state;
        return (
            <div className='App'>
                <div className='top-layer'>
                    <h1 className='title'>Conway's Game of Life</h1>

                    <div
                        className='Board'
                        style={{ width: WIDTH, height: HEIGHT, backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px` }}
                        onClick={this.handleClick}
                        ref={(n) => {
                            this.boardRef = n;
                        }}>
                        {cells.map((cell) => (
                            <Cell x={cell.x} y={cell.y} key={`${cell.x},${cell.y}`} />
                        ))}
                    </div>
                    <div className='container'>
                        <div className='controls'>
                            {/* Update every <input value={this.state.interval} onChange={this.handleIntervalChange} /> msec */}
                            {isRunning ? (
                                <button className='button' onClick={this.stopGame}>
                                    Stop
                                </button>
                            ) : (
                                <button className='button' onClick={this.runGame}>
                                    Run
                                </button>
                            )}

                            <button className='button' onClick={this.handleRandom}>
                                Random
                            </button>
                            <button className='button' onClick={this.handleClear}>
                                Clear
                            </button>
                            <button className='button' onClick={this.runOnce}>
                                Next
                            </button>
                        </div>
                        <div className='speed'>
                            <button className='speedControls' onClick={this.slowDown}>
                                ???
                            </button>
                            <button className='speedControls' onClick={this.speedUp}>
                                +
                            </button>
                            <div className='counter'>
                                <div className='interval'>
                                    <p>Interval</p>
                                    <div style={{ fontSize: 30 }}>{this.state.interval} ms</div>
                                </div>
                                <div className='iteration'>
                                    <p>Iteration</p>
                                    <div style={{ fontSize: 30 }}>{this.state.iteration}</div>
                                </div>
                            </div>
                            <div>
                                {isLight ? (
                                    <button
                                        onClick={this.toggleTheme}
                                        id='theme-toggle'
                                        className='theme-switch'
                                        type='button'>
                                        Dark
                                    </button>
                                ) : (
                                    <button
                                        onClick={this.toggleTheme}
                                        id='theme-toggle'
                                        className='theme-switch'
                                        type='button'>
                                        Light
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Game;
