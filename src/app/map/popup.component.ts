import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})
export class PopupComponent implements OnInit {
  visible = true

  constructor() { }

  ngOnInit() {
  }


  close() {
    this.visible = !this.visible
  }
}
