export interface Event {
  _id?: string;
  id?: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  price: number;
  capacity: number;
  availableSeats: number;
  imageUrl: string;
  category: string;
  organizer?: string;
  createdAt?: string;
  updatedAt?: string;
}
