interface Position {
  x: number;
  y: number;
}

interface Piece {
  shape: number[][];
  color: string;
  position: Position;
}

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 32;

const TETROMINO_SHAPES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  O: [
    [1, 1],
    [1, 1]
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0]
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0]
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0]
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0]
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0]
  ]
};

const TETROMINO_COLORS = {
  I: '#00f0f0',
  O: '#f0f000',
  T: '#a000f0',
  S: '#00f000',
  Z: '#f00000',
  J: '#0000f0',
  L: '#f0a000'
};

class TetrisGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private nextCanvas: HTMLCanvasElement;
  private nextCtx: CanvasRenderingContext2D;
  private board: number[][];
  private currentPiece: Piece | null = null;
  private nextPiece: Piece | null = null;
  private score = 0;
  private level = 1;
  private lines = 0;
  private dropTime = 0;
  private lastTime = 0;
  private gameRunning = true;

  constructor() {
    this.canvas = document.getElementById('tetris') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.nextCanvas = document.getElementById('next') as HTMLCanvasElement;
    this.nextCtx = this.nextCanvas.getContext('2d')!;
    
    this.board = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0));
    
    this.nextPiece = this.createRandomPiece();
    this.spawnNewPiece();
    
    this.setupEventListeners();
    this.gameLoop();
  }

  private createRandomPiece(): Piece {
    const shapes = Object.keys(TETROMINO_SHAPES) as (keyof typeof TETROMINO_SHAPES)[];
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    
    return {
      shape: TETROMINO_SHAPES[randomShape],
      color: TETROMINO_COLORS[randomShape],
      position: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 }
    };
  }

  private spawnNewPiece(): void {
    this.currentPiece = this.nextPiece!;
    this.currentPiece.position = { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 };
    this.nextPiece = this.createRandomPiece();
    
    if (this.isCollision(this.currentPiece, this.currentPiece.position)) {
      this.gameRunning = false;
      alert('ゲームオーバー！');
    }
  }

  private isCollision(piece: Piece, position: Position): boolean {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = position.x + x;
          const newY = position.y + y;
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return true;
          }
          
          if (newY >= 0 && this.board[newY][newX]) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private placePiece(): void {
    if (!this.currentPiece) return;
    
    for (let y = 0; y < this.currentPiece.shape.length; y++) {
      for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
        if (this.currentPiece.shape[y][x]) {
          const boardY = this.currentPiece.position.y + y;
          const boardX = this.currentPiece.position.x + x;
          
          if (boardY >= 0) {
            this.board[boardY][boardX] = 1;
          }
        }
      }
    }
    
    this.clearLines();
    this.spawnNewPiece();
  }

  private clearLines(): void {
    let linesCleared = 0;
    
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (this.board[y].every(cell => cell !== 0)) {
        this.board.splice(y, 1);
        this.board.unshift(Array(BOARD_WIDTH).fill(0));
        linesCleared++;
        y++;
      }
    }
    
    if (linesCleared > 0) {
      this.lines += linesCleared;
      this.score += linesCleared * 100 * this.level;
      this.level = Math.floor(this.lines / 10) + 1;
      this.updateUI();
    }
  }

  private rotatePiece(): void {
    if (!this.currentPiece) return;
    
    const rotated = this.currentPiece.shape[0].map((_, index) =>
      this.currentPiece!.shape.map(row => row[index]).reverse()
    );
    
    const originalShape = this.currentPiece.shape;
    this.currentPiece.shape = rotated;
    
    if (this.isCollision(this.currentPiece, this.currentPiece.position)) {
      this.currentPiece.shape = originalShape;
    }
  }

  private movePiece(dx: number, dy: number): boolean {
    if (!this.currentPiece) return false;
    
    const newPosition = {
      x: this.currentPiece.position.x + dx,
      y: this.currentPiece.position.y + dy
    };
    
    if (!this.isCollision(this.currentPiece, newPosition)) {
      this.currentPiece.position = newPosition;
      return true;
    }
    
    return false;
  }

  private drop(): void {
    if (!this.movePiece(0, 1)) {
      this.placePiece();
    }
  }

  private dropPiece(): void {
    if (!this.currentPiece) return;
    
    while (this.movePiece(0, 1)) {
      this.score += 2;
    }
    this.updateUI();
  }

  private setupEventListeners(): void {
    document.addEventListener('keydown', (event) => {
      if (!this.gameRunning) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          this.movePiece(-1, 0);
          break;
        case 'ArrowRight':
          this.movePiece(1, 0);
          break;
        case 'ArrowDown':
          if (this.movePiece(0, 1)) {
            this.score += 1;
            this.updateUI();
          }
          break;
        case 'ArrowUp':
          this.rotatePiece();
          break;
        case ' ':
          event.preventDefault();
          this.dropPiece();
          break;
      }
    });
  }

  private draw(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.drawBoard();
    this.drawCurrentPiece();
    this.drawNext();
  }

  private drawBoard(): void {
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (this.board[y][x]) {
          this.ctx.fillStyle = '#ffffff';
          this.ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
          this.ctx.strokeStyle = '#000000';
          this.ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
      }
    }
  }

  private drawCurrentPiece(): void {
    if (!this.currentPiece) return;
    
    this.ctx.fillStyle = this.currentPiece.color;
    
    for (let y = 0; y < this.currentPiece.shape.length; y++) {
      for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
        if (this.currentPiece.shape[y][x]) {
          const drawX = (this.currentPiece.position.x + x) * BLOCK_SIZE;
          const drawY = (this.currentPiece.position.y + y) * BLOCK_SIZE;
          
          this.ctx.fillRect(drawX, drawY, BLOCK_SIZE, BLOCK_SIZE);
          this.ctx.strokeStyle = '#000000';
          this.ctx.strokeRect(drawX, drawY, BLOCK_SIZE, BLOCK_SIZE);
        }
      }
    }
  }

  private drawNext(): void {
    this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
    
    if (!this.nextPiece) return;
    
    this.nextCtx.fillStyle = this.nextPiece.color;
    const blockSize = 20;
    
    for (let y = 0; y < this.nextPiece.shape.length; y++) {
      for (let x = 0; x < this.nextPiece.shape[y].length; x++) {
        if (this.nextPiece.shape[y][x]) {
          this.nextCtx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
          this.nextCtx.strokeStyle = '#000000';
          this.nextCtx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
        }
      }
    }
  }

  private updateUI(): void {
    document.getElementById('score')!.textContent = this.score.toString();
    document.getElementById('level')!.textContent = this.level.toString();
    document.getElementById('lines')!.textContent = this.lines.toString();
  }

  private gameLoop = (time: number = 0): void => {
    const deltaTime = time - this.lastTime;
    this.lastTime = time;
    
    if (this.gameRunning) {
      this.dropTime += deltaTime;
      
      if (this.dropTime > 1000 / this.level) {
        this.drop();
        this.dropTime = 0;
      }
      
      this.draw();
    }
    
    requestAnimationFrame(this.gameLoop);
  };
}

new TetrisGame();