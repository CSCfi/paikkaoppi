import 'rxjs/add/operator/switchMap'
import * as GeoJSON from 'geojson'
import { Component, OnInit, Input } from '@angular/core'
import { ActivatedRoute, ParamMap, Router } from '@angular/router'
import { environment } from '../../environments/environment'
import { OskariRpcComponent } from './oskari-rpc.component'
import { HelpComponent } from './help.component'
import { TaskService } from '../service/task.service'
import { TaskTemplateService } from '../service/task-template.service'
import { Task, Result, ResultItem, Geometry } from '../service/model'

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  isHelpVisible: boolean = environment.mapHelpVisibleInitially
  task: Task
  @Input() helpClosed: () => boolean

  constructor(private taskService: TaskService, private route: ActivatedRoute, private router: Router,
    private taskTemplateService: TaskTemplateService) {
  }

  ngOnInit(): void {
    this.route.paramMap
      .switchMap((params: ParamMap) => this.taskService.getTask(+params.get('id'), true))
      .subscribe(task => {
        this.task = task
      },
      error => {
        console.error('Failed get task')
        console.error(error)
        if (error.status === 404) this.router.navigate(['/dashboard'])
      })
  }

  showHelp() {
    this.isHelpVisible = true
  }

  hideHelp() {
    this.isHelpVisible = false
  }
}
