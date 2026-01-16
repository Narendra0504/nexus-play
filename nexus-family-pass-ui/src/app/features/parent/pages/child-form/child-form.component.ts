// =====================================================
// NEXUS FAMILY PASS - CHILD FORM COMPONENT
// Add/Edit child profile with onboarding quiz
// including energy level, social preference, interests
// =====================================================

// Import Angular core
import { Component, OnInit, signal, computed } from '@angular/core';

// Import CommonModule
import { CommonModule } from '@angular/common';

// Import Router
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

// Import Reactive Forms
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Import Angular Material modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatStepperModule } from '@angular/material/stepper';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Import models
import { 
  EnergyLevel, 
  SocialPreference, 
  INTEREST_CATEGORIES,
  ACTIVITY_CONSTRAINTS,
  ACCESSIBILITY_NEEDS
} from '../../../../core/models';

/**
 * ChildFormComponent - Add/Edit Child Profile
 * 
 * Multi-step form for creating or editing child profiles:
 * - Step 1: Basic information (name, DOB, gender)
 * - Step 2: Onboarding quiz (energy, social, interests)
 * - Step 3: Constraints and accessibility needs
 */
@Component({
  // Component selector
  selector: 'app-child-form',
  
  // Standalone component
  standalone: true,
  
  // Required imports
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatStepperModule,
    MatChipsModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  
  // Component template
  template: `
    <!-- Page container -->
    <div class="child-form-page">
      
      <!-- Page header -->
      <header class="page-header">
        <a routerLink="/parent/children" class="back-link">
          <mat-icon>arrow_back</mat-icon>
          Back to Children
        </a>
        <h1>{{ isEditMode() ? 'Edit Child Profile' : 'Add New Child' }}</h1>
      </header>

      <!-- Main form card -->
      <mat-card class="form-card">
        
        <!-- Stepper for multi-step form -->
        <mat-stepper [linear]="!isEditMode()" #stepper>
          
          <!-- ========================================== -->
          <!-- STEP 1: Basic Information                 -->
          <!-- ========================================== -->
          <mat-step [stepControl]="basicInfoForm" label="Basic Info">
            <form [formGroup]="basicInfoForm" class="step-content">
              
              <div class="step-header">
                <mat-icon>person</mat-icon>
                <div>
                  <h2>Basic Information</h2>
                  <p>Tell us about your child</p>
                </div>
              </div>

              <!-- Child's name -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Child's First Name</mat-label>
                <input matInput formControlName="firstName" placeholder="Enter first name">
                <mat-icon matPrefix>badge</mat-icon>
                <mat-error *ngIf="basicInfoForm.get('firstName')?.hasError('required')">
                  First name is required
                </mat-error>
              </mat-form-field>

              <!-- Date of birth -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Date of Birth</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="dateOfBirth" 
                       placeholder="Select date">
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-icon matPrefix>cake</mat-icon>
                <mat-error *ngIf="basicInfoForm.get('dateOfBirth')?.hasError('required')">
                  Date of birth is required
                </mat-error>
              </mat-form-field>

              <!-- Gender (optional) -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Gender (Optional)</mat-label>
                <mat-select formControlName="gender">
                  <mat-option value="">Prefer not to say</mat-option>
                  <mat-option value="boy">Boy</mat-option>
                  <mat-option value="girl">Girl</mat-option>
                  <mat-option value="non-binary">Non-binary</mat-option>
                </mat-select>
                <mat-icon matPrefix>wc</mat-icon>
              </mat-form-field>

              <!-- Step navigation -->
              <div class="step-actions">
                <button mat-button routerLink="/parent/children">Cancel</button>
                <button mat-raised-button color="primary" matStepperNext 
                        [disabled]="basicInfoForm.invalid">
                  Next
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </form>
          </mat-step>

          <!-- ========================================== -->
          <!-- STEP 2: Onboarding Quiz                   -->
          <!-- ========================================== -->
          <mat-step [stepControl]="quizForm" label="Preferences">
            <form [formGroup]="quizForm" class="step-content">
              
              <div class="step-header">
                <mat-icon>psychology</mat-icon>
                <div>
                  <h2>Help us understand {{ childName() }}'s preferences</h2>
                  <p>This helps us recommend the perfect activities</p>
                </div>
              </div>

              <!-- Question 1: Energy Level -->
              <div class="quiz-question">
                <h3>What's {{ childName() }}'s energy level?</h3>
                <div class="option-cards">
                  <div 
                    class="option-card" 
                    [class.selected]="quizForm.get('energyLevel')?.value === 'calm'"
                    (click)="selectEnergy('calm')">
                    <mat-icon>spa</mat-icon>
                    <span class="option-title">Calm & Focused</span>
                    <span class="option-desc">Enjoys quiet, focused activities</span>
                  </div>
                  <div 
                    class="option-card" 
                    [class.selected]="quizForm.get('energyLevel')?.value === 'balanced'"
                    (click)="selectEnergy('balanced')">
                    <mat-icon>balance</mat-icon>
                    <span class="option-title">Balanced</span>
                    <span class="option-desc">Mix of active and calm activities</span>
                  </div>
                  <div 
                    class="option-card" 
                    [class.selected]="quizForm.get('energyLevel')?.value === 'high'"
                    (click)="selectEnergy('high')">
                    <mat-icon>bolt</mat-icon>
                    <span class="option-title">High Energy</span>
                    <span class="option-desc">Loves active, physical activities</span>
                  </div>
                </div>
              </div>

              <!-- Question 2: Social Preference -->
              <div class="quiz-question">
                <h3>Does {{ childName() }} prefer...</h3>
                <div class="option-cards">
                  <div 
                    class="option-card" 
                    [class.selected]="quizForm.get('socialPreference')?.value === 'solo'"
                    (click)="selectSocial('solo')">
                    <mat-icon>person</mat-icon>
                    <span class="option-title">Solo Activities</span>
                    <span class="option-desc">One-on-one or individual focus</span>
                  </div>
                  <div 
                    class="option-card" 
                    [class.selected]="quizForm.get('socialPreference')?.value === 'small_group'"
                    (click)="selectSocial('small_group')">
                    <mat-icon>group</mat-icon>
                    <span class="option-title">Small Groups</span>
                    <span class="option-desc">3-6 kids, more intimate setting</span>
                  </div>
                  <div 
                    class="option-card" 
                    [class.selected]="quizForm.get('socialPreference')?.value === 'large_group'"
                    (click)="selectSocial('large_group')">
                    <mat-icon>groups</mat-icon>
                    <span class="option-title">Big Social Settings</span>
                    <span class="option-desc">Thrives in larger groups</span>
                  </div>
                </div>
              </div>

              <!-- Question 3: Interests -->
              <div class="quiz-question">
                <h3>What interests {{ childName() }} most? (Select up to 3)</h3>
                <div class="interests-grid">
                  <div 
                    *ngFor="let interest of interestCategories"
                    class="interest-chip"
                    [class.selected]="isInterestSelected(interest)"
                    (click)="toggleInterest(interest)">
                    <mat-icon>{{ getInterestIcon(interest) }}</mat-icon>
                    {{ interest }}
                  </div>
                </div>
                <p class="selection-count">
                  {{ selectedInterests().length }}/3 selected
                </p>
              </div>

              <!-- Step navigation -->
              <div class="step-actions">
                <button mat-button matStepperPrevious>
                  <mat-icon>arrow_back</mat-icon>
                  Back
                </button>
                <button mat-raised-button color="primary" matStepperNext 
                        [disabled]="quizForm.invalid || selectedInterests().length === 0">
                  Next
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </form>
          </mat-step>

          <!-- ========================================== -->
          <!-- STEP 3: Constraints & Accessibility       -->
          <!-- ========================================== -->
          <mat-step label="Additional Info">
            <form [formGroup]="constraintsForm" class="step-content">
              
              <div class="step-header">
                <mat-icon>shield</mat-icon>
                <div>
                  <h2>Additional Information</h2>
                  <p>Help us ensure {{ childName() }}'s safety and comfort</p>
                </div>
              </div>

              <!-- Constraints accordion -->
              <mat-expansion-panel class="info-panel">
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <mat-icon>block</mat-icon>
                    Activities to Avoid
                  </mat-panel-title>
                </mat-expansion-panel-header>
                
                <div class="checkbox-grid">
                  <mat-checkbox 
                    *ngFor="let constraint of activityConstraints"
                    (change)="toggleConstraint(constraint)">
                    {{ constraint }}
                  </mat-checkbox>
                </div>
              </mat-expansion-panel>

              <!-- Medical/Allergy notes -->
              <mat-expansion-panel class="info-panel">
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <mat-icon>medical_information</mat-icon>
                    Allergies & Medical Notes
                  </mat-panel-title>
                </mat-expansion-panel-header>
                
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Allergies or medical notes</mat-label>
                  <textarea matInput formControlName="allergies" rows="3"
                            placeholder="E.g., Peanut allergy, asthma..."></textarea>
                  <mat-hint>This information is shared with venues for safety</mat-hint>
                </mat-form-field>
              </mat-expansion-panel>

              <!-- Accessibility needs -->
              <mat-expansion-panel class="info-panel">
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <mat-icon>accessible</mat-icon>
                    Accessibility Needs
                  </mat-panel-title>
                </mat-expansion-panel-header>
                
                <div class="checkbox-grid">
                  <mat-checkbox 
                    *ngFor="let need of accessibilityNeeds"
                    (change)="toggleAccessibility(need)">
                    {{ need }}
                  </mat-checkbox>
                </div>
              </mat-expansion-panel>

              <!-- Consent checkbox -->
              <div class="consent-section">
                <mat-checkbox formControlName="parentalConsent" color="primary">
                  I confirm I am the parent/guardian of this child and consent to 
                  Nexus Family Pass processing this information to provide personalized 
                  activity recommendations.
                </mat-checkbox>
              </div>

              <!-- Step navigation -->
              <div class="step-actions">
                <button mat-button matStepperPrevious>
                  <mat-icon>arrow_back</mat-icon>
                  Back
                </button>
                <button mat-raised-button color="primary" 
                        [disabled]="!constraintsForm.get('parentalConsent')?.value || isSubmitting()"
                        (click)="onSubmit()">
                  <mat-icon>{{ isSubmitting() ? 'hourglass_empty' : 'check' }}</mat-icon>
                  {{ isEditMode() ? 'Save Changes' : 'Add Child' }}
                </button>
              </div>
            </form>
          </mat-step>

        </mat-stepper>
      </mat-card>
    </div>
  `,
  
  // Component styles
  styles: [`
    /* Page container */
    .child-form-page {
      max-width: 800px;                              /* Max width */
      margin: 0 auto;                                /* Center horizontally */
    }

    /* Page header */
    .page-header {
      margin-bottom: 1.5rem;                         /* Bottom margin */
    }

    .back-link {
      display: inline-flex;                          /* Inline flex */
      align-items: center;                           /* Center vertically */
      gap: 0.5rem;                                   /* Gap */
      color: #718096;                                /* Gray color */
      text-decoration: none;                         /* No underline */
      font-size: 0.875rem;                           /* Smaller text */
      margin-bottom: 0.5rem;                         /* Bottom margin */
    }

    .back-link:hover {
      color: #2c5282;                                /* Primary on hover */
    }

    .page-header h1 {
      font-size: 1.75rem;                            /* Large heading */
      font-weight: 600;                              /* Semi-bold */
      color: #2d3748;                                /* Dark gray */
      margin: 0;                                     /* Remove margin */
    }

    /* Form card */
    .form-card {
      padding: 0;                                    /* Remove padding */
      border-radius: 16px;                           /* Rounded corners */
      overflow: hidden;                              /* Clip content */
    }

    /* Step content */
    .step-content {
      padding: 2rem;                                 /* Inner padding */
    }

    .step-header {
      display: flex;                                 /* Flexbox layout */
      align-items: flex-start;                       /* Align to top */
      gap: 1rem;                                     /* Gap */
      margin-bottom: 2rem;                           /* Bottom margin */
      padding-bottom: 1rem;                          /* Bottom padding */
      border-bottom: 1px solid #e2e8f0;              /* Bottom border */
    }

    .step-header mat-icon {
      font-size: 32px;                               /* Large icon */
      width: 32px;
      height: 32px;
      color: #2c5282;                                /* Primary color */
    }

    .step-header h2 {
      font-size: 1.25rem;                            /* Heading size */
      font-weight: 600;                              /* Semi-bold */
      color: #2d3748;                                /* Dark gray */
      margin: 0 0 0.25rem;                           /* Small bottom margin */
    }

    .step-header p {
      color: #718096;                                /* Gray text */
      margin: 0;                                     /* Remove margin */
    }

    /* Form fields */
    .full-width {
      width: 100%;                                   /* Full width */
      margin-bottom: 1rem;                           /* Bottom margin */
    }

    /* Quiz questions */
    .quiz-question {
      margin-bottom: 2rem;                           /* Bottom margin */
    }

    .quiz-question h3 {
      font-size: 1rem;                               /* Normal size */
      font-weight: 600;                              /* Semi-bold */
      color: #2d3748;                                /* Dark gray */
      margin: 0 0 1rem;                              /* Bottom margin */
    }

    /* Option cards */
    .option-cards {
      display: grid;                                 /* Grid layout */
      grid-template-columns: repeat(3, 1fr);         /* 3 columns */
      gap: 1rem;                                     /* Gap */
    }

    .option-card {
      display: flex;                                 /* Flexbox layout */
      flex-direction: column;                        /* Stack vertically */
      align-items: center;                           /* Center horizontally */
      text-align: center;                            /* Center text */
      padding: 1.5rem 1rem;                          /* Padding */
      border: 2px solid #e2e8f0;                     /* Border */
      border-radius: 12px;                           /* Rounded corners */
      cursor: pointer;                               /* Pointer cursor */
      transition: all 0.2s;                          /* Smooth transition */
    }

    .option-card:hover {
      border-color: #2c5282;                         /* Primary border */
      background-color: rgba(44, 82, 130, 0.05);     /* Light background */
    }

    .option-card.selected {
      border-color: #2c5282;                         /* Primary border */
      background-color: rgba(44, 82, 130, 0.1);      /* Stronger background */
    }

    .option-card mat-icon {
      font-size: 32px;                               /* Large icon */
      width: 32px;
      height: 32px;
      color: #2c5282;                                /* Primary color */
      margin-bottom: 0.75rem;                        /* Bottom margin */
    }

    .option-title {
      font-weight: 600;                              /* Semi-bold */
      color: #2d3748;                                /* Dark gray */
      margin-bottom: 0.25rem;                        /* Small bottom margin */
    }

    .option-desc {
      font-size: 0.75rem;                            /* Small text */
      color: #718096;                                /* Gray text */
    }

    /* Interests grid */
    .interests-grid {
      display: flex;                                 /* Flexbox layout */
      flex-wrap: wrap;                               /* Wrap chips */
      gap: 0.75rem;                                  /* Gap */
    }

    .interest-chip {
      display: flex;                                 /* Flexbox layout */
      align-items: center;                           /* Center vertically */
      gap: 0.5rem;                                   /* Gap */
      padding: 0.5rem 1rem;                          /* Padding */
      border: 2px solid #e2e8f0;                     /* Border */
      border-radius: 999px;                          /* Pill shape */
      cursor: pointer;                               /* Pointer cursor */
      transition: all 0.2s;                          /* Smooth transition */
      font-size: 0.875rem;                           /* Smaller text */
    }

    .interest-chip:hover {
      border-color: #319795;                         /* Accent border */
    }

    .interest-chip.selected {
      border-color: #319795;                         /* Accent border */
      background-color: rgba(49, 151, 149, 0.1);     /* Light background */
      color: #319795;                                /* Accent color */
    }

    .interest-chip mat-icon {
      font-size: 18px;                               /* Small icon */
      width: 18px;
      height: 18px;
    }

    .selection-count {
      margin-top: 0.75rem;                           /* Top margin */
      font-size: 0.875rem;                           /* Smaller text */
      color: #718096;                                /* Gray text */
    }

    /* Info panels */
    .info-panel {
      margin-bottom: 1rem;                           /* Bottom margin */
    }

    .info-panel mat-panel-title {
      display: flex;                                 /* Flexbox layout */
      align-items: center;                           /* Center vertically */
      gap: 0.5rem;                                   /* Gap */
    }

    .checkbox-grid {
      display: grid;                                 /* Grid layout */
      grid-template-columns: repeat(2, 1fr);         /* 2 columns */
      gap: 0.5rem;                                   /* Gap */
    }

    /* Consent section */
    .consent-section {
      margin: 2rem 0;                                /* Vertical margin */
      padding: 1rem;                                 /* Padding */
      background-color: #f7fafc;                     /* Light background */
      border-radius: 8px;                            /* Rounded corners */
    }

    /* Step actions */
    .step-actions {
      display: flex;                                 /* Flexbox layout */
      justify-content: space-between;               /* Space between */
      margin-top: 2rem;                              /* Top margin */
      padding-top: 1rem;                             /* Top padding */
      border-top: 1px solid #e2e8f0;                 /* Top border */
    }

    /* Responsive styles */
    @media (max-width: 768px) {
      .option-cards {
        grid-template-columns: 1fr;                  /* Single column */
      }

      .checkbox-grid {
        grid-template-columns: 1fr;                  /* Single column */
      }
    }
  `]
})
export class ChildFormComponent implements OnInit {
  // -------------------------------------------------
  // FORM GROUPS
  // -------------------------------------------------
  basicInfoForm!: FormGroup;
  quizForm!: FormGroup;
  constraintsForm!: FormGroup;

