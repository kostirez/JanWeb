import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../environments/environment';
import { GameComponent } from './game/game.component';
import { PacmanComponent } from './pacman/pacman.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, GameComponent, PacmanComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  layout: 'terka' | 'janko' = environment.gameMode as 'terka' | 'janko';

  constructor() { }
}
