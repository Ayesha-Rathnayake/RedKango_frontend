import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewChecked,
  ChangeDetectorRef,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { ChatbotService } from '../../services/chatbot.service';
import { ChatMessage, ChatbotResponse } from '../../models/chatbot.model';

@Component({
  selector: 'app-chat-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-assistant.component.html',
})
export class ChatAssistantComponent implements AfterViewChecked {
  @ViewChild('messagesContainer')
  messagesContainer!: ElementRef<HTMLDivElement>;

  isChatOpen = false;
  userInput = '';
  isLoading = false;

  messages: ChatMessage[] = [];

  private shouldScroll = false;

  constructor(
    private chatbotService: ChatbotService,
    private cdr: ChangeDetectorRef
  ) {}

  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;

    setTimeout(() => {
      this.scrollToBottom();
    }, 100);
  }

  sendMessage(event: Event): void {
    event.preventDefault();

    const question = this.userInput.trim();

    if (!question || this.isLoading) return;

    this.messages.push({
      text: question,
      role: 'user',
      timestamp: new Date(),
    });

    this.userInput = '';
    this.isLoading = true;
    this.shouldScroll = true;

    this.cdr.detectChanges();

    setTimeout(() => {
      this.scrollToBottom();
    }, 100);

    this.chatbotService
      .sendMessage(question)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();

          setTimeout(() => {
            this.scrollToBottom();
          }, 100);
        })
      )
      .subscribe({
        next: (response: ChatbotResponse) => {
          const formattedResponse = this.formatBotResponse(
            response.resultData || 'No response received'
          );

          this.messages.push({
            text: formattedResponse,
            role: 'bot',
            timestamp: new Date(),
          });

          this.shouldScroll = true;
          this.cdr.detectChanges();

          setTimeout(() => {
            this.scrollToBottom();
          }, 100);
        },

        error: (error: unknown) => {
          console.error('CHATBOT ERROR:', error);

          this.messages.push({
            text: 'Sorry, assistant unavailable right now.',
            role: 'bot',
            timestamp: new Date(),
          });

          this.shouldScroll = true;
          this.cdr.detectChanges();

          setTimeout(() => {
            this.scrollToBottom();
          }, 100);
        },
      });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private scrollToBottom(): void {
    try {
      const container = this.messagesContainer?.nativeElement;

      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    } catch (err: unknown) {
      console.error(err);
    }
  }

  private formatBotResponse(text: string): string {
    text = text.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-semibold">$1</strong>'
    );

    text = text.replace(/\s\*\s/g, '\n* ');

    const lines = text.split('\n');

    let formatted = '';
    let insideList = false;

    lines.forEach((line: string) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
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
        if (insideList) {
          formatted += '</ul>';
          insideList = false;
        }

        if (trimmed !== '') {
          formatted += `
            <p class="mb-3 leading-7">
              ${trimmed}
            </p>
          `;
        }
      }
    });

    if (insideList) {
      formatted += '</ul>';
    }

    return formatted;
  }
}