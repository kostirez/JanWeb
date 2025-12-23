import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Position {
  x: number;
  y: number;
}

interface Enemy extends Position {
  direction: string;
}

@Component({
  selector: 'app-pacman',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pacman.component.html',
  styleUrl: './pacman.component.scss'
})
export class PacmanComponent implements OnInit, OnDestroy {
  // 1 = wall, 0 = dot, 2 = empty
  maze: number[][] = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 2, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 2, 2, 2, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
    [1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ];

  rows = 15;
  cols = 15;

  player: Position = { x: 7, y: 13 };
  enemies: Enemy[] = [
    { x: 6, y: 7, direction: 'UP' },
    { x: 7, y: 7, direction: 'UP' },
    { x: 8, y: 7, direction: 'UP' }
  ];

  score = 0;
  gameOver = false;
  gameWon = false;
  gameRunning = false;
  characterSelected = false;
  selectedSkin = '';

  private gameLoopId?: any;
  private enemyMoveCounter = 0;

  ngOnInit() {}

  ngOnDestroy() {
    this.stopGame();
  }

  selectCharacter(skin: string) {
    this.selectedSkin = skin;
    this.characterSelected = true;
    this.startGame();
  }

  startGame() {
    this.resetPositions();
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
    this.gameRunning = true;
    this.resetMaze();

    this.gameLoopId = setInterval(() => this.update(), 150);
  }

  resetPositions() {
    this.player = { x: 7, y: 13 };
    this.enemies = [
      { x: 6, y: 7, direction: 'UP' },
      { x: 7, y: 7, direction: 'UP' },
      { x: 8, y: 7, direction: 'UP' }
    ];
  }

  resetMaze() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.maze[r][c] === 2 && (r !== 7 || (c < 6 || c > 8))) {
           // Actually, let's just use a static maze and copy it if needed,
           // but for simplicity, I'll just hardcode dots where they should be.
        }
      }
    }
    // Re-fill dots (0s)
    this.maze = this.maze.map(row => row.map(cell => cell === 2 ? 2 : (cell === 1 ? 1 : 0)));
    // Remove dots from starting positions
    this.maze[13][7] = 2; // Player start
    this.maze[7][6] = 2; // Enemy start
    this.maze[7][7] = 2;
    this.maze[7][8] = 2;
  }

  stopGame() {
    this.gameRunning = false;
    if (this.gameLoopId) clearInterval(this.gameLoopId);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (!this.gameRunning) return;

    switch (event.key) {
      case 'ArrowUp': this.movePlayer(0, -1); break;
      case 'ArrowDown': this.movePlayer(0, 1); break;
      case 'ArrowLeft': this.movePlayer(-1, 0); break;
      case 'ArrowRight': this.movePlayer(1, 0); break;
    }
  }

  movePlayer(dx: number, dy: number) {
    if (!this.gameRunning) return;

    const newX = this.player.x + dx;
    const newY = this.player.y + dy;

    if (this.isValidMove(newX, newY)) {
      this.player.x = newX;
      this.player.y = newY;
      this.checkCollisions();
    }
  }

  isValidMove(x: number, y: number): boolean {
    return x >= 0 && x < this.cols && y >= 0 && y < this.rows && this.maze[y][x] !== 1;
  }

  update() {
    if (!this.gameRunning) return;

    this.enemyMoveCounter++;
    if (this.enemyMoveCounter >= 2) {
      this.moveEnemies();
      this.enemyMoveCounter = 0;
    }

    this.checkCollisions();
  }

  moveEnemies() {
    this.enemies.forEach(enemy => {
      const directions = [
        { x: 0, y: -1, name: 'UP' },
        { x: 0, y: 1, name: 'DOWN' },
        { x: -1, y: 0, name: 'LEFT' },
        { x: 1, y: 0, name: 'RIGHT' }
      ];

      // Try to continue in same direction, or pick a random valid one
      let possibleMoves = directions.filter(d => this.isValidMove(enemy.x + d.x, enemy.y + d.y));

      if (possibleMoves.length > 0) {
        // Preferred direction (keep going if possible)
        let move = possibleMoves.find(d => d.name === enemy.direction);

        // If at an intersection or blocked, pick random
        if (!move || possibleMoves.length > 2) {
          move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        }

        enemy.x += move.x;
        enemy.y += move.y;
        enemy.direction = move.name;
      }
    });
  }

  checkCollisions() {
    // Check dot collection
    if (this.maze[this.player.y][this.player.x] === 0) {
      this.maze[this.player.y][this.player.x] = 2;
      this.score += 10;
      this.checkWin();
    }

    // Check enemy collision
    this.enemies.forEach(enemy => {
      if (enemy.x === this.player.x && enemy.y === this.player.y) {
        this.endGame(false);
      }
    });
  }

  checkWin() {
    let dotsLeft = false;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.maze[r][c] === 0) {
          dotsLeft = true;
          break;
        }
      }
    }
    if (!dotsLeft) {
      this.endGame(true);
    }
  }

  endGame(win: boolean) {
    this.gameRunning = false;
    this.gameOver = true;
    this.gameWon = win;
    this.stopGame();
  }

  restart() {
    this.characterSelected = false;
    this.gameOver = false;
    this.gameWon = false;
  }
}
