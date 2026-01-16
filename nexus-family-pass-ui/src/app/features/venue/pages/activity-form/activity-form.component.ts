// =====================================================
// NEXUS FAMILY PASS - VENUE ACTIVITY FORM COMPONENT
// Create and edit activity listings with detailed
// information, scheduling, and media management
// =====================================================

// Import Angular core
import { Component, OnInit, signal } from '@angular/core';

// Import CommonModule
import { CommonModule } from '@angular/common';

// Import Router
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

// Import Forms module
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

// Import Angular Material modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

/**
 * ActivityFormComponent - Create/Edit Activity Page
 * 
 * Multi-step form for venue administrators to:
 * - Add basic activity information
 * - Set age requirements and capacity
 * - Configure scheduling
 * - Upload images
 * - Set pricing and availability
 */
@Component({
  // Component selector
  selector: 'app-venue-activity-form',
  
  // Standalone component
  standalone: true,
  
  // Import required modules
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatStepperModule,
    MatSnackBarModule
  ],
  
  // Inline template
  template: `
    <!-- Activity Form container -->
    <div class="form-container p-6 max-w-4xl mx-auto">
      
      <!-- Page header -->
      <div class="page-header mb-6">
        <div class="flex items-center gap-2 mb-2">
          <button mat-icon-button routerLink="/venue/activities">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1 class="text-2xl font-display font-bold text-neutral-800">
            {{ isEditMode() ? 'Edit Activity' : 'Create New Activity' }}
          </h1>
        </div>
        <p class="text-neutral-500 ml-12">
          {{ isEditMode() ? 'Update your activity listing' : 'Fill in the details to create a new activity' }}
        </p>
      </div>

      <!-- Multi-step form -->
      <mat-stepper orientation="vertical" [linear]="true" #stepper>
        
        <!-- ================================================ -->
        <!-- STEP 1: Basic Information                        -->
        <!-- ================================================ -->
        <mat-step [stepControl]="basicInfoForm">
          <ng-template matStepLabel>Basic Information</ng-template>
          
          <form [formGroup]="basicInfoForm" class="py-4">
            <mat-card>
              <mat-card-content class="pt-4 space-y-4">
                
                <!-- Activity name -->
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Activity Name</mat-label>
                  <input matInput formControlName="name" 
                         placeholder="e.g., Junior Robotics Workshop">
                  <mat-error *ngIf="basicInfoForm.get('name')?.hasError('required')">
                    Name is required
                  </mat-error>
                </mat-form-field>
                
                <!-- Category -->
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Category</mat-label>
                  <mat-select formControlName="category">
                    <mat-option value="STEM">STEM</mat-option>
                    <mat-option value="Arts & Crafts">Arts & Crafts</mat-option>
                    <mat-option value="Sports">Sports</mat-option>
                    <mat-option value="Music">Music</mat-option>
                    <mat-option value="Nature">Nature</mat-option>
                    <mat-option value="Cooking">Cooking</mat-option>
                    <mat-option value="Dance">Dance</mat-option>
                    <mat-option value="Drama">Drama</mat-option>
                  </mat-select>
                </mat-form-field>
                
                <!-- Short description -->
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Short Description</mat-label>
                  <textarea matInput formControlName="shortDescription" 
                            rows="2" maxlength="150"
                            placeholder="Brief description for card display"></textarea>
                  <mat-hint align="end">{{ basicInfoForm.get('shortDescription')?.value?.length || 0 }}/150</mat-hint>
                </mat-form-field>
                
                <!-- Full description -->
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Full Description</mat-label>
                  <textarea matInput formControlName="fullDescription" 
                            rows="5"
                            placeholder="Detailed description of the activity"></textarea>
                </mat-form-field>
                
                <!-- Learning outcomes -->
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>What Will Children Learn?</mat-label>
                  <textarea matInput formControlName="learningOutcomes" 
                            rows="3"
                            placeholder="Key takeaways and skills they'll develop"></textarea>
                </mat-form-field>
              </mat-card-content>
            </mat-card>
            
            <div class="mt-4 flex justify-end">
              <button mat-raised-button color="primary" matStepperNext>
                Continue
                <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </form>
        </mat-step>

        <!-- ================================================ -->
        <!-- STEP 2: Requirements & Capacity                  -->
        <!-- ================================================ -->
        <mat-step [stepControl]="requirementsForm">
          <ng-template matStepLabel>Requirements & Capacity</ng-template>
          
          <form [formGroup]="requirementsForm" class="py-4">
            <mat-card>
              <mat-card-content class="pt-4 space-y-4">
                
                <!-- Age range -->
                <div class="grid grid-cols-2 gap-4">
                  <mat-form-field appearance="outline">
                    <mat-label>Minimum Age</mat-label>
                    <input matInput type="number" formControlName="minAge" min="0" max="18">
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline">
                    <mat-label>Maximum Age</mat-label>
                    <input matInput type="number" formControlName="maxAge" min="0" max="18">
                  </mat-form-field>
                </div>
                
                <!-- Duration and capacity -->
                <div class="grid grid-cols-2 gap-4">
                  <mat-form-field appearance="outline">
                    <mat-label>Duration (minutes)</mat-label>
                    <input matInput type="number" formControlName="duration" min="15">
                    <mat-hint>How long is each session?</mat-hint>
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline">
                    <mat-label>Capacity per Session</mat-label>
                    <input matInput type="number" formControlName="capacity" min="1">
                    <mat-hint>Maximum children per session</mat-hint>
                  </mat-form-field>
                </div>
                
                <!-- Credits required -->
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Credits Required</mat-label>
                  <mat-select formControlName="credits">
                    <mat-option [value]="1">1 Credit</mat-option>
                    <mat-option [value]="2">2 Credits</mat-option>
                    <mat-option [value]="3">3 Credits</mat-option>
                  </mat-select>
                  <mat-hint>How many credits to book this activity</mat-hint>
                </mat-form-field>
                
                <!-- Parent required toggle -->
                <mat-slide-toggle formControlName="parentRequired" color="primary">
                  Parent/Guardian must attend
                </mat-slide-toggle>
                
                <!-- What to bring -->
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>What to Bring</mat-label>
                  <textarea matInput formControlName="whatToBring" rows="2"
                            placeholder="e.g., Comfortable clothes, water bottle"></textarea>
                </mat-form-field>
              </mat-card-content>
            </mat-card>
            
            <div class="mt-4 flex justify-between">
              <button mat-button matStepperPrevious>
                <mat-icon>arrow_back</mat-icon>
                Back
              </button>
              <button mat-raised-button color="primary" matStepperNext>
                Continue
                <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </form>
        </mat-step>

        <!-- ================================================ -->
        <!-- STEP 3: Tags & Media                             -->
        <!-- ================================================ -->
        <mat-step>
          <ng-template matStepLabel>Tags & Media</ng-template>
          
          <div class="py-4">
            <mat-card>
              <mat-card-content class="pt-4 space-y-6">
                
                <!-- Activity tags -->
                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-2">
                    Activity Tags (select all that apply)
                  </label>
                  <mat-chip-listbox multiple [(ngModel)]="selectedTags">
                    <mat-chip-option *ngFor="let tag of availableTags" [value]="tag">
                      {{ tag }}
                    </mat-chip-option>
                  </mat-chip-listbox>
                </div>
                
                <!-- Image upload -->
                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-2">
                    Activity Images
                  </label>
                  <div class="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center">
                    <mat-icon class="scale-150 text-neutral-400 mb-2">cloud_upload</mat-icon>
                    <p class="text-neutral-500 mb-2">Drag and drop images here</p>
                    <p class="text-sm text-neutral-400 mb-4">or</p>
                    <button mat-stroked-button color="primary">
                      Browse Files
                    </button>
                    <p class="text-xs text-neutral-400 mt-2">
                      PNG, JPG up to 5MB. First image will be the cover.
                    </p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
            
            <div class="mt-4 flex justify-between">
              <button mat-button matStepperPrevious>
                <mat-icon>arrow_back</mat-icon>
                Back
              </button>
              <button mat-raised-button color="primary" matStepperNext>
                Continue
                <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </div>
        </mat-step>

        <!-- ================================================ -->
        <!-- STEP 4: Review & Publish                         -->
        <!-- ================================================ -->
        <mat-step>
          <ng-template matStepLabel>Review & Publish</ng-template>
          
          <div class="py-4">
            <mat-card>
              <mat-card-content class="pt-4">
                <h3 class="text-lg font-medium text-neutral-800 mb-4">Review Your Activity</h3>
                
                <!-- Summary display -->
                <div class="space-y-3 text-sm">
                  <div class="flex justify-between py-2 border-b">
                    <span class="text-neutral-500">Name</span>
                    <span class="font-medium">{{ basicInfoForm.get('name')?.value || '-' }}</span>
                  </div>
                  <div class="flex justify-between py-2 border-b">
                    <span class="text-neutral-500">Category</span>
                    <span class="font-medium">{{ basicInfoForm.get('category')?.value || '-' }}</span>
                  </div>
                  <div class="flex justify-between py-2 border-b">
                    <span class="text-neutral-500">Age Range</span>
                    <span class="font-medium">
                      {{ requirementsForm.get('minAge')?.value }} - {{ requirementsForm.get('maxAge')?.value }} years
                    </span>
                  </div>
                  <div class="flex justify-between py-2 border-b">
                    <span class="text-neutral-500">Duration</span>
                    <span class="font-medium">{{ requirementsForm.get('duration')?.value }} minutes</span>
                  </div>
                  <div class="flex justify-between py-2 border-b">
                    <span class="text-neutral-500">Capacity</span>
                    <span class="font-medium">{{ requirementsForm.get('capacity')?.value }} children</span>
                  </div>
                  <div class="flex justify-between py-2 border-b">
                    <span class="text-neutral-500">Credits</span>
                    <span class="font-medium">{{ requirementsForm.get('credits')?.value }}</span>
                  </div>
                </div>
                
                <!-- Publish options -->
                <div class="mt-6 p-4 bg-neutral-50 rounded-lg">
                  <mat-slide-toggle [(ngModel)]="publishImmediately" color="primary">
                    Publish immediately
                  </mat-slide-toggle>
                  <p class="text-sm text-neutral-500 mt-2">
                    If disabled, activity will be saved as draft
                  </p>
                </div>
              </mat-card-content>
            </mat-card>
            
            <div class="mt-4 flex justify-between">
              <button mat-button matStepperPrevious>
                <mat-icon>arrow_back</mat-icon>
                Back
              </button>
              <button mat-raised-button color="primary" (click)="saveActivity()">
                <mat-icon>{{ publishImmediately ? 'publish' : 'save' }}</mat-icon>
                {{ publishImmediately ? 'Publish Activity' : 'Save as Draft' }}
              </button>
            </div>
          </div>
        </mat-step>
      </mat-stepper>
    </div>
  `,
  
  // Inline styles
  styles: [`
    /* Form styling */
    mat-form-field {
      width: 100%;
    }
    
    /* Tags chip styling */
    mat-chip-option {
      margin: 4px;
    }
  `]
})
export class ActivityFormComponent implements OnInit {
  // Form groups
  basicInfoForm!: FormGroup;
  requirementsForm!: FormGroup;
  
