// NEXUS FAMILY PASS - GROUP BOOKING FLOW COMPONENT
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface Child { id: string; name: string; age: number; compatible: boolean; }
interface TimeSlot { id: string; date: string; time: string; spotsAvailable: number; }

@Component({
  selector: 'app-group-booking',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatStepperModule, MatCheckboxModule, MatChipsModule, MatSnackBarModule],
  template: `
    <div class="group-booking-container p-6 max-w-3xl mx-auto">
      <button mat-button class="mb-4" (click)="goBack()">
        <mat-icon>arrow_back</mat-icon> Back to Activity
      </button>

      <h1 class="text-2xl font-semibold mb-2">Book for Multiple Children</h1>
      <p class="text-gray-600 mb-6">{{ activity.name }} at {{ activity.venue }}</p>

      <mat-stepper linear #stepper>
        <!-- STEP 1: Select Children -->
        <mat-step [completed]="selectedChildren().length > 0">
          <ng-template matStepLabel>Select Children</ng-template>
          <div class="py-4">
            <p class="text-sm text-gray-600 mb-4">Who's joining this activity? (Ages {{ activity.minAge }}-{{ activity.maxAge }})</p>
            <div class="space-y-3">
              <div *ngFor="let child of children()" 
                   class="flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all"
                   [class.border-blue-500]="isSelected(child.id)"
                   [class.border-gray-200]="!isSelected(child.id)"
                   [class.opacity-50]="!child.compatible"
                   (click)="child.compatible && toggleChild(child.id)">
                <div class="flex items-center gap-3">
                  <mat-checkbox [checked]="isSelected(child.id)" [disabled]="!child.compatible" (click)="$event.stopPropagation()"></mat-checkbox>
                  <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-semibold text-purple-600">
                    {{ child.name.charAt(0) }}
                  </div>
                  <div>
                    <div class="font-medium">{{ child.name }}</div>
                    <div class="text-sm text-gray-500">Age {{ child.age }}</div>
                  </div>
                </div>
                <mat-icon *ngIf="child.compatible" class="text-green-500">check_circle</mat-icon>
                <mat-chip *ngIf="!child.compatible" class="bg-yellow-100 text-yellow-800">Outside age range</mat-chip>
              </div>
            </div>
            <div class="mt-6 flex justify-end">
              <button mat-raised-button color="primary" matStepperNext [disabled]="selectedChildren().length === 0">
                Continue <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </div>
        </mat-step>

        <!-- STEP 2: Select Time Slot -->
        <mat-step [completed]="selectedSlot() !== null">
          <ng-template matStepLabel>Select Time</ng-template>
          <div class="py-4">
            <p class="text-sm text-gray-600 mb-4">Choose a time slot with {{ selectedChildren().length }} spots available</p>
            <div class="grid grid-cols-2 gap-3">
              <div *ngFor="let slot of availableSlots()"
                   class="p-4 rounded-lg border-2 cursor-pointer transition-all"
                   [class.border-blue-500]="selectedSlot()?.id === slot.id"
                   [class.border-gray-200]="selectedSlot()?.id !== slot.id"
                   (click)="selectSlot(slot)">
                <div class="font-medium">{{ slot.date }}</div>
                <div class="text-gray-600">{{ slot.time }}</div>
                <div class="text-sm mt-2" [class.text-green-600]="slot.spotsAvailable >= selectedChildren().length" [class.text-red-600]="slot.spotsAvailable < selectedChildren().length">
                  {{ slot.spotsAvailable }} spots available
                </div>
              </div>
            </div>
            <div class="mt-6 flex justify-between">
              <button mat-button matStepperPrevious><mat-icon>arrow_back</mat-icon> Back</button>
              <button mat-raised-button color="primary" matStepperNext [disabled]="!selectedSlot()">
                Continue <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </div>
        </mat-step>

        <!-- STEP 3: Review & Confirm -->
        <mat-step>
          <ng-template matStepLabel>Confirm</ng-template>
          <div class="py-4">
            <mat-card class="mb-4">
              <mat-card-content class="p-4">
                <h3 class="font-semibold mb-3">Booking Summary</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between"><span class="text-gray-600">Activity:</span><span>{{ activity.name }}</span></div>
                  <div class="flex justify-between"><span class="text-gray-600">Date:</span><span>{{ selectedSlot()?.date }} at {{ selectedSlot()?.time }}</span></div>
                  <div class="flex justify-between"><span class="text-gray-600">Children:</span>
                    <div class="flex gap-1">
                      <mat-chip *ngFor="let id of selectedChildren()" class="text-xs">{{ getChildName(id) }}</mat-chip>
                    </div>
                  </div>
                </div>
                <hr class="my-3">
                <div class="flex justify-between font-semibold">
                  <span>Total Credits:</span>
                  <span class="text-blue-600">{{ totalCredits() }} credits</span>
                </div>
                <div class="text-sm text-gray-500">({{ activity.credits }} × {{ selectedChildren().length }} children)</div>
              </mat-card-content>
            </mat-card>

            <div *ngIf="totalCredits() > creditsAvailable" class="bg-red-50 text-red-700 p-3 rounded-lg mb-4 flex items-center gap-2">
              <mat-icon>error</mat-icon>
              <span>Insufficient credits. You have {{ creditsAvailable }} available.</span>
            </div>

            <div class="flex justify-between">
              <button mat-button matStepperPrevious><mat-icon>arrow_back</mat-icon> Back</button>
              <button mat-raised-button color="primary" [disabled]="totalCredits() > creditsAvailable" (click)="confirmBooking()">
                <mat-icon>check</mat-icon> Confirm Booking
              </button>
            </div>
          </div>
        </mat-step>
      </mat-stepper>
    </div>
  `
})
export class GroupBookingFlowComponent implements OnInit {
  activity = { id: 'act_001', name: 'Junior Robotics Workshop', venue: 'Code Ninjas West', minAge: 6, maxAge: 12, credits: 2 };
  creditsAvailable = 8;

