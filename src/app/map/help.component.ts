import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { Task } from '../service/model'

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit, AfterViewInit {
  @Input() visible = true
  @Input() task: Task
  @Output() helpClosed = new EventEmitter<boolean>()

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    console.log("afterViewInit: ", this.visible)
  }

  close() {
    this.helpClosed.emit(true)
  }
}
