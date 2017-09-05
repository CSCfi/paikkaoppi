import { Component, NgZone, AfterViewInit } from '@angular/core';
import OskariRPC from 'oskari-rpc';
import { environment } from '../../environments/environment';


@Component({
  selector: 'app-oskari-rpc',
  templateUrl: './oskari-rpc.component.html',
  styleUrls: ['./oskari-rpc.component.css']
})
export class OskariRpcComponent implements AfterViewInit {
  env = environment.mapEnv
  domain = environment.mapDomain
  channel: any


  constructor(private zone: NgZone) { }

  ngAfterViewInit() {
    console.info("OskariRpcComponent: ngAfterViewInit")
    const iframe = document.getElementById('oskari-map')
    console.info("Connect IFrame to ", this.domain)
    this.channel = OskariRPC.connect(iframe, this.domain)
    console.info("channel: ", this.channel)
    this.channel.onReady(function() {
      console.info("copy/paste")
    });

    this.channel.onReady( () => {
      console.info("onReady TUKO")
    });
    /*
    this.channel.onReady( () => {
      console.info("onReady1")
    });
    this.channel.onReady( () => {
      this.zone.runGuarded( () => console.info("onReady2"))
    });
    this.channel.onReady( function() {
      console.info("onReady3")
    });
    */
    console.log(this.channel.isReady())
  }

  checkRpcVersion() {
    console.info("checkRpcVersion")
    console.info("IsReady: ", this.channel.isReady())
    //channel is now ready and listening.
    this.channel.log('Map is now listening');
    var expectedOskariVersion = '2.0.4';
    this.channel.isSupported(expectedOskariVersion, function (blnSupported) {
      if (blnSupported) {
        this.channel.log('Client is supported and Oskari version is ' + expectedOskariVersion)
      } else {
        this.channel.log('Oskari-instance is not the one we expect (' + expectedOskariVersion + ') or client not supported')
        // getInfo can be used to get the current Oskari version
        this.channel.getInfo(function (oskariInfo) {
          this.channel.log('Current Oskari-instance reports version as: ', oskariInfo)
        });
      }
    });
    this.channel.isSupported(function (blnSupported) {
      if (!blnSupported) {
        this.channel.log('Oskari reported client version (' + OskariRPC.VERSION + ') is not supported.' +
          'The client might work, but some features are not compatible.')
      } else {
        this.channel.log('Client is supported by Oskari.')
      }
    })
  }
}