  // -------------------------------------------------
  // STATE SIGNALS
  // -------------------------------------------------
  isEditMode = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  selectedInterests = signal<string[]>([]);
  selectedConstraints = signal<string[]>([]);
  selectedAccessibility = signal<string[]>([]);

  // -------------------------------------------------
  // CONSTANTS
  // -------------------------------------------------
  interestCategories = INTEREST_CATEGORIES;
  activityConstraints = ACTIVITY_CONSTRAINTS;
  accessibilityNeeds = ACCESSIBILITY_NEEDS;

  // -------------------------------------------------
  // COMPUTED VALUES
  // -------------------------------------------------
  childName = computed(() => {
    const name = this.basicInfoForm?.get('firstName')?.value;
    return name || 'your child';
  });

  /**
   * Constructor
   */
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  /**
   * ngOnInit - Initialize component
   */
  ngOnInit(): void {
    this.initializeForms();
    this.checkEditMode();
  }

  /**
   * selectEnergy - Select energy level option
   */
  selectEnergy(level: string): void {
    this.quizForm.patchValue({ energyLevel: level });
  }

  /**
   * selectSocial - Select social preference option
   */
  selectSocial(pref: string): void {
    this.quizForm.patchValue({ socialPreference: pref });
  }

  /**
   * toggleInterest - Toggle interest selection
   */
  toggleInterest(interest: string): void {
    const current = this.selectedInterests();
    if (current.includes(interest)) {
      this.selectedInterests.set(current.filter(i => i !== interest));
    } else if (current.length < 3) {
      this.selectedInterests.set([...current, interest]);
    }
  }

