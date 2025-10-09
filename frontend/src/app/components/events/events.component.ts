import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Event } from '../../models/event.model';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent {
  searchQuery = '';
  events: Event[] = [];
  filtered: Event[] = [];

  showForm = false;
  editingEvent: Event | null = null;

  // simple booked events store for demo
  bookedEvents: Event[] = [];

  formModel: Partial<Event> = {
    title: '',
    description: '',
    date: '',
    time: '',
    location: 'Pune',
    price: 0,
    capacity: 0,
    availableSeats: 0,
    imageUrl: '',
    category: ''
  };

  constructor(private eventService: EventService, private router: Router) {
    this.load();
  }

  load() {
    this.events = this.eventService.list();
    this.applyFilter();
  }

  applyFilter() {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) this.filtered = [...this.events];
    else this.filtered = this.events.filter(e => {
      return e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.location.toLowerCase().includes(q);
    });
  }

  openCreate() {
    this.editingEvent = null;
    this.formModel = {
      title: '', description: '', date: '', time: '', location: '', price: 0, capacity: 0, availableSeats: 0, imageUrl: '', category: ''
    };
    this.showForm = true;
  }

  openEdit(e: Event) {
    this.editingEvent = e;
    this.formModel = { ...e };
    this.showForm = true;
  }

  cancelForm() {
    this.showForm = false;
    this.editingEvent = null;
  }

  submitForm() {
    // Basic validation
    if (!this.formModel.title || !this.formModel.date) {
      alert('Please provide title and date');
      return;
    }

    if (this.editingEvent && this.editingEvent._id) {
      this.eventService.update(this.editingEvent._id, this.formModel as Partial<Event>).subscribe({
        next: () => {
          this.load();
          this.showForm = false;
          this.editingEvent = null;
        },
        error: (error) => console.error('Update failed:', error)
      });
    } else {
      this.eventService.create(this.formModel as Omit<Event, 'id'>).subscribe({
        next: (created) => {
          // For demo, mark any created event with price 0 as booked
          if ((created.price ?? 0) === 0) this.bookedEvents.unshift(created);
          this.load();
          this.showForm = false;
          this.editingEvent = null;
        },
        error: (error) => console.error('Create failed:', error)
      });
    }
  }

  deleteEvent(e: Event) {
    if (!confirm(`Delete event '${e.title}'?`)) return;
    const eventId = e._id || e.id?.toString();
    if (eventId) {
      this.eventService.delete(eventId).subscribe({
        next: () => this.load(),
        error: (error) => console.error('Delete failed:', error)
      });
    }
  }

  markAsBooked(e: Event) {
    // demo: move to bookedEvents
    this.bookedEvents.unshift(e);
    alert(`Marked ${e.title} as booked (demo)`);
  }

  onImageSelected(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.formModel.imageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
}