  children = signal<Child[]>([]);
  selectedChildren = signal<string[]>([]);
  selectedSlot = signal<TimeSlot | null>(null);
  
  timeSlots: TimeSlot[] = [
    { id: 'slot_1', date: 'Sat, Jan 20', time: '10:00 AM', spotsAvailable: 6 },
    { id: 'slot_2', date: 'Sat, Jan 20', time: '2:00 PM', spotsAvailable: 3 },
    { id: 'slot_3', date: 'Sun, Jan 21', time: '10:00 AM', spotsAvailable: 8 },
    { id: 'slot_4', date: 'Sun, Jan 21', time: '2:00 PM', spotsAvailable: 1 },
  ];

  availableSlots = computed(() => this.timeSlots.filter(s => s.spotsAvailable >= this.selectedChildren().length));
  totalCredits = computed(() => this.activity.credits * this.selectedChildren().length);

  constructor(private route: ActivatedRoute, private router: Router, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.children.set([
      { id: 'child_1', name: 'Emma Smith', age: 8, compatible: true },
      { id: 'child_2', name: 'Jake Smith', age: 10, compatible: true },
      { id: 'child_3', name: 'Lily Smith', age: 4, compatible: false },
    ]);
  }

  goBack(): void { this.router.navigate(['/parent/activities', this.activity.id]); }
  isSelected(id: string): boolean { return this.selectedChildren().includes(id); }
  
  toggleChild(id: string): void {
    this.selectedChildren.update(list => list.includes(id) ? list.filter(c => c !== id) : [...list, id]);
    if (this.selectedSlot() && this.selectedSlot()!.spotsAvailable < this.selectedChildren().length) {
      this.selectedSlot.set(null);
    }
  }

  selectSlot(slot: TimeSlot): void {
    if (slot.spotsAvailable >= this.selectedChildren().length) this.selectedSlot.set(slot);
  }

  getChildName(id: string): string {
    return this.children().find(c => c.id === id)?.name || '';
  }

  confirmBooking(): void {
    this.snackBar.open('Booking confirmed for ' + this.selectedChildren().length + ' children!', 'OK', { duration: 3000 });
    this.router.navigate(['/parent/bookings']);
  }
}
