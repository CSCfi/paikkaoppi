import { Component, Output, EventEmitter, OnInit } from '@angular/core'

@Component({
  selector: 'app-mark',
  templateUrl: './mark.component.html',
  styleUrls: ['./mark.component.css']
})
export class MarkComponent implements OnInit {
  @Output() markDeleted = new EventEmitter()

  data: any = {}
  visible = false

  constructor() {
  }

  ngOnInit() {
  }

  close() {
    this.visible = !this.visible
  }

  save() {
    this.visible = !this.visible
  }

  remove() {
    this.visible = !this.visible
    this.markDeleted.emit(this.data)
  }
}