  /**
   * isInterestSelected - Check if interest is selected
   */
  isInterestSelected(interest: string): boolean {
    return this.selectedInterests().includes(interest);
  }

  /**
   * toggleConstraint - Toggle constraint selection
   */
  toggleConstraint(constraint: string): void {
    const current = this.selectedConstraints();
    if (current.includes(constraint)) {
      this.selectedConstraints.set(current.filter(c => c !== constraint));
    } else {
      this.selectedConstraints.set([...current, constraint]);
    }
  }

  /**
   * toggleAccessibility - Toggle accessibility need
   */
  toggleAccessibility(need: string): void {
    const current = this.selectedAccessibility();
    if (current.includes(need)) {
      this.selectedAccessibility.set(current.filter(n => n !== need));
    } else {
      this.selectedAccessibility.set([...current, need]);
    }
  }

  /**
   * getInterestIcon - Get icon for interest category
   */
  getInterestIcon(interest: string): string {
    const icons: Record<string, string> = {
      'STEM': 'science',
      'Arts & Crafts': 'palette',
      'Music': 'music_note',
      'Sports': 'sports_soccer',
      'Nature': 'park',
      'Cooking': 'restaurant',
      'Reading': 'menu_book',
      'Building': 'construction',
      'Dance': 'nightlife',
      'Drama': 'theater_comedy'
    };
    return icons[interest] || 'star';
  }

