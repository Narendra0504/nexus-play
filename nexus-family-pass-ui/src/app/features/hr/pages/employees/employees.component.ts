// =====================================================
// NEXUS FAMILY PASS - HR EMPLOYEES COMPONENT
// Employee list and management page for HR administrators
// Shows enrolled employees, their usage, and enrollment status
// =====================================================

// Import Angular core
import { Component, OnInit, signal } from '@angular/core';

// Import CommonModule
import { CommonModule } from '@angular/common';

// Import Forms module for search
import { FormsModule } from '@angular/forms';

// Import Angular Material modules
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';

/**
 * EmployeesComponent - HR Employee Management Page
 * 
 * This component allows HR administrators to:
 * - View all enrolled employees
 * - Filter and search employees
 * - See individual usage statistics
 * - Add or remove employees from the program
 * - Export employee data
 */
@Component({
  // Component selector
  selector: 'app-hr-employees',
  
  // Standalone component
  standalone: true,
  
  // Import required modules
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule,
    MatProgressBarModule
  ],
  
  // Inline template with comments
  template: `
    <!-- Employees page container -->
    <div class="employees-container p-6">
      
      <!-- ================================================ -->
      <!-- PAGE HEADER WITH ACTIONS                         -->
      <!-- ================================================ -->
      <div class="page-header flex justify-between items-start mb-6">
        <div>
          <h1 class="text-2xl font-display font-bold text-neutral-800">Employees</h1>
          <p class="text-neutral-500">
            {{ totalEmployees() }} employees enrolled in the program
          </p>
        </div>
        
        <div class="flex gap-2">
          <!-- Export button -->
          <button mat-stroked-button (click)="exportEmployees()">
            <mat-icon>download</mat-icon>
            Export
          </button>
          
          <!-- Add employee button -->
          <button mat-raised-button color="primary" (click)="openAddEmployeeDialog()">
            <mat-icon>person_add</mat-icon>
            Add Employees
          </button>
        </div>
      </div>

      <!-- ================================================ -->
      <!-- FILTERS AND SEARCH BAR                           -->
      <!-- ================================================ -->
      <mat-card class="mb-6">
        <mat-card-content class="py-4">
          <div class="flex flex-wrap gap-4 items-end">
            
            <!-- Search input -->
            <mat-form-field appearance="outline" class="flex-1 min-w-[250px]">
              <mat-label>Search employees</mat-label>
              <mat-icon matPrefix>search</mat-icon>
              <input matInput 
                     [(ngModel)]="searchQuery" 
                     (ngModelChange)="onSearchChange()"
                     placeholder="Name or email...">
              <button mat-icon-button matSuffix 
                      *ngIf="searchQuery" 
                      (click)="clearSearch()">
                <mat-icon>close</mat-icon>
              </button>
            </mat-form-field>
            
            <!-- Department filter -->
            <mat-form-field appearance="outline" class="w-48">
              <mat-label>Department</mat-label>
              <mat-select [(ngModel)]="selectedDepartment" (selectionChange)="onFilterChange()">
                <mat-option value="">All Departments</mat-option>
                <mat-option *ngFor="let dept of departments()" [value]="dept">
                  {{ dept }}
                </mat-option>
              </mat-select>
            </mat-form-field>
            
            <!-- Status filter -->
            <mat-form-field appearance="outline" class="w-40">
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="selectedStatus" (selectionChange)="onFilterChange()">
                <mat-option value="">All Status</mat-option>
                <mat-option value="active">Active</mat-option>
                <mat-option value="inactive">Inactive</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- ================================================ -->
      <!-- EMPLOYEES TABLE                                   -->
      <!-- ================================================ -->
      <mat-card>
        <mat-card-content class="p-0">
          <table mat-table [dataSource]="filteredEmployees()" matSort 
                 (matSortChange)="onSortChange($event)" class="w-full">
            
            <!-- Employee Name Column -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Employee</th>
              <td mat-cell *matCellDef="let row">
                <div class="flex items-center gap-3">
                  <!-- Avatar circle with initials -->
                  <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span class="text-primary-600 font-medium">{{ row.initials }}</span>
                  </div>
                  <div>
                    <div class="font-medium text-neutral-800">{{ row.name }}</div>
                    <div class="text-sm text-neutral-500">{{ row.email }}</div>
                  </div>
                </div>
              </td>
            </ng-container>
            
            <!-- Department Column -->
            <ng-container matColumnDef="department">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Department</th>
              <td mat-cell *matCellDef="let row">{{ row.department }}</td>
            </ng-container>
            
            <!-- Children Column -->
            <ng-container matColumnDef="children">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Children</th>
              <td mat-cell *matCellDef="let row">{{ row.childrenCount }}</td>
            </ng-container>
            
            <!-- Credits Used Column -->
            <ng-container matColumnDef="creditsUsed">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Credits Used</th>
              <td mat-cell *matCellDef="let row">
                <div class="flex items-center gap-2">
                  <span>{{ row.creditsUsed }} / {{ row.creditsAllocated }}</span>
                  <mat-progress-bar mode="determinate" 
                                   [value]="(row.creditsUsed / row.creditsAllocated) * 100"
                                   class="w-16">
                  </mat-progress-bar>
                </div>
              </td>
            </ng-container>
            
            <!-- Last Activity Column -->
            <ng-container matColumnDef="lastActivity">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Last Activity</th>
              <td mat-cell *matCellDef="let row">{{ row.lastActivity }}</td>
            </ng-container>
            
            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
              <td mat-cell *matCellDef="let row">
                <mat-chip [ngClass]="{
                  'bg-success-100 text-success-600': row.status === 'active',
                  'bg-neutral-100 text-neutral-600': row.status === 'inactive'
                }">
                  {{ row.status | titlecase }}
                </mat-chip>
              </td>
            </ng-container>
            
            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let row">
                <button mat-icon-button [matMenuTriggerFor]="actionMenu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #actionMenu="matMenu">
                  <button mat-menu-item (click)="viewEmployeeDetails(row)">
                    <mat-icon>visibility</mat-icon>
                    <span>View Details</span>
                  </button>
                  <button mat-menu-item (click)="sendReminder(row)">
                    <mat-icon>email</mat-icon>
                    <span>Send Reminder</span>
                  </button>
                  <button mat-menu-item (click)="deactivateEmployee(row)" class="text-danger-500">
                    <mat-icon>person_off</mat-icon>
                    <span>Deactivate</span>
                  </button>
                </mat-menu>
              </td>
            </ng-container>
            
            <!-- Table rows -->
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            
            <!-- Empty state row -->
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell text-center py-8" [attr.colspan]="displayedColumns.length">
                <mat-icon class="text-neutral-300 scale-150 mb-2">search_off</mat-icon>
                <p class="text-neutral-500">No employees found matching your criteria</p>
              </td>
            </tr>
          </table>
          
          <!-- Paginator -->
          <mat-paginator [length]="totalEmployees()"
                        [pageSize]="pageSize"
                        [pageSizeOptions]="[10, 25, 50, 100]"
                        (page)="onPageChange($event)"
                        showFirstLastButtons>
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  
  // Inline styles
  styles: [`
    /* Table responsive wrapper */
    table {
      width: 100%;
    }

    /* Avatar styling */
    .bg-primary-100 { background-color: rgba(44, 82, 130, 0.1); }
    .text-primary-600 { color: #2c5282; }
    .bg-success-100 { background-color: rgba(56, 161, 105, 0.1); }
    .text-success-600 { color: #38a169; }
    .bg-neutral-100 { background-color: #f7fafc; }
    .text-neutral-600 { color: #4a5568; }
    .text-danger-500 { color: #e53e3e; }

    /* Progress bar in table */
    mat-progress-bar {
      height: 6px;
      border-radius: 3px;
    }
  `]
})
export class EmployeesComponent implements OnInit {
  // -------------------------------------------------
  // TABLE CONFIGURATION
  // -------------------------------------------------
  displayedColumns = ['name', 'department', 'children', 'creditsUsed', 'lastActivity', 'status', 'actions'];
  pageSize = 10;

  // -------------------------------------------------
  // FILTER STATE
  // -------------------------------------------------
  searchQuery = '';
  selectedDepartment = '';
  selectedStatus = '';

  // -------------------------------------------------
  // DATA SIGNALS
  // -------------------------------------------------
  totalEmployees = signal<number>(156);
  departments = signal<string[]>(['Engineering', 'Sales', 'Marketing', 'Operations', 'Finance', 'HR']);
  filteredEmployees = signal<any[]>([]);

  /**
   * ngOnInit - Load initial data
   */
  ngOnInit(): void {
    this.loadEmployees();
  }

  /**
   * onSearchChange - Handle search input changes
   */
  onSearchChange(): void {
    // TODO: Implement search filtering
    console.log('[Employees] Search:', this.searchQuery);
  }

  /**
   * clearSearch - Clear search input
   */
  clearSearch(): void {
    this.searchQuery = '';
    this.onSearchChange();
  }

  /**
   * onFilterChange - Handle filter selection changes
   */
  onFilterChange(): void {
    // TODO: Implement filter logic
    console.log('[Employees] Filters:', this.selectedDepartment, this.selectedStatus);
  }

  /**
   * onSortChange - Handle table sort
   */
  onSortChange(sort: Sort): void {
    console.log('[Employees] Sort:', sort.active, sort.direction);
  }

  /**
   * onPageChange - Handle pagination
   */
  onPageChange(event: PageEvent): void {
    console.log('[Employees] Page:', event.pageIndex, event.pageSize);
  }

  /**
   * exportEmployees - Export employee data to CSV
   */
  exportEmployees(): void {
    // TODO: Implement export
    console.log('[Employees] Exporting data...');
  }

  /**
   * openAddEmployeeDialog - Open dialog to add employees
   */
  openAddEmployeeDialog(): void {
    // TODO: Open dialog
    console.log('[Employees] Opening add employee dialog');
  }

  /**
   * viewEmployeeDetails - View employee details
   */
  viewEmployeeDetails(employee: any): void {
    console.log('[Employees] View details:', employee);
  }

  /**
   * sendReminder - Send usage reminder to employee
   */
  sendReminder(employee: any): void {
    console.log('[Employees] Send reminder to:', employee.email);
  }

  /**
   * deactivateEmployee - Deactivate employee from program
   */
  deactivateEmployee(employee: any): void {
    console.log('[Employees] Deactivate:', employee);
  }

  /**
   * loadEmployees - Load employee data
   */
  private loadEmployees(): void {
    // Mock data for demo
    this.filteredEmployees.set([
      { id: '1', name: 'Alice Smith', email: 'alice.smith@techcorp.com', initials: 'AS', department: 'Engineering', childrenCount: 2, creditsUsed: 8, creditsAllocated: 10, lastActivity: 'Jan 14, 2024', status: 'active' },
      { id: '2', name: 'Bob Johnson', email: 'bob.johnson@techcorp.com', initials: 'BJ', department: 'Sales', childrenCount: 1, creditsUsed: 5, creditsAllocated: 10, lastActivity: 'Jan 12, 2024', status: 'active' },
      { id: '3', name: 'Carol Williams', email: 'carol.williams@techcorp.com', initials: 'CW', department: 'Marketing', childrenCount: 3, creditsUsed: 10, creditsAllocated: 10, lastActivity: 'Jan 15, 2024', status: 'active' },
      { id: '4', name: 'David Brown', email: 'david.brown@techcorp.com', initials: 'DB', department: 'Operations', childrenCount: 1, creditsUsed: 2, creditsAllocated: 10, lastActivity: 'Dec 28, 2023', status: 'active' },
      { id: '5', name: 'Eva Martinez', email: 'eva.martinez@techcorp.com', initials: 'EM', department: 'Finance', childrenCount: 2, creditsUsed: 6, creditsAllocated: 10, lastActivity: 'Jan 10, 2024', status: 'active' },
      { id: '6', name: 'Frank Lee', email: 'frank.lee@techcorp.com', initials: 'FL', department: 'Engineering', childrenCount: 0, creditsUsed: 0, creditsAllocated: 10, lastActivity: 'Never', status: 'inactive' }
    ]);
  }
}
