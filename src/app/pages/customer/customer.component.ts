import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Profile, ProfileService } from '../../services/profile.service';
import { OrderResponse } from '../../models/purchase-cart.model';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer.component.html',
})
export class CustomerComponent implements OnInit {

  profile: Profile = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profileImageUrl: ''
  };

  loading = false;
  saving = false;
  uploadingImage = false;

  message = '';
  messageType: 'success' | 'error' = 'success';

  showDeactivateModal = false;
  showCancelModal = false;
selectedOrderToCancel?: OrderResponse;

  constructor(
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;

    this.profileService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.message = 'Failed to load profile.';
        this.messageType = 'error';
        this.cdr.detectChanges();
      }
    });
  }

  saveProfile(): void {

    this.message = '';

    if (
      !this.profile.firstName?.trim() ||
      !this.profile.lastName?.trim()
    ) {
      this.message = 'First name and last name are required.';
      this.messageType = 'error';
      return;
    }

    this.saving = true;

    this.profileService.updateProfile(this.profile).subscribe({
      next: () => {
        this.saving = false;
        this.message = 'Profile updated successfully.';
        this.messageType = 'success';
        this.cdr.detectChanges();
      },
      error: () => {
        this.saving = false;
        this.message = 'Failed to update profile.';
        this.messageType = 'error';
        this.cdr.detectChanges();
      }
    });
  }

  onImageSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];

    this.uploadingImage = true;

    this.profileService.uploadProfileImage(file).subscribe({
      next: (response) => {

        this.profile.profileImageUrl = response.url;

        this.uploadingImage = false;

        this.message = 'Profile image uploaded successfully.';
        this.messageType = 'success';

        this.cdr.detectChanges();
      },
      error: () => {

        this.uploadingImage = false;

        this.message = 'Failed to upload image.';
        this.messageType = 'error';

        this.cdr.detectChanges();
      }
    });
  }

  removeProfileImage(): void {
    this.profile.profileImageUrl = '';
  }

  openDeactivateModal(): void {
    this.showDeactivateModal = true;
  }

  closeDeactivateModal(): void {
    this.showDeactivateModal = false;
  }

  confirmDeactivate(): void {

    this.profileService.deactivateAccount().subscribe({
      next: () => {

        localStorage.clear();

        window.location.href = '/';

      },
      error: () => {
        this.message = 'Failed to deactivate account.';
        this.messageType = 'error';
      }
    });
  }

  get initials(): string {

    const first = this.profile.firstName?.charAt(0) || '';
    const last = this.profile.lastName?.charAt(0) || '';

    return `${first}${last}`.toUpperCase() || 'U';
  }
}