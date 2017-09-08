import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OskariRpcComponent } from './oskari-rpc.component'
import { PopupComponent } from './popup.component'


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

}
