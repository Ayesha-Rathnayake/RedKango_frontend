import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatAssistantComponent } from './components/chat-assistant/chat-assistant.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ChatAssistantComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
