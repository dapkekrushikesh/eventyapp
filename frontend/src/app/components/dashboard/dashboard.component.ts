import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { Event } from '../../models/event.model';
import { EventService } from '../../services/event.service';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgIf, ClickOutsideDirective, FormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // UI: polished payment modal styles applied (no-op comment to trigger rebuild)
  isSidebarCollapsed = false;
  isProfileMenuOpen = false;
  searchQuery: string = '';
  filterStartDate: string = '';
  filterEndDate: string = '';
  selectedCategory: string = 'all';
  showBookingModal = false;
  selectedEvent: Event | null = null;
  ticketCount: number = 1;

  // Profile settings
  displayName: string = 'New User';
  profileImageUrl: string = 'images/profile-img.png';

  // Notifications and messages
  notificationCount: number = 0;
  messageCount: number = 0;
  isNotificationDropdownOpen = false;
  isMessageDropdownOpen = false;

  // Sample notification data
  notifications: any[] = [];
  messages: any[] = [];

  get notificationTooltip(): string {
    return this.notificationCount > 0 
      ? `${this.notificationCount} notification${this.notificationCount > 1 ? 's' : ''}`
      : 'No notifications';
  }

  get messageTooltip(): string {
    return this.messageCount > 0 
      ? `${this.messageCount} message${this.messageCount > 1 ? 's' : ''}`
      : 'No messages';
  }

  events: Event[] = [];
  currentUser: User | null = null;
  isAdmin: boolean = false;
  isLoadingEvents = false;

  categories: string[] = ['All'];

  // New property to control date range popup
  showDateRange = false;
  showFilterPopup = false;
  showDateRangePopup = false;
  dateRange = { from: '', to: '' };

  constructor(
    private router: Router,
    private eventService: EventService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Restore authentication check
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Subscribe to current user
    this.authService.currentUser$.subscribe(user => {
      // console.log('Current user:', user); // Debug: check user and role
      this.currentUser = user;
      this.isAdmin = user?.role === 'admin';
      if (user) {
        this.displayName = user.displayName || user.name || 'New User';
        this.profileImageUrl = user.profileImageUrl || 'images/profile-img.png';
      }
    });

    // Subscribe to event changes for real-time updates
    this.eventService.events$.subscribe(events => {
      this.events = events;
      // Update categories dynamically from events
      const uniqueCategories = Array.from(new Set(events.map(e => e.category).filter(Boolean)));
      this.categories = ['All', ...uniqueCategories];
    });

    // Add two demo events (if not already present)
    if (this.events.length === 0) {
      this.events.push(
        {
          title: 'Music Fiesta',
          description: 'A grand music festival with live bands and DJs.',
          date: '2025-11-15',
          time: '18:00',
          location: 'Pune',
          price: 499,
          capacity: 200,
          availableSeats: 120,
          imageUrl: 'images/event1.jpg',
          category: 'Music',
          organizer: 'Eventy Team'
        },
        {
          title: 'Tech Summit 2025',
          description: 'Join the biggest technology summit with top speakers and workshops.',
          date: '2025-12-05',
          time: '10:00',
          location: 'Pune',
          price: 999,
          capacity: 300,
          availableSeats: 250,
          imageUrl: 'images/tech-summit.jpg',
          category: 'Technology',
          organizer: 'Eventy Team'
        }
      );
    }

    // Initial load
    this.loadEvents();
  }

  loadEvents() {
    this.isLoadingEvents = true;
    this.eventService.getEvents().subscribe({
      next: (events: Event[]) => {
        this.events = events;
        this.isLoadingEvents = false;
      },
      error: (error: any) => {
        console.error('Error loading events:', error);
        this.isLoadingEvents = false;
      }
    });
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
    this.isNotificationDropdownOpen = false; // Close other dropdowns
    this.isMessageDropdownOpen = false;
  }

  closeProfileMenu() {
    this.isProfileMenuOpen = false;
  }

  // Close all dropdowns when clicking elsewhere
  closeAllDropdowns() {
    this.isProfileMenuOpen = false;
    this.isNotificationDropdownOpen = false;
    this.isMessageDropdownOpen = false;
  }

  openProfileSettings(event?: MouseEvent) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.closeProfileMenu();
    this.router.navigate(['/profile-settings']);
  }

  logout(event?: MouseEvent) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.closeProfileMenu();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Notification dropdown methods
  toggleNotificationDropdown(event?: MouseEvent) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.isNotificationDropdownOpen = !this.isNotificationDropdownOpen;
    this.isMessageDropdownOpen = false; // Close other dropdown
    this.isProfileMenuOpen = false; // Close profile menu
  }

  toggleMessageDropdown(event?: MouseEvent) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.isMessageDropdownOpen = !this.isMessageDropdownOpen;
    this.isNotificationDropdownOpen = false; // Close other dropdown
    this.isProfileMenuOpen = false; // Close profile menu
  }

  closeNotificationDropdown() {
    this.isNotificationDropdownOpen = false;
  }

  closeMessageDropdown() {
    this.isMessageDropdownOpen = false;
  }

  // Methods to add notifications (for testing purposes)
  addNotification() {
    this.notificationCount++;
    this.notifications.push({
      id: Date.now(),
      title: 'New Notification',
      message: `This is notification #${this.notificationCount}`,
      time: new Date(),
      read: false
    });
  }

  addMessage() {
    this.messageCount++;
    this.messages.push({
      id: Date.now(),
      from: 'System',
      subject: `New Message #${this.messageCount}`,
      message: `This is message #${this.messageCount}`,
      time: new Date(),
      read: false
    });
  }

  get filteredEvents(): Event[] {
    let filtered = this.events;
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(event => {
        const combined = [
          event.title,
          event.description,
          event.location,
          event.category,
          event.organizer,
          event.date,
          event.time
        ].filter(Boolean).join(' ').toLowerCase();
        return combined.includes(query);
      });
    }
    if (this.selectedCategory && this.selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category?.toLowerCase() === this.selectedCategory.toLowerCase());
    }
    if (this.filterStartDate) {
      filtered = filtered.filter(event => event.date >= this.filterStartDate);
    }
    if (this.filterEndDate) {
      filtered = filtered.filter(event => event.date <= this.filterEndDate);
    }
    return filtered;
  }

  openBookingModal(event: Event) {
    this.selectedEvent = event;
    this.showBookingModal = true;
    this.ticketCount = 1;
  }

  closeBookingModal() {
    this.showBookingModal = false;
    this.selectedEvent = null;
    this.ticketCount = 1;
  }

  bookTickets() {
    if (this.selectedEvent && this.ticketCount > 0) {
      // Start the payment flow
      this.showBookingModal = false;
      this.openPaymentModal();
    }
  }

  // --- Payment flow state & helpers ---
  showPaymentModal = false;
  paymentProcessing = false;
  paymentSuccess = false;
  paymentError = '';
  paymentEmail: string = '';
  qrUrl: string = '';
  // New: multi-step payment flow
  paymentStep: 'enter' | 'method' | 'card_form' | 'wallet_select' | 'upi_form' | 'netbank_form' | 'confirm' | 'processing' | 'success' = 'enter';
  selectedPaymentMethod: string = '';
  // method-specific fields
  cardNumber: string = '';
  cardHolder: string = '';
  cardExpiryMonth: string = '';
  cardExpiryYear: string = '';
  cardCvv: string = '';

  selectedWalletApp: string = '';
  walletCreds: string = '';
  upiId: string = '';
  netbankUser: string = '';
  netbankPassword: string = '';

  openPaymentModal() {
    this.paymentProcessing = false;
    this.paymentSuccess = false;
    this.paymentError = '';
    // prefill email if user has one (demo)
    this.paymentEmail = 'client@example.com';
    this.paymentStep = 'enter';
    this.selectedPaymentMethod = '';
    this.showPaymentModal = true;
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.paymentProcessing = false;
    this.paymentSuccess = false;
    this.paymentError = '';
    this.qrUrl = '';
  }

  // initial click - validate and move to method selection
  onPayNow() {
    if (!this.paymentEmail) {
      this.paymentError = 'Please provide an email to receive the ticket.';
      return;
    }

    if (!this.selectedEvent) {
      this.paymentError = 'No event selected to pay for.';
      return;
    }

    this.paymentError = '';
    this.paymentStep = 'method';
  }

  // called when user selects a payment method (route to detail screens when needed)
  selectPaymentMethod(method: string) {
    this.selectedPaymentMethod = method;
    // route to appropriate detail form for the method
    if (method === 'card_credit' || method === 'card_debit') {
      this.paymentStep = 'card_form';
    } else if (method === 'wallet') {
      this.paymentStep = 'wallet_select';
    } else if (method === 'upi') {
      this.paymentStep = 'upi_form';
    } else if (method === 'netbank') {
      this.paymentStep = 'netbank_form';
    } else {
      this.paymentStep = 'confirm';
    }
  }

  // After the user fills card details, verify (dummy) then go to confirm
  async verifyCardDetailsAndProceed() {
    this.paymentError = '';
    // simple validation
    if (!this.cardNumber || !/^[0-9]{12,19}$/.test(this.cardNumber.replace(/\s+/g, ''))) {
      this.paymentError = 'Enter a valid card number (12-19 digits).';
      return;
    }
    if (!this.cardCvv || !/^[0-9]{3,4}$/.test(this.cardCvv)) {
      this.paymentError = 'Enter a valid CVV (3-4 digits).';
      return;
    }
    if (!this.cardExpiryMonth || !this.cardExpiryYear) {
      this.paymentError = 'Enter card expiry month and year.';
      return;
    }
    // Card expiry validation
    const expMonth = parseInt(this.cardExpiryMonth, 10);
    const expYear = parseInt(this.cardExpiryYear, 10);
    if (isNaN(expMonth) || isNaN(expYear) || expMonth < 1 || expMonth > 12) {
      this.paymentError = 'Enter a valid expiry month (01-12) and year.';
      return;
    }
    const now = new Date();
    const cardExpDate = new Date(expYear, expMonth - 1, 1);
    // Set to last day of expiry month
    cardExpDate.setMonth(cardExpDate.getMonth() + 1);
    cardExpDate.setDate(0);
    if (cardExpDate < new Date(now.getFullYear(), now.getMonth(), 1)) {
      this.paymentError = 'Card is expired. Please use a valid card.';
      return;
    }
    // simulate verification with gateway
    this.paymentProcessing = true;
    try {
      await new Promise(r => setTimeout(r, 700));
      this.paymentStep = 'confirm';
    } catch (e) {
      this.paymentError = 'Card verification failed (demo).';
    } finally {
      this.paymentProcessing = false;
    }
  }

  // Wallet: select an app then show credential input
  selectWalletApp(app: string) {
    this.selectedWalletApp = app;
    this.walletCreds = '';
    this.paymentError = '';
    // Do not proceed to confirm yet; wait for user to enter creds and confirm
  }

  // Wallet: verify entered creds and proceed
  verifyWalletAndProceed() {
    this.paymentError = '';
    if (!this.walletCreds || (this.selectedWalletApp !== 'bhim' && !/^\d{10}$/.test(this.walletCreds))) {
      this.paymentError = this.selectedWalletApp === 'bhim'
        ? 'Enter a valid UPI ID.'
        : 'Enter a valid 10-digit mobile number.';
      return;
    }
    if (this.selectedWalletApp === 'bhim' && !this.walletCreds.includes('@')) {
      this.paymentError = 'Enter a valid BHIM UPI ID (e.g. name@bank).';
      return;
    }
    this.paymentProcessing = true;
    setTimeout(() => {
      this.paymentProcessing = false;
      this.paymentStep = 'confirm';
      this.selectedPaymentMethod = `wallet:${this.selectedWalletApp}:${this.walletCreds}`;
    }, 700);
  }

  // UPI: dummy verify then go to confirm
  async verifyUpiAndProceed() {
    if (!this.upiId || !this.upiId.includes('@')) {
      this.paymentError = 'Enter a valid UPI ID (e.g. name@bank).';
      return;
    }
    this.paymentProcessing = true;
    try {
      await new Promise(r => setTimeout(r, 600));
      this.paymentStep = 'confirm';
      this.selectedPaymentMethod = `upi:${this.upiId}`;
    } catch (e) {
      this.paymentError = 'UPI verification failed (demo).';
    } finally {
      this.paymentProcessing = false;
    }
  }

  // Netbanking: dummy verify then go to confirm
  async verifyNetbankAndProceed() {
    if (!this.netbankUser || !this.netbankPassword) {
      this.paymentError = 'Enter netbanking username and password.';
      return;
    }
    this.paymentProcessing = true;
    try {
      await new Promise(r => setTimeout(r, 800));
      this.paymentStep = 'confirm';
      this.selectedPaymentMethod = `netbank:${this.netbankUser}`;
    } catch (e) {
      this.paymentError = 'Netbanking verification failed (demo).';
    } finally {
      this.paymentProcessing = false;
    }
  }

  // internal: process payment and create booking via backend
  async performPayment(method: string) {
    this.paymentProcessing = true;
    this.paymentError = '';
    this.paymentStep = 'processing';
    
    if (!this.selectedEvent || !this.currentUser) {
      this.paymentError = 'Missing event or user information';
      this.paymentProcessing = false;
      return;
    }

    try {
      const bookingData = {
        eventId: this.selectedEvent._id || this.selectedEvent.id?.toString(),
        quantity: this.ticketCount,
        totalAmount: this.getTotalPrice(),
        paymentMethod: method,
        attendeeEmail: this.paymentEmail || this.currentUser.email
      };

      // Book the ticket via EventService
      const booking = await this.eventService.createBooking(bookingData).toPromise();
      
      if (booking && booking.success) {
        // Update local event data
        this.selectedEvent.availableSeats = Math.max(0, this.selectedEvent.availableSeats - this.ticketCount);
        
        // Set QR URL from booking response
        this.qrUrl = booking.ticket?.qrCode || '';

        // Create ticket image for download
        await this.createTicketImage();

        // Mark success
        this.paymentSuccess = true;
        this.paymentStep = 'success';
      } else {
        throw new Error(booking?.message || 'Booking failed');
      }
    } catch (err: any) {
      console.error('performPayment error', err);
      this.paymentError = err.message || 'Payment failed. Please try again.';
      this.paymentSuccess = false;
      this.paymentStep = 'enter';
    } finally {
      this.paymentProcessing = false;
    }
  }

  // Render a simple ticket on a canvas and prepare a downloadable data URL
  async createTicketImage() {
    try {
      const canvas = document.createElement('canvas');
      const width = 800; const height = 420;
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d')!;

      // background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // header
      ctx.fillStyle = '#0078d4';
      ctx.fillRect(0, 0, width, 80);
      ctx.fillStyle = '#fff';
      ctx.font = '28px Arial';
      ctx.fillText('Event Ticket', 20, 50);

      // Event details
      ctx.fillStyle = '#111';
      ctx.font = '20px Arial';
      ctx.fillText(this.selectedEvent?.title || 'Event Title', 20, 120);
      ctx.font = '16px Arial';
      ctx.fillText(`Date: ${this.selectedEvent?.date || ''} ${this.selectedEvent?.time || ''}`, 20, 150);
      ctx.fillText(`Location: ${this.selectedEvent?.location || ''}`, 20, 180);
      ctx.fillText(`Tickets: ${this.ticketCount}`, 20, 210);
      ctx.fillText(`Attendee Email: ${this.paymentEmail}`, 20, 240);

      // QR code (load image)
      if (this.qrUrl) {
        const img = await this.loadImage(this.qrUrl);
        // draw QR on right side
        ctx.drawImage(img, width - 260 - 20, 100, 260, 260);
      }

      // convert to data url and set for download link
  const dataUrl = canvas.toDataURL('image/png');
  // store for download and server upload
  (this as any).lastTicketDataUrl = dataUrl;
      // attach to a hidden download anchor
      const aId = 'generated-ticket-download';
      let a = document.getElementById(aId) as HTMLAnchorElement | null;
      if (!a) {
        a = document.createElement('a');
        a.id = aId;
        document.body.appendChild(a);
      }
      a.href = dataUrl;
      a.download = `${(this.selectedEvent?.title || 'ticket').replace(/\s+/g, '_')}_${Date.now()}.png`;
    } catch (err) {
      console.error('createTicketImage error', err);
    }
  }

  loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      let settled = false;
      const onResolve = () => { if (!settled) { settled = true; resolve(img); } };
      const onReject = (e: any) => { if (!settled) { settled = true; reject(e); } };
      img.onload = onResolve;
      img.onerror = onReject;
      img.src = src;
      // safety timeout 4s
      setTimeout(() => {
        if (!settled) {
          settled = true;
          reject(new Error('QR image load timeout'));
        }
      }, 4000);
    });
  }

  downloadTicket() {
    const a = document.getElementById('generated-ticket-download') as HTMLAnchorElement | null;
    if (a) a.click();
    else alert('Ticket not ready yet. Please wait a moment and try again.');
  }

  sendTicketByEmail() {
    // First try to send via backend server (if available)
    const dataUrl = (this as any).lastTicketDataUrl as string | undefined;
    if (!dataUrl) {
      alert('Ticket not ready yet. Please download it first or wait a moment.');
      return;
    }

    this.sendTicketByServer().catch(err => {
      console.error('Server send failed, falling back to mailto', err);
      // fallback to mailto
      const subject = `Your ticket for ${(this.selectedEvent?.title || 'Event')}`;
      const bodyLines = [];
      bodyLines.push(`Hello,`);
      bodyLines.push('Thank you for your booking. Attached is your ticket and QR code (inline link below).');
      bodyLines.push('');
      bodyLines.push(`Event: ${this.selectedEvent?.title || ''}`);
      bodyLines.push(`Date: ${this.selectedEvent?.date || ''} ${this.selectedEvent?.time || ''}`);
      bodyLines.push(`Tickets: ${this.ticketCount}`);
      bodyLines.push('');
      if (this.qrUrl) bodyLines.push(`QR Code: ${this.qrUrl}`);

      const mailto = `mailto:${encodeURIComponent(this.paymentEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
      window.location.href = mailto;
    });
  }

  async sendTicketByServer(): Promise<void> {
    const dataUrl = (this as any).lastTicketDataUrl as string | undefined;
    if (!dataUrl) throw new Error('ticket-not-ready');

    const payload = {
      email: this.paymentEmail,
      subject: `Your ticket for ${(this.selectedEvent?.title || 'Event')}`,
      text: `Thank you for booking ${(this.selectedEvent?.title || '')}. Tickets: ${this.ticketCount}`,
      ticketDataUrl: dataUrl,
      qrUrl: this.qrUrl
    };

    try {
      const res = await fetch('http://localhost:3000/api/send-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'send-failed');
      }
      const body = await res.json();
      // show preview URL in-app when available
      (this as any).lastPreviewUrl = body.previewUrl || '';
      this.showPreviewModal = true;
    } catch (err) {
      console.error('sendTicketByServer error', err);
      throw err;
    }
  }

  // preview modal state
  showPreviewModal = false;
  lastPreviewUrl: string = '';

  closePreviewModal() {
    this.showPreviewModal = false;
    this.lastPreviewUrl = '';
  }

  getTotalPrice(): number {
    return this.selectedEvent ? this.selectedEvent.price * this.ticketCount : 0;
  }

  goToEvents() {
    this.router.navigate(['/events']);
  }

  applySearch() {
    this.searchQuery = this.searchQuery.trim();
    // No-op: filteredEvents getter will update automatically
  }

  toggleDateRangePopup() {
    this.showDateRangePopup = !this.showDateRangePopup;
  }

  applyDateRange() {
    this.filterStartDate = this.dateRange.from;
    this.filterEndDate = this.dateRange.to;
    this.showDateRangePopup = false;
  }

  clearDateRange() {
    this.dateRange = { from: '', to: '' };
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.showDateRangePopup = false;
  }

  // Returns a string of seat numbers for the current booking (sequential, demo only)
  getSeatNumbers(): string {
    if (!this.selectedEvent || !this.selectedEvent.capacity) return '';
    // For demo: assign next available seats (not persistent)
    const start = this.selectedEvent.capacity - (this.selectedEvent.availableSeats || 0) + 1;
    const end = start + this.ticketCount - 1;
    if (start > end) return '';
    const seats = [];
    for (let i = start; i <= end; i++) seats.push(i);
    return seats.join(', ');
  }
}
