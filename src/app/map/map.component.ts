import 'rxjs/add/operator/switchMap'
import * as GeoJSON from "geojson"
import { Component, OnInit, Input } from '@angular/core'
import { ActivatedRoute, ParamMap, Router } from '@angular/router'
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
  isHelpVisible: boolean = true
  task: Task
  @Input() helpClosed: () => boolean

  constructor(private taskService: TaskService, private route: ActivatedRoute, private taskTemplateService: TaskTemplateService) {
  }

  ngOnInit(): void {
    this.route.paramMap
      .switchMap((params: ParamMap) => this.taskService.getTask(+params.get('id'), true))
      .subscribe(task => {
        this.task = task
      })
    this.showHelp()
  }

  private async testTaskService(taskId: number) {
    console.log("testTaskService")
    const taskService = this.taskService
    const taskTemplateservice = this.taskTemplateService
    taskTemplateservice.getTaskTemplates().then(console.log)
    taskService.getTasks().then(console.log)
    let task = await taskService.getTask(this.task.id, true)
    console.log(task)
    let result = task.results[0]
    let point: GeoJSON.Point = {
      type: 'Point',
      coordinates: [60, 50]
    }
    let item: ResultItem = {
      id: null,
      resultId: result.id,
      geometry: point,
      name: "nimi",
      description: "desc"
    }
    console.log("addItem")
    item = await this.taskService.saveResultItem(result.id, item)
    task = await taskService.getTask(this.task.id, true)
    console.log(task)

    console.log("update item name")
    item.name = "name2"
    item = await this.taskService.updateResultItem(item.id, item)
    task = await taskService.getTask(this.task.id, true)
    console.log(task)
    console.log("Remove item")
    await this.taskService.removeResultItem(item.id)
    task = await taskService.getTask(this.task.id, true)
    console.log(task)
  }

  showHelp() {
    this.isHelpVisible = true
  }

  hideHelp() {
    this.isHelpVisible = false
  }
}