  /**
   * onSubmit - Submit the form
   */
  onSubmit(): void {
    this.isSubmitting.set(true);

    // Collect all form data
    const formData = {
      ...this.basicInfoForm.value,
      ...this.quizForm.value,
      interests: this.selectedInterests(),
      constraints: this.selectedConstraints(),
      accessibilityNeeds: this.selectedAccessibility(),
      allergies: this.constraintsForm.value.allergies
    };

    console.log('[Child Form] Submitting:', formData);

    // TODO: Call API to save child
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.snackBar.open(
        this.isEditMode() ? 'Profile updated successfully!' : 'Child added successfully!',
        'Close',
        { duration: 3000, panelClass: ['snackbar-success'] }
      );
      this.router.navigate(['/parent/children']);
    }, 1000);
  }

  /**
   * initializeForms - Create form groups
   */
  private initializeForms(): void {
    this.basicInfoForm = this.fb.group({
      firstName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      gender: ['']
    });

    this.quizForm = this.fb.group({
      energyLevel: ['balanced'],
      socialPreference: ['small_group']
    });

    this.constraintsForm = this.fb.group({
      allergies: [''],
      parentalConsent: [false, Validators.requiredTrue]
    });
  }

  /**
   * checkEditMode - Check if editing existing child
   */
  private checkEditMode(): void {
    const childId = this.route.snapshot.params['id'];
    if (childId) {
      this.isEditMode.set(true);
      // TODO: Load existing child data
    }
  }
}
