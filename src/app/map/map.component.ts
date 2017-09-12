import 'rxjs/add/operator/switchMap'
import { Component, OnInit, Input } from '@angular/core'
import { ActivatedRoute, ParamMap, Router } from '@angular/router'
import { OskariRpcComponent } from './oskari-rpc.component'
import { HelpComponent } from './help.component'
import { TaskService } from '../service/task.service'
import { Task } from '../service/model'

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  isHelpVisible: boolean = true
  task: Task
  @Input() helpClosed: () => boolean

  constructor(private taskService: TaskService, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.paramMap
      .switchMap((params: ParamMap) => this.taskService.getTask(+params.get('id')))
      .subscribe(task => this.task = task)

    this.showHelp()
  }

  showHelp() {
    this.isHelpVisible = true
  }

  hideHelp() {
    this.isHelpVisible = false
  }
}
