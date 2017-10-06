import { Component, OnInit } from '@angular/core'
import { Observable } from 'rxjs/Rx'
import { MessageService, Message, MessageAction, MessageSeverity, MessageActionType } from './message.service'

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit {
  messages: Message[] = []

  constructor(private messageService: MessageService) { }

  ngOnInit() {
    this.messageService.messagesAsObservable().subscribe(
      messageAction => {
        switch (messageAction.type) {
          case 'new': {
            this.messages.push(messageAction.message)
            break
          }
          case 'closed': {
            this.messages = this.messages.filter(msg => msg !== messageAction.message)
            break
          }
          default: {
            throw Error('Uknown MessageAction: ' + JSON.stringify(messageAction))
          }
        }
      }
    )
  }

  closeMessage(message: Message): void {
    console.log('closeMessage', message)
    const index = this.messages.indexOf(message, 0)
    this.messages = this.messages.filter(m => m !== message)
    this.messageService.publishMessageAction(message, 'closed')
  }
}
