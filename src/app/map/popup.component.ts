import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})
export class PopupComponent implements OnInit, AfterViewInit {
  @Input() visible = true
  @Output() popupVisible = new EventEmitter<boolean>()

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    console.log("afterViewInit: ", this.visible)
  }

  close() {
    this.popupVisible.emit(false)
  }
}
