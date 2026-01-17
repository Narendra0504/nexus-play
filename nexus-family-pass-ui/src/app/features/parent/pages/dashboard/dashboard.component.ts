// =====================================================
// NEXUS FAMILY PASS - PARENT DASHBOARD COMPONENT
// Main dashboard view for parents with activities,
// bookings, and personalized recommendations
// =====================================================

import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';

import { AuthService } from '../../../../core/services/auth.service';

interface Child {
  id: string;
  name: string;
  age: number;
  avatar: string;
  interests: string[];
}

interface Activity {
  id: string;
  title: string;
  category: string;
  categoryIcon: string;
  venue: string;
  image: string;
  rating: number;
  reviewCount: number;
  distance: string;
  credits: number;
  ageRange: string;
  nextSlot: string;
  isFavorite: boolean;
  forChild?: string;
}

interface Booking {
  id: string;
  activityTitle: string;
  venue: string;
  childName: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'completed';
  image: string;
}

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatMenuModule
  ],
  template: `
    <div class="dashboard-container">
      <!-- Location Permission Banner -->
      <div class="location-banner" *ngIf="showLocationBanner()" @slideDown>
        <div class="location-banner-content">
          <div class="location-icon-wrapper">
            <mat-icon>location_on</mat-icon>
          </div>
          <div class="location-text">
            <h4>Enable Location Services</h4>
            <p>Allow location access to discover amazing activities near you!</p>
          </div>
          <div class="location-actions">
            <button class="btn-allow" (click)="requestLocationPermission()">
              <mat-icon>check</mat-icon>
              Allow Access
            </button>
            <button class="btn-later" (click)="dismissLocationBanner()">
              Maybe Later
            </button>
          </div>
        </div>
        <button class="banner-close" (click)="dismissLocationBanner()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Location Enabled Indicator -->
      <div class="location-status" *ngIf="locationEnabled() && currentLocation()">
        <mat-icon>location_on</mat-icon>
        <span>{{ currentLocation() }}</span>
        <button class="change-location" (click)="changeLocation()">Change</button>
      </div>

      <!-- Welcome Section -->
      <section class="welcome-section">
        <div class="welcome-card">
          <div class="welcome-content">
            <div class="welcome-text">
              <h1 class="welcome-title">
                Welcome back, {{ firstName() }}! 
                <span class="wave-emoji">👋</span>
              </h1>
              <p class="welcome-subtitle">
                Ready to discover new adventures for your little ones?
              </p>
            </div>
            <div class="welcome-stats">
              <div class="stat-item">
                <div class="stat-icon upcoming">
                  <mat-icon>event</mat-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-value">{{ upcomingBookings().length }}</span>
                  <span class="stat-label">Upcoming</span>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon favorites">
                  <mat-icon>favorite</mat-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-value">{{ favoritesCount() }}</span>
                  <span class="stat-label">Favorites</span>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon children">
                  <mat-icon>face</mat-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-value">{{ children().length }}</span>
                  <span class="stat-label">Children</span>
                </div>
              </div>
            </div>
          </div>
          <div class="welcome-illustration">
            <div class="illustration-circle">
              <mat-icon>celebration</mat-icon>
            </div>
          </div>
        </div>
      </section>

      <!-- Children Quick View -->
      <section class="children-section" *ngIf="children().length > 0">
        <div class="section-header">
          <h2 class="section-title">Your Children</h2>
          <a routerLink="/parent/children" class="view-all-link">
            Manage
            <mat-icon>arrow_forward</mat-icon>
          </a>
        </div>
        <div class="children-chips">
          <button 
            *ngFor="let child of children()" 
            class="child-chip"
            [class.active]="selectedChild() === child.id"
            (click)="selectChild(child.id)">
            <span class="child-avatar">{{ child.name[0] }}</span>
            <span class="child-name">{{ child.name }}</span>
            <span class="child-age">{{ child.age }} yrs</span>
          </button>
        </div>
      </section>

      <!-- Picked for Your Children Section -->
      <section class="recommendations-section">
        <div class="section-header">
          <div class="section-title-group">
            <h2 class="section-title">
              <mat-icon class="title-icon">auto_awesome</mat-icon>
              Picked for {{ selectedChildName() || 'Your Children' }} This Month
            </h2>
            <p class="section-subtitle">Personalized recommendations based on interests</p>
          </div>
          <a routerLink="/parent/activities" class="view-all-btn">
            View All Suggestions
            <mat-icon>arrow_forward</mat-icon>
          </a>
        </div>

        <div class="activities-carousel">
          <button class="carousel-btn prev" (click)="scrollCarousel('recommendations', -1)">
            <mat-icon>chevron_left</mat-icon>
          </button>
          
          <div class="activities-scroll" #recommendationsScroll>
            <div class="activity-card" *ngFor="let activity of recommendedActivities()">
              <div class="activity-image" [style.backgroundImage]="'url(' + activity.image + ')'">
                <div class="activity-badges">
                  <span class="category-badge">
                    <mat-icon>{{ activity.categoryIcon }}</mat-icon>
                    {{ activity.category }}
                  </span>
                  <span class="credits-badge">{{ activity.credits }} Credits</span>
                </div>
                <button 
                  class="favorite-btn" 
                  [class.active]="activity.isFavorite"
                  (click)="toggleFavorite(activity, $event)">
                  <mat-icon>{{ activity.isFavorite ? 'favorite' : 'favorite_border' }}</mat-icon>
                </button>
                <div class="for-child-tag" *ngIf="activity.forChild">
                  <mat-icon>face</mat-icon>
                  For {{ activity.forChild }}
                </div>
              </div>
              <div class="activity-content">
                <h3 class="activity-title">{{ activity.title }}</h3>
                <div class="activity-venue">
                  <mat-icon>location_on</mat-icon>
                  <span>{{ activity.venue }}</span>
                  <span class="distance">• {{ activity.distance }}</span>
                </div>
                <div class="activity-meta">
                  <div class="rating">
                    <mat-icon>star</mat-icon>
                    <span>{{ activity.rating }}</span>
                    <span class="review-count">({{ activity.reviewCount }})</span>
                  </div>
                  <div class="age-range">
                    <mat-icon>child_care</mat-icon>
                    {{ activity.ageRange }}
                  </div>
                </div>
                <div class="activity-footer">
                  <div class="next-slot">
                    <mat-icon>schedule</mat-icon>
                    {{ activity.nextSlot }}
                  </div>
                  <button class="book-btn" routerLink="/parent/activities/{{ activity.id }}">
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button class="carousel-btn next" (click)="scrollCarousel('recommendations', 1)">
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>
      </section>

      <!-- Coming Up Section -->
      <section class="coming-up-section">
        <div class="section-header">
          <div class="section-title-group">
            <h2 class="section-title">
              <mat-icon class="title-icon">calendar_today</mat-icon>
              Coming Up
            </h2>
            <p class="section-subtitle">Your scheduled activities this week</p>
          </div>
          <a routerLink="/parent/bookings" class="view-all-btn">
            View All Bookings
            <mat-icon>arrow_forward</mat-icon>
          </a>
        </div>

        <div class="bookings-carousel" *ngIf="upcomingBookings().length > 0">
          <button class="carousel-btn prev" (click)="scrollCarousel('bookings', -1)">
            <mat-icon>chevron_left</mat-icon>
          </button>

          <div class="bookings-scroll" #bookingsScroll>
            <div class="booking-card" *ngFor="let booking of upcomingBookings()">
              <div class="booking-image" [style.backgroundImage]="'url(' + booking.image + ')'">
                <span class="booking-status" [class]="booking.status">
                  {{ booking.status | titlecase }}
                </span>
              </div>
              <div class="booking-content">
                <h4 class="booking-title">{{ booking.activityTitle }}</h4>
                <div class="booking-venue">
                  <mat-icon>location_on</mat-icon>
                  {{ booking.venue }}
                </div>
                <div class="booking-details">
                  <div class="booking-child">
                    <mat-icon>face</mat-icon>
                    {{ booking.childName }}
                  </div>
                  <div class="booking-datetime">
                    <mat-icon>event</mat-icon>
                    {{ booking.date }} • {{ booking.time }}
                  </div>
                </div>
                <div class="booking-actions">
                  <button class="action-btn secondary" matTooltip="View Details">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button class="action-btn secondary" matTooltip="Reschedule">
                    <mat-icon>edit_calendar</mat-icon>
                  </button>
                  <button class="action-btn secondary" matTooltip="Get Directions">
                    <mat-icon>directions</mat-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button class="carousel-btn next" (click)="scrollCarousel('bookings', 1)">
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>

        <!-- Empty State -->
        <div class="empty-bookings" *ngIf="upcomingBookings().length === 0">
          <div class="empty-icon">
            <mat-icon>event_available</mat-icon>
          </div>
          <h3>No upcoming activities</h3>
          <p>Book an activity to get started!</p>
          <button class="primary-btn" routerLink="/parent/activities">
            Browse Activities
          </button>
        </div>
      </section>

      <!-- Explore Categories Section -->
      <section class="categories-section">
        <div class="section-header">
          <h2 class="section-title">
            <mat-icon class="title-icon">explore</mat-icon>
            Explore Categories
          </h2>
        </div>
        <div class="categories-grid">
          <a *ngFor="let category of categories" 
             [routerLink]="['/parent/activities']" 
             [queryParams]="{category: category.id}"
             class="category-card"
             [style.--category-color]="category.color">
            <div class="category-icon">
              <mat-icon>{{ category.icon }}</mat-icon>
            </div>
            <span class="category-name">{{ category.name }}</span>
            <span class="category-count">{{ category.count }} activities</span>
          </a>
        </div>
      </section>

      <!-- Popular Nearby Section -->
      <section class="popular-section">
        <div class="section-header">
          <div class="section-title-group">
            <h2 class="section-title">
              <mat-icon class="title-icon">local_fire_department</mat-icon>
              Popular Near You
            </h2>
            <p class="section-subtitle">Trending activities in your area</p>
          </div>
        </div>

        <div class="popular-grid">
          <div class="popular-card" *ngFor="let activity of popularActivities()">
            <div class="popular-image" [style.backgroundImage]="'url(' + activity.image + ')'">
              <button 
                class="favorite-btn" 
                [class.active]="activity.isFavorite"
                (click)="toggleFavorite(activity, $event)">
                <mat-icon>{{ activity.isFavorite ? 'favorite' : 'favorite_border' }}</mat-icon>
              </button>
              <span class="popular-badge">🔥 Trending</span>
            </div>
            <div class="popular-content">
              <h4 class="popular-title">{{ activity.title }}</h4>
              <div class="popular-info">
                <span class="popular-rating">
                  <mat-icon>star</mat-icon>
                  {{ activity.rating }}
                </span>
                <span class="popular-distance">{{ activity.distance }}</span>
                <span class="popular-credits">{{ activity.credits }} Credits</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    /* =====================================================
       DASHBOARD CONTAINER
       ===================================================== */
    .dashboard-container {
      max-width: 1400px;
      margin: 0 auto;
      animation: fadeIn 0.4s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* =====================================================
       LOCATION BANNER
       ===================================================== */
    .location-banner {
      background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
      border: 2px solid #93c5fd;
      border-radius: 20px;
      padding: 20px 24px;
      margin-bottom: 24px;
      position: relative;
      animation: slideDown 0.4s ease;
    }

    .location-banner-content {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }

    .location-icon-wrapper {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
      flex-shrink: 0;
    }

    .location-icon-wrapper mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: white;
    }

    .location-text {
      flex: 1;
      min-width: 200px;
    }

    .location-text h4 {
      font-family: var(--font-family-display);
      font-size: 18px;
      font-weight: 700;
      color: #1e40af;
      margin: 0 0 4px;
    }

    .location-text p {
      font-size: 14px;
      color: #3b82f6;
      margin: 0;
    }

    .location-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .btn-allow {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }

    .btn-allow mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .btn-allow:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
    }

    .btn-later {
      padding: 12px 24px;
      background: transparent;
      color: #3b82f6;
      border: 2px solid #93c5fd;
      border-radius: 12px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-later:hover {
      background: white;
      border-color: #3b82f6;
    }

    .banner-close {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .banner-close mat-icon {
      font-size: 20px;
      color: #64748b;
    }

    .banner-close:hover {
      background: rgba(0, 0, 0, 0.1);
    }

    /* Location Status */
    .location-status {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%);
      border-radius: 12px;
      margin-bottom: 24px;
      font-size: 14px;
      font-weight: 600;
      color: #166534;
    }

    .location-status mat-icon {
      font-size: 20px;
      color: #22c55e;
    }

    .change-location {
      margin-left: auto;
      background: transparent;
      border: none;
      color: #15803d;
      font-weight: 600;
      cursor: pointer;
      text-decoration: underline;
    }

    .change-location:hover {
      color: #166534;
    }

    /* =====================================================
       WELCOME SECTION
       ===================================================== */
    .welcome-section {
      margin-bottom: 32px;
    }

    .welcome-card {
      background: linear-gradient(135deg, var(--color-primary) 0%, #a855f7 50%, #ec4899 100%);
      border-radius: 24px;
      padding: 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      box-shadow: 0 10px 40px rgba(124, 58, 237, 0.3);
      overflow: hidden;
      position: relative;
    }

    .welcome-card::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
      pointer-events: none;
    }

    .welcome-content {
      flex: 1;
      z-index: 1;
    }

    .welcome-text {
      margin-bottom: 24px;
    }

    .welcome-title {
      font-family: var(--font-family-display);
      font-size: 32px;
      font-weight: 800;
      color: white;
      margin: 0 0 8px;
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .wave-emoji {
      display: inline-block;
      animation: wave 1.5s ease-in-out infinite;
    }

    @keyframes wave {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(20deg); }
      75% { transform: rotate(-10deg); }
    }

    .welcome-subtitle {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.9);
      margin: 0;
    }

    .welcome-stats {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      padding: 12px 20px;
      border-radius: 16px;
    }

    .stat-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon.upcoming {
      background: rgba(34, 197, 94, 0.3);
    }

    .stat-icon.favorites {
      background: rgba(239, 68, 68, 0.3);
    }

    .stat-icon.children {
      background: rgba(59, 130, 246, 0.3);
    }

    .stat-icon mat-icon {
      font-size: 24px;
      color: white;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-family: var(--font-family-display);
      font-size: 24px;
      font-weight: 800;
      color: white;
      line-height: 1;
    }

    .stat-label {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.8);
      font-weight: 600;
    }

    .welcome-illustration {
      z-index: 1;
    }

    .illustration-circle {
      width: 120px;
      height: 120px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .illustration-circle mat-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      color: white;
    }

    @media (max-width: 768px) {
      .welcome-card {
        padding: 24px;
        flex-direction: column;
        text-align: center;
      }

      .welcome-title {
        font-size: 24px;
        justify-content: center;
      }

      .welcome-stats {
        justify-content: center;
      }

      .welcome-illustration {
        display: none;
      }
    }

    /* =====================================================
       CHILDREN SECTION
       ===================================================== */
    .children-section {
      margin-bottom: 32px;
    }

    .children-chips {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .child-chip {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 20px 10px 10px;
      background: white;
      border: 2px solid var(--color-border);
      border-radius: 50px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .child-chip:hover {
      border-color: var(--color-primary-light);
      background: var(--color-primary-50);
    }

    .child-chip.active {
      border-color: var(--color-primary);
      background: var(--color-primary-50);
    }

    .child-avatar {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, var(--color-primary) 0%, #ec4899 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 14px;
    }

    .child-name {
      font-weight: 700;
      color: var(--color-text-primary);
      font-size: 14px;
    }

    .child-age {
      font-size: 12px;
      color: var(--color-text-muted);
      background: var(--color-gray-100);
      padding: 4px 8px;
      border-radius: 20px;
    }

    /* =====================================================
       SECTION HEADERS
       ===================================================== */
    .section-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 20px;
      gap: 16px;
      flex-wrap: wrap;
    }

    .section-title-group {
      flex: 1;
    }

    .section-title {
      font-family: var(--font-family-display);
      font-size: 22px;
      font-weight: 700;
      color: var(--color-text-primary);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .title-icon {
      font-size: 24px;
      color: var(--color-primary);
    }

    .section-subtitle {
      font-size: 14px;
      color: var(--color-text-secondary);
      margin: 4px 0 0;
    }

    .view-all-btn,
    .view-all-link {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      font-weight: 600;
      color: var(--color-primary);
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 10px;
      transition: all 0.2s ease;
    }

    .view-all-btn:hover,
    .view-all-link:hover {
      background: var(--color-primary-50);
    }

    .view-all-btn mat-icon,
    .view-all-link mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* =====================================================
       CAROUSEL STYLES
       ===================================================== */
    .activities-carousel,
    .bookings-carousel {
      position: relative;
      margin: 0 -8px;
    }

    .activities-scroll,
    .bookings-scroll {
      display: flex;
      gap: 20px;
      overflow-x: auto;
      scroll-behavior: smooth;
      padding: 8px;
      scrollbar-width: none;
    }

    .activities-scroll::-webkit-scrollbar,
    .bookings-scroll::-webkit-scrollbar {
      display: none;
    }

    .carousel-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 44px;
      height: 44px;
      background: white;
      border: 1px solid var(--color-border);
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      z-index: 10;
      transition: all 0.2s ease;
    }

    .carousel-btn:hover {
      background: var(--color-primary);
      border-color: var(--color-primary);
      box-shadow: 0 6px 20px rgba(124, 58, 237, 0.3);
    }

    .carousel-btn:hover mat-icon {
      color: white;
    }

    .carousel-btn mat-icon {
      font-size: 24px;
      color: var(--color-text-secondary);
    }

    .carousel-btn.prev {
      left: -12px;
    }

    .carousel-btn.next {
      right: -12px;
    }

    @media (max-width: 768px) {
      .carousel-btn {
        display: none;
      }
    }

    /* =====================================================
       ACTIVITY CARDS
       ===================================================== */
    .activity-card {
      flex: 0 0 320px;
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
    }

    .activity-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
    }

    .activity-image {
      height: 180px;
      background-size: cover;
      background-position: center;
      position: relative;
    }

    .activity-badges {
      position: absolute;
      top: 12px;
      left: 12px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .category-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      color: var(--color-primary);
    }

    .category-badge mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .credits-badge {
      padding: 6px 12px;
      background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%);
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      color: #1f2937;
    }

    .favorite-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.95);
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .favorite-btn mat-icon {
      font-size: 22px;
      color: var(--color-text-muted);
    }

    .favorite-btn:hover {
      transform: scale(1.1);
    }

    .favorite-btn.active mat-icon {
      color: #ef4444;
    }

    .for-child-tag {
      position: absolute;
      bottom: 12px;
      left: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: linear-gradient(135deg, var(--color-primary) 0%, #ec4899 100%);
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      color: white;
    }

    .for-child-tag mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .activity-content {
      padding: 20px;
    }

    .activity-title {
      font-family: var(--font-family-display);
      font-size: 17px;
      font-weight: 700;
      color: var(--color-text-primary);
      margin: 0 0 8px;
      line-height: 1.3;
    }

    .activity-venue {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: var(--color-text-secondary);
      margin-bottom: 12px;
    }

    .activity-venue mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--color-primary-light);
    }

    .distance {
      color: var(--color-text-muted);
    }

    .activity-meta {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
    }

    .rating {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .rating mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #fbbf24;
    }

    .review-count {
      color: var(--color-text-muted);
      font-weight: 500;
    }

    .age-range {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: var(--color-text-secondary);
    }

    .age-range mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--color-primary-light);
    }

    .activity-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 16px;
      border-top: 1px solid var(--color-border-light);
    }

    .next-slot {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #16a34a;
      font-weight: 600;
    }

    .next-slot mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .book-btn {
      padding: 10px 20px;
      background: linear-gradient(135deg, var(--color-primary) 0%, #a855f7 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .book-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
    }

    /* =====================================================
       BOOKING CARDS
       ===================================================== */
    .booking-card {
      flex: 0 0 300px;
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
    }

    .booking-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .booking-image {
      height: 120px;
      background-size: cover;
      background-position: center;
      position: relative;
    }

    .booking-status {
      position: absolute;
      top: 12px;
      right: 12px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
    }

    .booking-status.confirmed {
      background: #dcfce7;
      color: #166534;
    }

    .booking-status.pending {
      background: #fef3c7;
      color: #92400e;
    }

    .booking-status.completed {
      background: #e0e7ff;
      color: #3730a3;
    }

    .booking-content {
      padding: 16px;
    }

    .booking-title {
      font-family: var(--font-family-display);
      font-size: 16px;
      font-weight: 700;
      color: var(--color-text-primary);
      margin: 0 0 8px;
    }

    .booking-venue {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: var(--color-text-secondary);
      margin-bottom: 12px;
    }

    .booking-venue mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--color-primary-light);
    }

    .booking-details {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 16px;
    }

    .booking-child,
    .booking-datetime {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--color-text-secondary);
    }

    .booking-child mat-icon,
    .booking-datetime mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--color-text-muted);
    }

    .booking-actions {
      display: flex;
      gap: 8px;
    }

    .action-btn {
      flex: 1;
      height: 40px;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .action-btn.secondary {
      background: var(--color-gray-100);
    }

    .action-btn.secondary mat-icon {
      font-size: 20px;
      color: var(--color-text-secondary);
    }

    .action-btn.secondary:hover {
      background: var(--color-primary-50);
    }

    .action-btn.secondary:hover mat-icon {
      color: var(--color-primary);
    }

    /* Empty Bookings */
    .empty-bookings {
      text-align: center;
      padding: 48px 24px;
      background: white;
      border-radius: 20px;
      border: 2px dashed var(--color-border);
    }

    .empty-bookings .empty-icon {
      width: 80px;
      height: 80px;
      background: var(--color-primary-50);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }

    .empty-bookings .empty-icon mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: var(--color-primary);
    }

    .empty-bookings h3 {
      font-size: 18px;
      font-weight: 700;
      color: var(--color-text-primary);
      margin: 0 0 8px;
    }

    .empty-bookings p {
      font-size: 14px;
      color: var(--color-text-secondary);
      margin: 0 0 20px;
    }

    .primary-btn {
      padding: 12px 24px;
      background: linear-gradient(135deg, var(--color-primary) 0%, #a855f7 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .primary-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
    }

    /* =====================================================
       CATEGORIES SECTION
       ===================================================== */
    .categories-section {
      margin-bottom: 32px;
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 16px;
    }

    .category-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 16px;
      background: white;
      border-radius: 20px;
      text-decoration: none;
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }

    .category-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      border-color: var(--category-color, var(--color-primary));
    }

    .category-icon {
      width: 56px;
      height: 56px;
      background: var(--category-color, var(--color-primary-50));
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
    }

    .category-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: var(--category-color, var(--color-primary));
    }

    .category-name {
      font-weight: 700;
      font-size: 14px;
      color: var(--color-text-primary);
      margin-bottom: 4px;
    }

    .category-count {
      font-size: 12px;
      color: var(--color-text-muted);
    }

    /* =====================================================
       POPULAR SECTION
       ===================================================== */
    .popular-section {
      margin-bottom: 32px;
    }

    .popular-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 20px;
    }

    .popular-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
      transition: all 0.3s ease;
    }

    .popular-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }

    .popular-image {
      height: 140px;
      background-size: cover;
      background-position: center;
      position: relative;
    }

    .popular-badge {
      position: absolute;
      bottom: 12px;
      left: 12px;
      padding: 6px 12px;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      color: white;
    }

    .popular-content {
      padding: 16px;
    }

    .popular-title {
      font-family: var(--font-family-display);
      font-size: 15px;
      font-weight: 700;
      color: var(--color-text-primary);
      margin: 0 0 8px;
    }

    .popular-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .popular-rating {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .popular-rating mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: #fbbf24;
    }

    .popular-distance,
    .popular-credits {
      font-size: 12px;
      color: var(--color-text-muted);
    }

    .popular-credits {
      background: #fef3c7;
      color: #92400e;
      padding: 4px 8px;
      border-radius: 20px;
      font-weight: 600;
    }

    /* =====================================================
       RECOMMENDATIONS SECTION
       ===================================================== */
    .recommendations-section,
    .coming-up-section {
      margin-bottom: 32px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  // Location
  showLocationBanner = signal(true);
  locationEnabled = signal(false);
  currentLocation = signal<string | null>(null);
  locationPreferenceSaved = signal(false);

  // Children
  children = signal<Child[]>([
    { id: '1', name: 'Emma', age: 7, avatar: 'E', interests: ['Art', 'Dance'] },
    { id: '2', name: 'Liam', age: 5, avatar: 'L', interests: ['Soccer', 'Swimming'] }
  ]);
  selectedChild = signal<string | null>(null);

  // Stats
  favoritesCount = signal(5);

  // Categories
  categories = [
    { id: 'sports', name: 'Sports', icon: 'sports_soccer', count: 24, color: '#22c55e' },
    { id: 'arts', name: 'Arts & Crafts', icon: 'palette', count: 18, color: '#ec4899' },
    { id: 'music', name: 'Music', icon: 'music_note', count: 15, color: '#8b5cf6' },
    { id: 'dance', name: 'Dance', icon: 'directions_run', count: 12, color: '#f97316' },
    { id: 'stem', name: 'STEM', icon: 'science', count: 20, color: '#3b82f6' },
    { id: 'swimming', name: 'Swimming', icon: 'pool', count: 8, color: '#06b6d4' }
  ];

  // Recommended Activities
  recommendedActivities = signal<Activity[]>([
    {
      id: '1',
      title: 'Creative Art Workshop',
      category: 'Arts',
      categoryIcon: 'palette',
      venue: 'Little Picasso Studio',
      image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400',
      rating: 4.9,
      reviewCount: 128,
      distance: '0.8 km',
      credits: 2,
      ageRange: '5-10 yrs',
      nextSlot: 'Tomorrow 10:00 AM',
      isFavorite: true,
      forChild: 'Emma'
    },
    {
      id: '2',
      title: 'Junior Soccer Training',
      category: 'Sports',
      categoryIcon: 'sports_soccer',
      venue: 'City Sports Complex',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400',
      rating: 4.8,
      reviewCount: 95,
      distance: '1.2 km',
      credits: 2,
      ageRange: '4-8 yrs',
      nextSlot: 'Sat 9:00 AM',
      isFavorite: false,
      forChild: 'Liam'
    },
    {
      id: '3',
      title: 'Kids Yoga & Mindfulness',
      category: 'Wellness',
      categoryIcon: 'self_improvement',
      venue: 'Zen Kids Center',
      image: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=400',
      rating: 4.7,
      reviewCount: 67,
      distance: '2.1 km',
      credits: 1,
      ageRange: '5-12 yrs',
      nextSlot: 'Today 4:00 PM',
      isFavorite: false
    },
    {
      id: '4',
      title: 'Swimming Lessons',
      category: 'Swimming',
      categoryIcon: 'pool',
      venue: 'AquaKids Academy',
      image: 'https://images.unsplash.com/photo-1560090995-01632a28895b?w=400',
      rating: 4.9,
      reviewCount: 203,
      distance: '1.5 km',
      credits: 3,
      ageRange: '4-10 yrs',
      nextSlot: 'Mon 3:00 PM',
      isFavorite: true,
      forChild: 'Liam'
    },
    {
      id: '5',
      title: 'Piano for Beginners',
      category: 'Music',
      categoryIcon: 'piano',
      venue: 'Melody Music School',
      image: 'https://images.unsplash.com/photo-1552422535-c45813c61732?w=400',
      rating: 4.6,
      reviewCount: 54,
      distance: '3.2 km',
      credits: 2,
      ageRange: '6-12 yrs',
      nextSlot: 'Wed 5:00 PM',
      isFavorite: false,
      forChild: 'Emma'
    }
  ]);

  // Upcoming Bookings
  upcomingBookings = signal<Booking[]>([
    {
      id: '1',
      activityTitle: 'Creative Art Workshop',
      venue: 'Little Picasso Studio',
      childName: 'Emma',
      date: 'Tomorrow',
      time: '10:00 AM',
      status: 'confirmed',
      image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400'
    },
    {
      id: '2',
      activityTitle: 'Swimming Lessons',
      venue: 'AquaKids Academy',
      childName: 'Liam',
      date: 'Sat, Jan 20',
      time: '11:00 AM',
      status: 'confirmed',
      image: 'https://images.unsplash.com/photo-1560090995-01632a28895b?w=400'
    },
    {
      id: '3',
      activityTitle: 'Junior Soccer Training',
      venue: 'City Sports Complex',
      childName: 'Liam',
      date: 'Sat, Jan 20',
      time: '3:00 PM',
      status: 'pending',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400'
    }
  ]);

  // Popular Activities
  popularActivities = signal<Activity[]>([
    {
      id: '6',
      title: 'Robotics Club',
      category: 'STEM',
      categoryIcon: 'smart_toy',
      venue: 'Tech Kids Lab',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400',
      rating: 4.8,
      reviewCount: 156,
      distance: '2.5 km',
      credits: 3,
      ageRange: '7-12 yrs',
      nextSlot: 'Sat 2:00 PM',
      isFavorite: false
    },
    {
      id: '7',
      title: 'Ballet for Kids',
      category: 'Dance',
      categoryIcon: 'directions_run',
      venue: 'Grace Dance Academy',
      image: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=400',
      rating: 4.9,
      reviewCount: 89,
      distance: '1.8 km',
      credits: 2,
      ageRange: '4-8 yrs',
      nextSlot: 'Tue 4:00 PM',
      isFavorite: true
    },
    {
      id: '8',
      title: 'Cooking for Kids',
      category: 'Life Skills',
      categoryIcon: 'restaurant',
      venue: 'Little Chefs Kitchen',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
      rating: 4.7,
      reviewCount: 72,
      distance: '3.0 km',
      credits: 2,
      ageRange: '6-12 yrs',
      nextSlot: 'Sun 11:00 AM',
      isFavorite: false
    }
  ]);

  firstName = computed(() => {
    const user = this.authService.currentUser();
    return user?.firstName || 'Parent';
  });

  selectedChildName = computed(() => {
    const childId = this.selectedChild();
    if (!childId) return null;
    const child = this.children().find(c => c.id === childId);
    return child?.name || null;
  });

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.checkLocationPreference();
  }

  // Location methods
  checkLocationPreference(): void {
    // Mock: Check if user has previously granted location permission
    const savedPreference = localStorage.getItem('nfp_location_permission');
    if (savedPreference === 'granted') {
      this.showLocationBanner.set(false);
      this.locationEnabled.set(true);
      this.currentLocation.set('Koramangala, Bangalore');
      this.locationPreferenceSaved.set(true);
    } else if (savedPreference === 'denied') {
      this.showLocationBanner.set(true);
    }
    // If no saved preference, show banner (first time user)
  }

  requestLocationPermission(): void {
    // Mock geolocation request
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Success - save preference
          localStorage.setItem('nfp_location_permission', 'granted');
          this.showLocationBanner.set(false);
          this.locationEnabled.set(true);
          this.currentLocation.set('Koramangala, Bangalore');
          this.locationPreferenceSaved.set(true);
        },
        (error) => {
          // Error or denied
          console.log('Location permission denied:', error.message);
          localStorage.setItem('nfp_location_permission', 'denied');
          this.showLocationBanner.set(false);
        }
      );
    } else {
      // Geolocation not supported - use mock
      localStorage.setItem('nfp_location_permission', 'granted');
      this.showLocationBanner.set(false);
      this.locationEnabled.set(true);
      this.currentLocation.set('Koramangala, Bangalore');
    }
  }

  dismissLocationBanner(): void {
    this.showLocationBanner.set(false);
    // Don't save preference - will ask again next time
  }

  changeLocation(): void {
    // Would open a location picker modal
    alert('Location picker would open here');
  }

  // Child selection
  selectChild(childId: string): void {
    if (this.selectedChild() === childId) {
      this.selectedChild.set(null);
    } else {
      this.selectedChild.set(childId);
    }
  }

  // Favorites
  toggleFavorite(activity: Activity, event: Event): void {
    event.stopPropagation();
    activity.isFavorite = !activity.isFavorite;
    
    if (activity.isFavorite) {
      this.favoritesCount.update(c => c + 1);
    } else {
      this.favoritesCount.update(c => c - 1);
    }
  }

  // Carousel scrolling
  scrollCarousel(type: string, direction: number): void {
    const scrollAmount = 340;
    let container: Element | null = null;

    if (type === 'recommendations') {
      container = document.querySelector('.activities-scroll');
    } else if (type === 'bookings') {
      container = document.querySelector('.bookings-scroll');
    }

    if (container) {
      container.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
      });
    }
  }
}