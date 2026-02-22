// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-chat-assistant',
//   standalone: true,
//   templateUrl: './chat-assistant.component.html'
// })
// export class ChatAssistantComponent {}



import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Message {
  text: string;
  role: 'user' | 'model'; // Using 'model' to match Gemini API format
  timestamp: Date;
}

@Component({
  selector: 'app-chat-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-assistant.component.html'
})
export class ChatAssistantComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  isChatOpen = false;
  userInput = '';
  isLoading = false;
  messages: Message[] = [];

  private shouldScrollToBottom = false;

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
  }

  sendMessage(event: Event) {
    event.preventDefault();
    
    if (!this.userInput.trim()) return;

    // Add user message to chat
    const userMessage: Message = {
      text: this.userInput,
      role: 'user',
      timestamp: new Date()
    };

    this.messages.push(userMessage);
    this.shouldScrollToBottom = true;

    // Clear input
    const userQuestion = this.userInput;
    this.userInput = '';

    // Show loading indicator
    this.isLoading = true;

    // TODO: Call Gemini API here
    // Example structure:
    /*
    this.geminiService.sendMessage(userQuestion).subscribe({
      next: (response) => {
        const botMessage: Message = {
          text: response.text,
          role: 'model',
          timestamp: new Date()
        };
        this.messages.push(botMessage);
        this.isLoading = false;
        this.shouldScrollToBottom = true;
      },
      error: (error) => {
        console.error('Gemini API Error:', error);
        this.isLoading = false;
        // Handle error
      }
    });
    */

    // Temporary placeholder response (remove when implementing Gemini API)
    setTimeout(() => {
      const botMessage: Message = {
        text: 'Gemini API integration pending. This is a placeholder response.',
        role: 'model',
        timestamp: new Date()
      };
      this.messages.push(botMessage);
      this.isLoading = false;
      this.shouldScrollToBottom = true;
    }, 1500);
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = 
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
}