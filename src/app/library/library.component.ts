import { Component, OnInit } from '@angular/core';
import { User, Role, AuthService } from '../service/auth.service'
import { TaskTemplateService } from '../service/task-template.service'
import { TaskTemplate } from '../service/model'

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.css']
})
export class LibraryComponent implements OnInit {
  taskTemplates: TaskTemplate[] = []

  constructor(private taskTemplateService: TaskTemplateService) { }

  ngOnInit() {
    this.taskTemplates = this.taskTemplateService.getTaskTemplates()
  }

}
