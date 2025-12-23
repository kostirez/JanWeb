import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Creature extends GameObject {
  id: number;
  speed: number;
}

interface Item extends GameObject {
  id: number;
  speed: number;
}

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent implements OnInit, OnDestroy {
  gameWidth = 800;
  gameHeight = 600;

  character: GameObject = { x: 375, y: 550, width: 50, height: 50 };
  creatures: Creature[] = [];
  items: Item[] = [];

  score = 0;
  gameOver = false;
  gameRunning = false;

  private gameLoopId?: any;
  private spawnIntervalId?: any;
  private nextId = 0;

  private movingLeft = false;
  private movingRight = false;

  ngOnInit() {
    this.startGame();
  }

  ngOnDestroy() {
    this.stopGame();
  }

  startGame() {
    this.gameOver = false;
    this.gameRunning = true;
    this.score = 0;
    this.creatures = [];
    this.items = [];
    this.character.x = (this.gameWidth - this.character.width) / 2;
    this.movingLeft = false;
    this.movingRight = false;

    this.gameLoopId = setInterval(() => this.update(), 1000 / 60);
    this.spawnIntervalId = setInterval(() => this.spawnCreature(), 2000);
  }

  stopGame() {
    this.gameRunning = false;
    this.movingLeft = false;
    this.movingRight = false;
    if (this.gameLoopId) clearInterval(this.gameLoopId);
    if (this.spawnIntervalId) clearInterval(this.spawnIntervalId);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (!this.gameRunning && this.gameOver && event.code === 'Space') {
      this.startGame();
      return;
    }

    if (!this.gameRunning) return;

    if (event.key === 'ArrowLeft') {
      this.movingLeft = true;
    } else if (event.key === 'ArrowRight') {
      this.movingRight = true;
    } else if (event.code === 'Space') {
      this.throwItem();
    }
  }

  @HostListener('window:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') {
      this.movingLeft = false;
    } else if (event.key === 'ArrowRight') {
      this.movingRight = false;
    }
  }

  startMoveLeft() {
    if (this.gameRunning) this.movingLeft = true;
  }

  stopMoveLeft() {
    this.movingLeft = false;
  }

  startMoveRight() {
    if (this.gameRunning) this.movingRight = true;
  }

  stopMoveRight() {
    this.movingRight = false;
  }

  throwItem() {
    if (!this.gameRunning) return;
    this.items.push({
      id: this.nextId++,
      x: this.character.x + this.character.width / 2 - 5,
      y: this.character.y - 10,
      width: 10,
      height: 10,
      speed: 7
    });
  }

  spawnCreature() {
    if (!this.gameRunning) return;

    this.creatures.push({
      id: this.nextId++,
      x: Math.random() * (this.gameWidth - 40),
      y: -40,
      width: 40,
      height: 40,
      speed: 2 + Math.random() * 2
    });
  }

  update() {
    if (!this.gameRunning) return;

    // Move character
    const step = 5;
    if (this.movingLeft) {
      this.character.x = Math.max(0, this.character.x - step);
    }
    if (this.movingRight) {
      this.character.x = Math.min(this.gameWidth - this.character.width, this.character.x + step);
    }

    // Move items
    this.items.forEach(item => item.y -= item.speed);
    this.items = this.items.filter(item => item.y + item.height > 0);

    // Move creatures
    this.creatures.forEach(creature => {
      creature.y += creature.speed;
      if (creature.y + creature.height > this.gameHeight) {
        this.endGame();
      }
    });

    // Collision detection
    for (let i = this.items.length - 1; i >= 0; i--) {
      for (let j = this.creatures.length - 1; j >= 0; j--) {
        if (this.checkCollision(this.items[i], this.creatures[j])) {
          this.items.splice(i, 1);
          this.creatures.splice(j, 1);
          this.score += 10;
          break;
        }
      }
    }
  }

  checkCollision(obj1: GameObject, obj2: GameObject): boolean {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
  }

  endGame() {
    this.gameOver = true;
    this.stopGame();
  }
}
