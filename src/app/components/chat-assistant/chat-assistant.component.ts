import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewChecked,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { finalize } from 'rxjs/operators';

import { DomSanitizer } from '@angular/platform-browser';

import { ChatbotService } from '../../services/chatbot.service';

interface Message {
  text: any;
  role: 'user' | 'bot';
  timestamp: Date;
}

@Component({
  selector: 'app-chat-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-assistant.component.html'
})
export class ChatAssistantComponent implements AfterViewChecked {

  @ViewChild('messagesContainer')
  messagesContainer!: ElementRef;

  isChatOpen = false;

  userInput = '';

  isLoading = false;

  messages: Message[] = [];

  private shouldScroll = false;

  constructor(
    private chatbotService: ChatbotService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  toggleChat() {

    this.isChatOpen = !this.isChatOpen;

    setTimeout(() => {
      this.scrollToBottom();
    }, 100);
  }

  sendMessage(event: Event) {

    event.preventDefault();

    const question = this.userInput.trim();

    if (!question || this.isLoading) return;

    // USER MESSAGE
    this.messages.push({
      text: question,
      role: 'user',
      timestamp: new Date()
    });

    this.userInput = '';

    this.isLoading = true;

    this.shouldScroll = true;

    // FORCE UI UPDATE
    this.cdr.detectChanges();

    setTimeout(() => {
      this.scrollToBottom();
    }, 100);

    // API CALL
    this.chatbotService.sendMessage(question)
      .pipe(
        finalize(() => {

          this.isLoading = false;

          // FORCE UI UPDATE
          this.cdr.detectChanges();

          setTimeout(() => {
            this.scrollToBottom();
          }, 100);
        })
      )
      .subscribe({

        next: (response: any) => {

          console.log('BOT RESPONSE:', response);

          const formattedResponse =
            this.formatBotResponse(
              response?.resultData || 'No response received'
            );

          this.messages.push({
          text: formattedResponse,
            role: 'bot',
            timestamp: new Date()
          });

          this.shouldScroll = true;

          // FORCE UI REFRESH
          this.cdr.detectChanges();

          setTimeout(() => {
            this.scrollToBottom();
          }, 100);
        },

        error: (error) => {

          console.error('CHATBOT ERROR:', error);

          this.messages.push({
            text: 'Sorry, assistant unavailable right now.',
            role: 'bot',
            timestamp: new Date()
          });

          this.shouldScroll = true;

          // FORCE UI REFRESH
          this.cdr.detectChanges();

          setTimeout(() => {
            this.scrollToBottom();
          }, 100);
        }
      });
  }

  ngAfterViewChecked() {

    if (this.shouldScroll) {

      this.scrollToBottom();

      this.shouldScroll = false;
    }
  }

  private scrollToBottom() {

    try {

      if (this.messagesContainer) {

        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }

    } catch (err) {

      console.error(err);
    }
  }

  // FORMAT BOT RESPONSE
  private formatBotResponse(text: string): string {

    // BOLD TEXT
    text = text.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-semibold">$1</strong>'
    );

    // FIX INLINE BULLETS
    text = text.replace(/\s\*\s/g, '\n* ');

    const lines = text.split('\n');

    let formatted = '';

    let insideList = false;

    lines.forEach(line => {

      const trimmed = line.trim();

      // BULLET POINTS
      if (
        trimmed.startsWith('* ') ||
        trimmed.startsWith('- ')
      ) {

        if (!insideList) {

          formatted += `
            <ul class="list-disc pl-5 my-3 space-y-2">
          `;

          insideList = true;
        }

        formatted += `
          <li class="leading-7">
            ${trimmed.substring(2)}
          </li>
        `;

      } else {

        // CLOSE LIST
        if (insideList) {

          formatted += '</ul>';

          insideList = false;
        }

        // NORMAL PARAGRAPH
        if (trimmed !== '') {

          formatted += `
            <p class="mb-3 leading-7">
              ${trimmed}
            </p>
          `;
        }
      }
    });

    // CLOSE LAST LIST
    if (insideList) {

      formatted += '</ul>';
    }

    return formatted;
  }
}