import { Component, Output, EventEmitter, OnInit } from '@angular/core'

import { MarkService } from '../service/mark.service'
import { Mark } from '../service/model'

@Component({
  selector: 'app-mark',
  templateUrl: './mark.component.html',
  styleUrls: ['./mark.component.css']
})
export class MarkComponent implements OnInit {
  @Output() markDeleted = new EventEmitter()

  mark: Mark
  visible = false

  constructor(private markService: MarkService) {
  }

  ngOnInit() {
  }

  close() {
    this.visible = !this.visible
  }

  save() {
    this.markService.saveMark(this.mark)
    this.visible = !this.visible
  }

  remove() {
    this.markService.deleteMark(this.mark)
    this.visible = !this.visible
    this.markDeleted.emit(this.mark)
  }
}
