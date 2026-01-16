// =====================================================
// NEXUS FAMILY PASS - ADMIN COMPANIES COMPONENT
// Company management page for system administrators
// List, filter, and manage B2B company accounts
// =====================================================

// Import Angular core
import { Component, OnInit, signal } from '@angular/core';

// Import CommonModule
import { CommonModule } from '@angular/common';

// Import Forms
import { FormsModule } from '@angular/forms';

// Import Router
import { RouterLink } from '@angular/router';

// Import Angular Material modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';

/**
 * AdminCompaniesComponent - Company Management Page
 * 
 * Allows system administrators to:
 * - View all company accounts
 * - Filter and search companies
 * - View company details and usage
 * - Manage company status
 */
@Component({
  // Component selector
  selector: 'app-admin-companies',
  
  // Standalone component
  standalone: true,
  
  // Import required modules
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressBarModule
  ],
  
  // Inline template
  template: `
    <!-- Companies page container -->
    <div class="companies-container p-6">
      
      <!-- Page header -->
      <div class="page-header flex justify-between items-start mb-6">
        <div>
          <h1 class="text-2xl font-display font-bold text-neutral-800">Companies</h1>
          <p class="text-neutral-500">{{ totalCompanies() }} registered companies</p>
        </div>
        
        <button mat-raised-button color="primary" (click)="openAddCompanyDialog()">
          <mat-icon>add</mat-icon>
          Add Company
        </button>
      </div>

      <!-- Filters -->
      <mat-card class="mb-6">
        <mat-card-content class="py-4">
          <div class="flex flex-wrap gap-4 items-end">
            
            <!-- Search -->
            <mat-form-field appearance="outline" class="flex-1 min-w-[250px]">
              <mat-label>Search companies</mat-label>
              <mat-icon matPrefix>search</mat-icon>
              <input matInput [(ngModel)]="searchQuery" placeholder="Company name...">
            </mat-form-field>
            
            <!-- Plan filter -->
            <mat-form-field appearance="outline" class="w-40">
              <mat-label>Plan</mat-label>
              <mat-select [(ngModel)]="selectedPlan">
                <mat-option value="">All Plans</mat-option>
                <mat-option value="starter">Starter</mat-option>
                <mat-option value="professional">Professional</mat-option>
                <mat-option value="enterprise">Enterprise</mat-option>
              </mat-select>
            </mat-form-field>
            
            <!-- Status filter -->
            <mat-form-field appearance="outline" class="w-40">
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="selectedStatus">
                <mat-option value="">All Status</mat-option>
                <mat-option value="active">Active</mat-option>
                <mat-option value="trial">Trial</mat-option>
                <mat-option value="suspended">Suspended</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Companies table -->
      <mat-card>
        <mat-card-content class="p-0">
          <table mat-table [dataSource]="companies()" class="w-full">
            
            <!-- Company Name -->
            <ng-container matColumnDef="company">
              <th mat-header-cell *matHeaderCellDef>Company</th>
              <td mat-cell *matCellDef="let row">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded bg-primary-100 flex items-center justify-center">
                    <mat-icon class="text-primary-600">business</mat-icon>
                  </div>
                  <div>
                    <div class="font-medium text-neutral-800">{{ row.name }}</div>
                    <div class="text-sm text-neutral-500">{{ row.email }}</div>
                  </div>
                </div>
              </td>
            </ng-container>
            
            <!-- Plan -->
            <ng-container matColumnDef="plan">
              <th mat-header-cell *matHeaderCellDef>Plan</th>
              <td mat-cell *matCellDef="let row">
                <mat-chip [ngClass]="{
                  'bg-primary-100 text-primary-600': row.plan === 'Enterprise',
                  'bg-accent-100 text-accent-600': row.plan === 'Professional',
                  'bg-neutral-100 text-neutral-600': row.plan === 'Starter'
                }">
                  {{ row.plan }}
                </mat-chip>
              </td>
            </ng-container>
            
            <!-- Employees -->
            <ng-container matColumnDef="employees">
              <th mat-header-cell *matHeaderCellDef>Employees</th>
              <td mat-cell *matCellDef="let row">{{ row.employees }}</td>
            </ng-container>
            
            <!-- Usage -->
            <ng-container matColumnDef="usage">
              <th mat-header-cell *matHeaderCellDef>Monthly Usage</th>
              <td mat-cell *matCellDef="let row">
                <div class="flex items-center gap-2">
                  <mat-progress-bar mode="determinate" 
                                   [value]="row.usagePercentage"
                                   class="w-20">
                  </mat-progress-bar>
                  <span class="text-sm">{{ row.usagePercentage }}%</span>
                </div>
              </td>
            </ng-container>
            
            <!-- Status -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let row">
                <mat-chip [ngClass]="{
                  'bg-success-100 text-success-600': row.status === 'Active',
                  'bg-warning-100 text-warning-600': row.status === 'Trial',
                  'bg-danger-100 text-danger-600': row.status === 'Suspended'
                }">
                  {{ row.status }}
                </mat-chip>
              </td>
            </ng-container>
            
            <!-- Joined -->
            <ng-container matColumnDef="joined">
              <th mat-header-cell *matHeaderCellDef>Joined</th>
              <td mat-cell *matCellDef="let row">{{ row.joined }}</td>
            </ng-container>
            
            <!-- Actions -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let row">
                <button mat-icon-button [matMenuTriggerFor]="companyMenu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #companyMenu="matMenu">
                  <button mat-menu-item (click)="viewCompany(row)">
                    <mat-icon>visibility</mat-icon>
                    <span>View Details</span>
                  </button>
                  <button mat-menu-item (click)="editCompany(row)">
                    <mat-icon>edit</mat-icon>
                    <span>Edit</span>
                  </button>
                  <button mat-menu-item (click)="viewUsage(row)">
                    <mat-icon>analytics</mat-icon>
                    <span>Usage Report</span>
                  </button>
                  @if (row.status === 'Active') {
                    <button mat-menu-item class="text-danger-500" (click)="suspendCompany(row)">
                      <mat-icon>block</mat-icon>
                      <span>Suspend</span>
                    </button>
                  } @else {
                    <button mat-menu-item class="text-success-600" (click)="activateCompany(row)">
                      <mat-icon>check_circle</mat-icon>
                      <span>Activate</span>
                    </button>
                  }
                </mat-menu>
              </td>
            </ng-container>
            
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
          
          <!-- Paginator -->
          <mat-paginator [length]="totalCompanies()"
                        [pageSize]="10"
                        [pageSizeOptions]="[10, 25, 50]"
                        showFirstLastButtons>
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  
  // Inline styles
  styles: [`
    table { width: 100%; }
    
    .bg-primary-100 { background-color: rgba(44, 82, 130, 0.1); }
    .bg-accent-100 { background-color: rgba(49, 151, 149, 0.1); }
    .bg-success-100 { background-color: rgba(56, 161, 105, 0.1); }
    .bg-warning-100 { background-color: rgba(237, 137, 54, 0.1); }
    .bg-danger-100 { background-color: rgba(229, 62, 62, 0.1); }
    .bg-neutral-100 { background-color: #f7fafc; }
    
    .text-primary-600 { color: #2c5282; }
    .text-accent-600 { color: #319795; }
    .text-success-600 { color: #38a169; }
    .text-warning-600 { color: #dd6b20; }
    .text-danger-600 { color: #c53030; }
    .text-danger-500 { color: #e53e3e; }
    .text-neutral-600 { color: #4a5568; }
  `]
})
export class AdminCompaniesComponent implements OnInit {
  // Table columns
  displayedColumns = ['company', 'plan', 'employees', 'usage', 'status', 'joined', 'actions'];
  
  // Filter state
  searchQuery = '';
  selectedPlan = '';
  selectedStatus = '';
  
  // Data
  totalCompanies = signal<number>(45);
  companies = signal<any[]>([]);

  /**
   * ngOnInit - Load companies
   */
  ngOnInit(): void {
    this.loadCompanies();
  }

  /**
   * openAddCompanyDialog - Open dialog to add company
   */
  openAddCompanyDialog(): void {
    console.log('[Admin Companies] Open add dialog');
  }

  /**
   * viewCompany - View company details
   */
  viewCompany(company: any): void {
    console.log('[Admin Companies] View:', company);
  }

  /**
   * editCompany - Edit company
   */
  editCompany(company: any): void {
    console.log('[Admin Companies] Edit:', company);
  }

  /**
   * viewUsage - View usage report
   */
  viewUsage(company: any): void {
    console.log('[Admin Companies] View usage:', company);
  }

  /**
   * suspendCompany - Suspend company account
   */
  suspendCompany(company: any): void {
    console.log('[Admin Companies] Suspend:', company);
  }

  /**
   * activateCompany - Activate company account
   */
  activateCompany(company: any): void {
    console.log('[Admin Companies] Activate:', company);
  }

  /**
   * loadCompanies - Load company data
   */
  private loadCompanies(): void {
    this.companies.set([
      { id: '1', name: 'TechCorp Inc.', email: 'admin@techcorp.com', plan: 'Enterprise', employees: 156, usagePercentage: 72, status: 'Active', joined: 'Jan 15, 2023' },
      { id: '2', name: 'StartupXYZ', email: 'hr@startupxyz.com', plan: 'Professional', employees: 45, usagePercentage: 85, status: 'Active', joined: 'Mar 22, 2023' },
      { id: '3', name: 'Acme Corp', email: 'benefits@acme.com', plan: 'Enterprise', employees: 320, usagePercentage: 68, status: 'Active', joined: 'Feb 8, 2023' },
      { id: '4', name: 'NewCo', email: 'admin@newco.io', plan: 'Starter', employees: 12, usagePercentage: 45, status: 'Trial', joined: 'Jan 5, 2024' },
      { id: '5', name: 'BigTech Ltd', email: 'hr@bigtech.com', plan: 'Enterprise', employees: 890, usagePercentage: 91, status: 'Active', joined: 'Nov 18, 2022' }
    ]);
  }
}
