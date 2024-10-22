import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar'; // Importuj MatToolbarModule
import { RouterModule } from '@angular/router'; // Importuj RouterModule, jeśli korzystasz z routerLink
@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [MatToolbarModule, RouterModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {

}
