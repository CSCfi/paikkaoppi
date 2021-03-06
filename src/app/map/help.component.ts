import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit } from '@angular/core'
import { Task } from '../service/model'

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit {
  @Input() visible = true
  @Input() task: Task | null
  @Output() helpClosed = new EventEmitter<boolean>()

  constructor() { }

  ngOnInit() {
  }

  close() {
    this.helpClosed.emit(true)
  }
}
