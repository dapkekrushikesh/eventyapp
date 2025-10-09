import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Event } from '../models/event.model';
import { environment } from '../../environments/environment';

interface ApiResponse<T> {
  success?: boolean;
  events?: Event[];
  event?: Event;
  message?: string;
  total?: number;
  totalPages?: number;
  currentPage?: number;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly apiUrl = environment.apiUrl;
  private eventsSubject = new BehaviorSubject<Event[]>([]);
  public events$ = this.eventsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadEvents();
  }

  private getHttpOptions(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      })
    };
  }

  private handleError(error: any): Observable<never> {
    console.error('Event Service Error:', error);
    let errorMessage = 'An unknown error occurred';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.error?.error) {
      errorMessage = error.error.error;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }

  // Load events from backend
  loadEvents(params?: { category?: string; search?: string; page?: number; limit?: number }): Observable<Event[]> {
    let httpParams = new HttpParams();
    
    if (params?.category && params.category !== 'all') {
      httpParams = httpParams.set('category', params.category);
    }
    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }

    return this.http.get<ApiResponse<Event[]>>(`${this.apiUrl}/api/events`, { params: httpParams })
      .pipe(
        map(response => {
          const events = response.events || [];
          this.eventsSubject.next(events);
          return events;
        },
        catchError(this.handleError))
      );
  }

  // Get all events (for backward compatibility)
  list(): Event[] {
    return this.eventsSubject.getValue();
  }

  // Get all events as Observable
  getEvents(params?: { category?: string; search?: string; page?: number; limit?: number }): Observable<Event[]> {
    return this.loadEvents(params);
  }

  // Get single event by ID
  get(id: string | number): Observable<Event | undefined> {
    return this.http.get<ApiResponse<Event>>(`${this.apiUrl}/api/events/${id}`)
      .pipe(
        map(response => response.event),
        catchError(this.handleError)
      );
  }

  // Get single event synchronously (for backward compatibility)
  getSync(id: number): Event | undefined {
    return this.eventsSubject.getValue().find(e => e.id === id);
  }

  // Create new event
  create(event: Omit<Event, 'id'>): Observable<Event> {
    return this.http.post<ApiResponse<Event>>(`${this.apiUrl}/api/events`, event, this.getHttpOptions())
      .pipe(
        map(response => {
          if (!response.event) {
            throw new Error('Event creation failed: No event returned');
          }
          return response.event;
        }),
        tap(() => {
          // Reload events after creation
          this.loadEvents().subscribe();
        }),
        catchError(this.handleError)
      );
  }

  // Update existing event
  update(id: string | number, changes: Partial<Event>): Observable<Event> {
    return this.http.put<ApiResponse<Event>>(`${this.apiUrl}/api/events/${id}`, changes, this.getHttpOptions())
      .pipe(
        map(response => {
          const updatedEvent = response.event!;
          const currentEvents = this.eventsSubject.getValue();
          const index = currentEvents.findIndex(e => e.id === id);
          if (index !== -1) {
            currentEvents[index] = updatedEvent;
            this.eventsSubject.next([...currentEvents]);
          }
          return updatedEvent;
        }),
        catchError(this.handleError)
      );
  }

  // Delete event
  delete(id: string | number): Observable<boolean> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/api/events/${id}`, this.getHttpOptions())
      .pipe(
        map(() => {
          const currentEvents = this.eventsSubject.getValue();
          const filteredEvents = currentEvents.filter(e => e.id !== id);
          this.eventsSubject.next(filteredEvents);
          return true;
        }),
        catchError(this.handleError)
      );
  }

  // Get events by category
  getEventsByCategory(category: string): Observable<Event[]> {
    return this.loadEvents({ category });
  }

  // Search events
  searchEvents(query: string): Observable<Event[]> {
    return this.loadEvents({ search: query });
  }

  // Book tickets for an event
  createBooking(bookingData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/tickets/book`, bookingData, this.getHttpOptions())
      .pipe(
        catchError(this.handleError)
      );
  }

  // Get user's tickets
  getUserTickets(): Observable<any[]> {
    return this.http.get<{success: boolean, tickets: any[]}>(`${this.apiUrl}/tickets/my-tickets`, this.getHttpOptions())
      .pipe(
        map(response => response.tickets || []),
        catchError(this.handleError)
      );
  }
}
