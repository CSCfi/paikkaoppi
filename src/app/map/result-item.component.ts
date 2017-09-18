import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ResultItem } from '../service/model'

@Component({
  selector: 'app-result-item',
  templateUrl: './result-item.component.html',
  styleUrls: ['./result-item.component.css']
})
export class ResultItemComponent implements OnInit {
  visible = false
  model: any
  
  @Output() deleteResultItem = new EventEmitter<ResultItem>()
  @Output() saveResultItem = new EventEmitter<ResultItem>()

  constructor() { }

  ngOnInit() {
  }

  close() {
    if (this.model.id === undefined) {
      this.deleteResultItem.emit(this.model)
    }
    this.hide()
  }

  save() {
    this.saveResultItem.emit(this.model)
    this.hide()
  }

  delete() {
    this.deleteResultItem.emit(this.model)
    this.hide()
  }

  private hide() {
    this.visible = false
    this.model = null
  }
}