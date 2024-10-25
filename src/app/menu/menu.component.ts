import { Component, AfterViewInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar'; // Importuj MatToolbarModule
import { RouterModule } from '@angular/router'; // Importuj RouterModule, jeśli korzystasz z routerLink
@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [MatToolbarModule, RouterModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements AfterViewInit  {
  ngAfterViewInit() {
    const doc = document;
    const menuOpen = doc.querySelector(".menu");
    const menuClose = doc.querySelector(".close");
    const overlay = doc.querySelector(".overlay");
    const overlayLinks = doc.querySelectorAll(".overlay__content a"); // Pobieramy wszystkie linki w menu mobilnym


    if (menuOpen && menuClose && overlay) {
      menuOpen.addEventListener("click", () => {
        overlay.classList.add("overlay--active");
      });

      menuClose.addEventListener("click", () => {
        overlay.classList.remove("overlay--active");
      });
      //overlay__content

      // Dodaj zdarzenie kliknięcia dla każdego linku w menu mobilnym
      overlayLinks.forEach(link => {
        link.addEventListener("click", () => {
          overlay.classList.remove("overlay--active");
        });
      });
    }
  }
}
