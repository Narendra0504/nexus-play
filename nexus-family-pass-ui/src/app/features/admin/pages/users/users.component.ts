// =====================================================
// NEXUS FAMILY PASS - ADMIN USERS MANAGEMENT COMPONENT
// Platform admin component for managing all user accounts.
// Allows viewing, filtering, and managing users across
// all roles (parents, HR admins, venue admins).
// =====================================================

// Import Angular core
import { Component, OnInit, signal, computed } from '@angular/core';

// Import CommonModule
import { CommonModule } from '@angular/common';

// Import FormsModule for ngModel
import { FormsModule } from '@angular/forms';

// Import Angular Material components
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

/**
 * User interface for admin management
 */
interface ManagedUser {
  /** Unique user ID */
  id: string;
  
  /** User's email address */
  email: string;
  
  /** User's full name */
  name: string;
  
  /** User role */
  role: 'parent' | 'hr_admin' | 'venue_admin' | 'platform_admin';
  
  /** Associated company (for HR admins and parents) */
  company?: string;
  
  /** Associated venue (for venue admins) */
  venue?: string;
  
  /** Account status */
  status: 'active' | 'suspended' | 'pending';
  
  /** Account creation date */
  createdAt: string;
  
  /** Last login date */
  lastLogin?: string;
}

/**
 * AdminUsersComponent
 * 
 * Platform admin component for user management.
 * Features:
 * - User list with search and filters
 * - Role-based filtering
 * - Status indicators
 * - User actions (view, suspend, delete)
 * - Pagination
 */
