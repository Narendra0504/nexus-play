// NEXUS FAMILY PASS - FOOTER COMPONENT
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-brand">
          <div class="logo">Nexus Family Pass</div>
          <p class="copyright">© {{ currentYear }} Nexus Family Pass. All rights reserved.</p>
        </div>
        
        <div class="footer-links">
          <div class="link-group">
            <h4>Legal</h4>
            <a routerLink="/terms">Terms of Service</a>
            <a routerLink="/privacy">Privacy Policy</a>
            <a routerLink="/cookies">Cookie Policy</a>
          </div>
          <div class="link-group">
            <h4>Support</h4>
            <a routerLink="/help">Help Center</a>
            <a routerLink="/contact">Contact Us</a>
            <a routerLink="/faq">FAQ</a>
          </div>
          <div class="link-group">
            <h4>Company</h4>
            <a routerLink="/about">About Us</a>
            <a routerLink="/careers">Careers</a>
            <a routerLink="/blog">Blog</a>
          </div>
        </div>

        <div class="footer-social">
          <a href="#" aria-label="Facebook"><mat-icon>facebook</mat-icon></a>
          <a href="#" aria-label="Twitter"><mat-icon>alternate_email</mat-icon></a>
          <a href="#" aria-label="LinkedIn"><mat-icon>work</mat-icon></a>
          <a href="#" aria-label="Instagram"><mat-icon>photo_camera</mat-icon></a>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer { background: #1a202c; color: #a0aec0; padding: 2rem 1.5rem; }
    .footer-content { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 2fr 1fr; gap: 2rem; align-items: start; }
    .logo { font-size: 1.25rem; font-weight: 600; color: white; margin-bottom: 0.5rem; }
    .copyright { font-size: 0.75rem; }
    .footer-links { display: flex; gap: 3rem; justify-content: center; }
    .link-group h4 { color: white; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.75rem; }
    .link-group a { display: block; font-size: 0.875rem; margin-bottom: 0.5rem; color: #a0aec0; text-decoration: none; }
    .link-group a:hover { color: white; }
    .footer-social { display: flex; gap: 1rem; justify-content: flex-end; }
    .footer-social a { color: #a0aec0; }
    .footer-social a:hover { color: white; }
    @media (max-width: 768px) {
      .footer-content { grid-template-columns: 1fr; text-align: center; }
      .footer-links { justify-content: center; flex-wrap: wrap; }
      .footer-social { justify-content: center; }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