  // Edit mode flag
  isEditMode = signal<boolean>(false);
  activityId = signal<string | null>(null);
  
  // Tags
  availableTags = ['Indoor', 'Outdoor', 'Messy', 'Competitive', 'Calm', 'Social', 'Solo-friendly', 'Physical', 'Creative', 'Educational'];
  selectedTags: string[] = [];
  
  // Publish option
  publishImmediately = true;

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
   * ngOnInit - Initialize forms and check for edit mode
   */
  ngOnInit(): void {
    this.initializeForms();
    
    // Check if editing existing activity
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.activityId.set(id);
      this.loadActivityData(id);
    }
  }

  /**
   * saveActivity - Save or publish the activity
   */
  saveActivity(): void {
    // Combine all form data
    const activityData = {
      ...this.basicInfoForm.value,
      ...this.requirementsForm.value,
      tags: this.selectedTags,
      status: this.publishImmediately ? 'active' : 'draft'
    };
    
    console.log('[Activity Form] Saving activity:', activityData);
    
    // Show success message
    this.snackBar.open(
      this.publishImmediately ? 'Activity published successfully!' : 'Activity saved as draft',
      'Close',
      { duration: 3000 }
    );
    
    // Navigate back to activities list
    this.router.navigate(['/venue/activities']);
  }

  /**
   * initializeForms - Create form groups
   */
  private initializeForms(): void {
    // Basic info form
    this.basicInfoForm = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      shortDescription: [''],
      fullDescription: [''],
      learningOutcomes: ['']
    });
    
    // Requirements form
    this.requirementsForm = this.fb.group({
      minAge: [5, [Validators.required, Validators.min(0)]],
      maxAge: [12, [Validators.required, Validators.max(18)]],
      duration: [60, [Validators.required, Validators.min(15)]],
      capacity: [10, [Validators.required, Validators.min(1)]],
      credits: [1, Validators.required],
      parentRequired: [false],
      whatToBring: ['']
    });
  }

  /**
   * loadActivityData - Load existing activity for editing
   */
  private loadActivityData(id: string): void {
    // TODO: Load from API
    console.log('[Activity Form] Loading activity:', id);
    
    // Mock data for demo
    this.basicInfoForm.patchValue({
      name: 'Junior Robotics Workshop',
      category: 'STEM',
      shortDescription: 'Learn to build and program robots',
      fullDescription: 'An exciting hands-on workshop where kids learn the basics of robotics.',
      learningOutcomes: 'Basic programming concepts, Problem solving, Teamwork'
    });
    
    this.requirementsForm.patchValue({
      minAge: 6,
      maxAge: 10,
      duration: 90,
      capacity: 10,
      credits: 2,
      parentRequired: false,
      whatToBring: 'Comfortable clothes'
    });
    
    this.selectedTags = ['Indoor', 'Educational', 'Creative'];
  }
}
