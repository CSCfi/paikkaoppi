import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { OskariRpcComponent } from './oskari-rpc.component'
import { PopupComponent } from './popup.component'


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  showHelp : boolean = true
  @Input() popupVisible : () => boolean

  constructor(private router: Router) { }

  ngOnInit() {
  }

  showPopup() {
    this.showHelp = true
  }

  hidePopup() {
    this.showHelp = false
  }
}