@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <!-- Page container -->
    <div class="users-container p-6">
      
      <!-- ============================================ -->
      <!-- PAGE HEADER                                  -->
      <!-- ============================================ -->
      <div class="page-header mb-6">
        <div class="header-content">
          <h1 class="page-title">User Management</h1>
          <p class="page-subtitle">Manage all platform users and their access</p>
        </div>
        
        <!-- Export button -->
        <button mat-stroked-button (click)="exportUsers()">
          <mat-icon>download</mat-icon>
          Export Users
        </button>
      </div>

      <!-- ============================================ -->
      <!-- STATS CARDS                                  -->
      <!-- ============================================ -->
      <div class="stats-grid mb-6">
        <!-- Total Users -->
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon users">
              <mat-icon>people</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats().totalUsers }}</span>
              <span class="stat-label">Total Users</span>
            </div>
          </mat-card-content>
        </mat-card>
        
        <!-- Active Users -->
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon active">
              <mat-icon>verified_user</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats().activeUsers }}</span>
              <span class="stat-label">Active</span>
            </div>
          </mat-card-content>
        </mat-card>
        
        <!-- Parents -->
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon parents">
              <mat-icon>family_restroom</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats().parents }}</span>
              <span class="stat-label">Parents</span>
            </div>
          </mat-card-content>
        </mat-card>
        
        <!-- Admins -->
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon admins">
              <mat-icon>admin_panel_settings</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats().admins }}</span>
              <span class="stat-label">Admins</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- ============================================ -->
      <!-- FILTERS                                      -->
      <!-- ============================================ -->
      <mat-card class="filters-card mb-4">
        <mat-card-content>
          <div class="filters-row">
            <!-- Search -->
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search users</mat-label>
              <mat-icon matPrefix>search</mat-icon>
              <input 
                matInput 
                [(ngModel)]="searchQuery"
                placeholder="Search by name or email..."
                (input)="applyFilters()">
            </mat-form-field>
            
            <!-- Role filter -->
            <mat-form-field appearance="outline">
              <mat-label>Role</mat-label>
              <mat-select [(ngModel)]="roleFilter" (selectionChange)="applyFilters()">
                <mat-option value="">All Roles</mat-option>
                <mat-option value="parent">Parent</mat-option>
                <mat-option value="hr_admin">HR Admin</mat-option>
                <mat-option value="venue_admin">Venue Admin</mat-option>
                <mat-option value="platform_admin">Platform Admin</mat-option>
              </mat-select>
            </mat-form-field>
            
            <!-- Status filter -->
            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="statusFilter" (selectionChange)="applyFilters()">
                <mat-option value="">All Statuses</mat-option>
                <mat-option value="active">Active</mat-option>
                <mat-option value="suspended">Suspended</mat-option>
                <mat-option value="pending">Pending</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- ============================================ -->
      <!-- USERS TABLE                                  -->
      <!-- ============================================ -->
      <mat-card class="table-card">
        <mat-card-content>
          <table mat-table [dataSource]="paginatedUsers()" class="users-table">
            
            <!-- Name Column -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>User</th>
              <td mat-cell *matCellDef="let user">
                <div class="user-cell">
                  <div class="user-avatar" [ngClass]="user.role">
                    {{ user.name.charAt(0) }}
                  </div>
                  <div class="user-info">
                    <span class="user-name">{{ user.name }}</span>
                    <span class="user-email">{{ user.email }}</span>
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Role Column -->
            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef>Role</th>
              <td mat-cell *matCellDef="let user">
                <mat-chip class="role-chip" [ngClass]="user.role">
                  {{ getRoleLabel(user.role) }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Organization Column -->
            <ng-container matColumnDef="organization">
              <th mat-header-cell *matHeaderCellDef>Organization</th>
              <td mat-cell *matCellDef="let user">
                <span *ngIf="user.company">{{ user.company }}</span>
                <span *ngIf="user.venue">{{ user.venue }}</span>
                <span *ngIf="!user.company && !user.venue" class="no-org">—</span>
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let user">
                <div class="status-badge" [ngClass]="user.status">
                  <span class="status-dot"></span>
                  {{ user.status | titlecase }}
                </div>
              </td>
            </ng-container>

            <!-- Last Login Column -->
            <ng-container matColumnDef="lastLogin">
              <th mat-header-cell *matHeaderCellDef>Last Login</th>
              <td mat-cell *matCellDef="let user">
                <span *ngIf="user.lastLogin">{{ user.lastLogin }}</span>
                <span *ngIf="!user.lastLogin" class="never-logged">Never</span>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let user">
                <button mat-icon-button [matMenuTriggerFor]="userMenu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #userMenu="matMenu">
                  <button mat-menu-item (click)="viewUser(user)">
                    <mat-icon>visibility</mat-icon>
                    <span>View Details</span>
                  </button>
                  <button mat-menu-item (click)="editUser(user)">
                    <mat-icon>edit</mat-icon>
                    <span>Edit User</span>
                  </button>
                  <button 
                    mat-menu-item 
                    *ngIf="user.status === 'active'"
                    (click)="suspendUser(user)">
                    <mat-icon>block</mat-icon>
                    <span>Suspend User</span>
                  </button>
                  <button 
                    mat-menu-item 
                    *ngIf="user.status === 'suspended'"
                    (click)="reactivateUser(user)">
                    <mat-icon>check_circle</mat-icon>
                    <span>Reactivate User</span>
                  </button>
                  <button 
                    mat-menu-item 
                    class="delete-action"
                    (click)="deleteUser(user)">
                    <mat-icon>delete</mat-icon>
                    <span>Delete User</span>
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <!-- Table rows -->
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
          
          <!-- Paginator -->
          <mat-paginator
            [length]="filteredUsers().length"
            [pageSize]="pageSize"
            [pageSizeOptions]="[10, 25, 50]"
            (page)="onPageChange($event)"
            showFirstLastButtons>
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    /* Container */
    .users-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    /* Page header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0;
    }

    .page-subtitle {
      color: #718096;
      margin: 0.25rem 0 0;
    }

    /* Stats grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
    }

    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem !important;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon.users { background: #ebf8ff; color: #2c5282; }
    .stat-icon.active { background: #f0fff4; color: #38a169; }
    .stat-icon.parents { background: #faf5ff; color: #805ad5; }
    .stat-icon.admins { background: #fef3c7; color: #d97706; }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #2d3748;
    }

    .stat-label {
      font-size: 0.75rem;
      color: #718096;
    }

    /* Filters */
    .filters-row {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .search-field {
      flex: 1;
    }

    /* Table */
    .users-table {
      width: 100%;
    }

    .user-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: white;
    }

    .user-avatar.parent { background: #805ad5; }
    .user-avatar.hr_admin { background: #2c5282; }
    .user-avatar.venue_admin { background: #319795; }
    .user-avatar.platform_admin { background: #d69e2e; }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-weight: 500;
      color: #2d3748;
    }

    .user-email {
      font-size: 0.75rem;
      color: #718096;
    }

    /* Role chips */
    .role-chip.parent { background: #faf5ff !important; color: #553c9a !important; }
    .role-chip.hr_admin { background: #ebf8ff !important; color: #2c5282 !important; }
    .role-chip.venue_admin { background: #e6fffa !important; color: #234e52 !important; }
    .role-chip.platform_admin { background: #fef3c7 !important; color: #92400e !important; }

    /* Status badge */
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.875rem;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .status-badge.active .status-dot { background: #38a169; }
    .status-badge.suspended .status-dot { background: #e53e3e; }
    .status-badge.pending .status-dot { background: #d69e2e; }

    .no-org,
    .never-logged {
      color: #a0aec0;
    }

    .delete-action {
      color: #e53e3e;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .filters-row {
        flex-direction: column;
      }

      .search-field {
        width: 100%;
      }
    }
  `]
})
export class AdminUsersComponent implements OnInit {
  // -------------------------------------------------
  // STATE
  // -------------------------------------------------
  
  /**
   * All users
   */
  users = signal<ManagedUser[]>([]);
  
  /**
   * Search query
   */
  searchQuery: string = '';
  
  /**
   * Role filter
   */
  roleFilter: string = '';
  
  /**
   * Status filter
   */
  statusFilter: string = '';
  
  /**
   * Current page index
   */
  pageIndex: number = 0;
  
  /**
   * Page size
   */
  pageSize: number = 10;
  
  /**
   * Table columns
   */
  displayedColumns = ['name', 'role', 'organization', 'status', 'lastLogin', 'actions'];

  // -------------------------------------------------
  // COMPUTED
  // -------------------------------------------------
  
  /**
   * Stats computed from users
   */
  stats = computed(() => {
    const all = this.users();
    return {
      totalUsers: all.length,
      activeUsers: all.filter(u => u.status === 'active').length,
      parents: all.filter(u => u.role === 'parent').length,
      admins: all.filter(u => u.role !== 'parent').length
    };
  });
  
  /**
   * Filtered users based on search and filters
   */
  filteredUsers = computed(() => {
    let result = this.users();
    
    // Apply search
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(u => 
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
      );
    }
    
    // Apply role filter
    if (this.roleFilter) {
      result = result.filter(u => u.role === this.roleFilter);
    }
    
    // Apply status filter
    if (this.statusFilter) {
      result = result.filter(u => u.status === this.statusFilter);
    }
    
    return result;
  });
  
  /**
   * Paginated users for display
   */
  paginatedUsers = computed(() => {
    const start = this.pageIndex * this.pageSize;
    return this.filteredUsers().slice(start, start + this.pageSize);
  });

  /**
   * Constructor
   */
  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  // -------------------------------------------------
  // LIFECYCLE
  // -------------------------------------------------

  ngOnInit(): void {
    this.loadUsers();
  }

  // -------------------------------------------------
  // METHODS
  // -------------------------------------------------

  private loadUsers(): void {
    // Mock user data
    this.users.set([
      {
        id: 'user_001',
        email: 'sarah.smith@acme.com',
        name: 'Sarah Smith',
        role: 'parent',
        company: 'Acme Corp',
        status: 'active',
        createdAt: '2024-01-15',
        lastLogin: 'Jan 18, 2024'
      },
      {
        id: 'user_002',
        email: 'hr@acme.com',
        name: 'Emily HR',
        role: 'hr_admin',
        company: 'Acme Corp',
        status: 'active',
        createdAt: '2024-01-10',
        lastLogin: 'Jan 19, 2024'
      },
      {
        id: 'user_003',
        email: 'venue@codeninjas.com',
        name: 'Code Ninjas Admin',
        role: 'venue_admin',
        venue: 'Code Ninjas West',
        status: 'active',
        createdAt: '2024-01-05',
        lastLogin: 'Jan 19, 2024'
      },
      {
        id: 'user_004',
        email: 'admin@nexus.com',
        name: 'Platform Admin',
        role: 'platform_admin',
        status: 'active',
        createdAt: '2023-12-01',
        lastLogin: 'Jan 19, 2024'
      },
      {
        id: 'user_005',
        email: 'john.doe@techcorp.com',
        name: 'John Doe',
        role: 'parent',
        company: 'TechCorp',
        status: 'suspended',
        createdAt: '2024-01-08',
        lastLogin: 'Jan 10, 2024'
      },
      {
        id: 'user_006',
        email: 'pending@newco.com',
        name: 'Pending User',
        role: 'parent',
        company: 'NewCo',
        status: 'pending',
        createdAt: '2024-01-18'
      }
    ]);
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      'parent': 'Parent',
      'hr_admin': 'HR Admin',
      'venue_admin': 'Venue Admin',
      'platform_admin': 'Platform Admin'
    };
    return labels[role] || role;
  }

  applyFilters(): void {
    // Reset to first page when filters change
    this.pageIndex = 0;
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  viewUser(user: ManagedUser): void {
    console.log('[AdminUsers] View user:', user.id);
  }

  editUser(user: ManagedUser): void {
    console.log('[AdminUsers] Edit user:', user.id);
  }

  suspendUser(user: ManagedUser): void {
    console.log('[AdminUsers] Suspend user:', user.id);
    this.snackBar.open(`User ${user.name} suspended`, 'OK', { duration: 3000 });
  }

  reactivateUser(user: ManagedUser): void {
    console.log('[AdminUsers] Reactivate user:', user.id);
    this.snackBar.open(`User ${user.name} reactivated`, 'OK', { duration: 3000 });
  }

  deleteUser(user: ManagedUser): void {
    console.log('[AdminUsers] Delete user:', user.id);
  }

  exportUsers(): void {
    console.log('[AdminUsers] Exporting users...');
    this.snackBar.open('User export started', 'OK', { duration: 3000 });
  }
}
