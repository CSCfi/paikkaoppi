import 'rxjs/add/operator/switchMap'
import { Component, Input, OnInit } from '@angular/core'
import { ActivatedRoute, ParamMap, Router } from '@angular/router'
import { environment } from '../../environments/environment'
import { TaskService } from '../service/task.service'
import { Task } from '../service/model'

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  isHelpVisible: boolean = environment.mapHelpVisibleInitially
  isMarkerVisible = false
  task: Task
  @Input() helpClosed: () => boolean

  constructor(private taskService: TaskService, private route: ActivatedRoute, private router: Router) {
  }

  ngOnInit(): void {
    this.route.paramMap
      .switchMap((params: ParamMap) => this.taskService.getTask(+params.get('id'), true, true))
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
