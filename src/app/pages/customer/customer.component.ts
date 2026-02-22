import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer.component.html'
})
export class CustomerComponent implements OnInit {

  profile: any = {};
  message = '';

  constructor(private profileService: ProfileService) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.profileService.getProfile().subscribe(data => {
      this.profile = data;
    });
  }

  saveProfile() {
    this.profileService.updateProfile(this.profile).subscribe(() => {
      this.message = 'Profile updated successfully!';
    });
  }
}