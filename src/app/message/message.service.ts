import { MessageActionType } from './message.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx'
import { Subject } from 'rxjs/Subject'
import { Router, NavigationStart } from '@angular/router';

@Injectable()
export class MessageService {
  private messageSubject = new Subject<MessageAction>()
  private messageActions = new Subject<MessageAction>()

  constructor(private router: Router) {
    router.events.subscribe(event => {
      if (event instanceof NavigationStart)
        this.clear()
    })
  }

  info(severity: MessageSeverity, code: string, message: string): { observable: Observable<MessageAction>, message: Message } {
    const msg = this.pushlishNewMessage(severity, code, message, 'type--' + severity)
    return { observable: this.messageActionsAsObservable(msg), message: msg }
  }

  closeMessage(message: Message) {
    const msg = this.pushlishCloseMessage(message)
    return { observable: this.messageActionsAsObservable(msg), message: msg }
  }

  messagesAsObservable(): Observable<MessageAction> {
    return this.messageSubject.asObservable()
  }

  publishMessageAction(message: Message, type: MessageActionType) {
    console.log('publishMessageAction', message, type)
    this.messageActions.next(<MessageAction>{ message: message, type: type })
  }

  private messageActionsAsObservable(message: Message): Observable<MessageAction> {
    return this.messageActions.asObservable().filter(action => action.message === message)
  }

  private pushlishNewMessage(severity: MessageSeverity, code: string, message: string, cssClass: string): Message {
    const msg = <Message>{ severity: severity, code: code, message: message, cssClass: cssClass }
    const action = <MessageAction>{ type: 'new', message: msg }
    console.info('Publish message:', action)
    this.messageSubject.next(action)
    return msg
  }

  private pushlishCloseMessage(message: Message): Message {
    const action = <MessageAction>{ type: 'closed', message: message }
    console.info('Publish message:', action)
    this.messageSubject.next(action)
    return message
  }

  private clear() {
    this.messageSubject.next()
  }
}

export interface Message {
  severity: MessageSeverity
  code: string,
  message: string,
  cssClass: string,
}

export type MessageSeverity = 'info' | 'warn' | 'error'

export interface MessageAction {
  message: Message,
  type: MessageActionType,
}

export type MessageActionType = 'new' | 'closed'
