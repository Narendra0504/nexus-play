// =====================================================
// NEXUS FAMILY PASS - HR SUBSCRIPTION COMPONENT
// Subscription management page for HR administrators
// Shows plan details, billing info, and upgrade options
// =====================================================

// Import Angular core
import { Component, signal } from '@angular/core';

// Import CommonModule
import { CommonModule } from '@angular/common';

// Import Angular Material modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';

/**
 * SubscriptionComponent - HR Subscription Management
 * 
 * Allows HR administrators to:
 * - View current plan details
 * - See billing history
 * - Request plan upgrades
 * - Manage payment methods
 */
@Component({
  // Component selector
  selector: 'app-hr-subscription',
  
  // Standalone component
  standalone: true,
  
  // Import required modules
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatTableModule
  ],
  
  // Inline template
  template: `
    <!-- Subscription page container -->
    <div class="subscription-container p-6 max-w-4xl">
      
      <!-- Page header -->
      <div class="page-header mb-6">
        <h1 class="text-2xl font-display font-bold text-neutral-800">Subscription</h1>
        <p class="text-neutral-500">Manage your company's subscription plan</p>
      </div>

      <!-- Current plan card -->
      <mat-card class="mb-6">
        <mat-card-header>
          <mat-card-title class="flex items-center gap-2">
            Current Plan
            <mat-chip class="bg-success-100 text-success-600">Active</mat-chip>
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content class="pt-4">
          <div class="flex flex-col md:flex-row justify-between gap-6">
            <!-- Plan details -->
            <div class="flex-1">
              <h3 class="text-2xl font-bold text-primary-600 mb-2">{{ plan().name }}</h3>
              <p class="text-neutral-500 mb-4">{{ plan().description }}</p>
              
              <div class="space-y-2 text-sm">
                <div class="flex items-center gap-2">
                  <mat-icon class="text-success-600">check_circle</mat-icon>
                  <span>{{ plan().creditsPerEmployee }} credits per employee/month</span>
                </div>
                <div class="flex items-center gap-2">
                  <mat-icon class="text-success-600">check_circle</mat-icon>
                  <span>Up to {{ plan().maxEmployees }} employees</span>
                </div>
                <div class="flex items-center gap-2">
                  <mat-icon class="text-success-600">check_circle</mat-icon>
                  <span>{{ plan().features.join(', ') }}</span>
                </div>
              </div>
            </div>
            
            <!-- Billing summary -->
            <div class="bg-neutral-50 p-4 rounded-lg min-w-[200px]">
              <div class="text-sm text-neutral-500 mb-1">Monthly Cost</div>
              <div class="text-3xl font-bold text-neutral-800">{{ plan().price }}</div>
              <div class="text-sm text-neutral-500 mt-2">Next billing: {{ plan().nextBilling }}</div>
            </div>
          </div>
          
          <mat-divider class="my-6"></mat-divider>
          
          <div class="flex gap-2">
            <button mat-stroked-button color="primary">
              <mat-icon>upgrade</mat-icon>
              Upgrade Plan
            </button>
            <button mat-stroked-button>
              <mat-icon>support</mat-icon>
              Contact Sales
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Billing history card -->
      <mat-card>
        <mat-card-header>
          <mat-card-title>Billing History</mat-card-title>
          <mat-card-subtitle>Past invoices and payments</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content class="pt-4">
          <table mat-table [dataSource]="billingHistory()" class="w-full">
            
            <!-- Date column -->
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let row">{{ row.date }}</td>
            </ng-container>
            
            <!-- Description column -->
            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>Description</th>
              <td mat-cell *matCellDef="let row">{{ row.description }}</td>
            </ng-container>
            
            <!-- Amount column -->
            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let row">{{ row.amount }}</td>
            </ng-container>
            
            <!-- Status column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let row">
                <mat-chip class="bg-success-100 text-success-600">{{ row.status }}</mat-chip>
              </td>
            </ng-container>
            
            <!-- Actions column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let row">
                <button mat-icon-button (click)="downloadInvoice(row.id)">
                  <mat-icon>download</mat-icon>
                </button>
              </td>
            </ng-container>
            
            <tr mat-header-row *matHeaderRowDef="billingColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: billingColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  
  // Inline styles
  styles: [`
    .bg-success-100 { background-color: rgba(56, 161, 105, 0.1); }
    .text-success-600 { color: #38a169; }
    .text-primary-600 { color: #2c5282; }
  `]
})
export class SubscriptionComponent {
  // Table columns
  billingColumns = ['date', 'description', 'amount', 'status', 'actions'];

  // Current plan details
  plan = signal({
    name: 'Premium',
    description: 'Full access to all activities and premium support',
    creditsPerEmployee: 10,
    maxEmployees: 200,
    price: '$4,680',
    nextBilling: 'Feb 1, 2024',
    features: ['Priority booking', 'HR dashboard', 'API access', 'Dedicated support']
  });

  // Billing history
  billingHistory = signal([
    { id: 'inv_001', date: 'Jan 1, 2024', description: 'Monthly subscription - Premium', amount: '$4,680.00', status: 'Paid' },
    { id: 'inv_002', date: 'Dec 1, 2023', description: 'Monthly subscription - Premium', amount: '$4,680.00', status: 'Paid' },
    { id: 'inv_003', date: 'Nov 1, 2023', description: 'Monthly subscription - Premium', amount: '$4,680.00', status: 'Paid' }
  ]);

  /**
   * downloadInvoice - Download invoice PDF
   */
  downloadInvoice(invoiceId: string): void {
    console.log('[Subscription] Downloading invoice:', invoiceId);
  }
}
