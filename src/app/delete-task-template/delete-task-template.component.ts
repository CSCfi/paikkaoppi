import { TaskTemplateService } from '../service/task-template.service';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TaskTemplate } from '../service/model';

@Component({
  selector: 'app-delete-task-template',
  templateUrl: './delete-task-template.component.html'
})
export class DeleteTaskTemplateComponent {
  @Input() model: any
  @Output() close = new EventEmitter<void>()
  @Output() delete = new EventEmitter<TaskTemplate>()

  constructor(private taskTemplateService: TaskTemplateService) { }

  closeDialog() {
    this.close.next()
  }


  submit() {
    console.log('submit', this.model)
    this.taskTemplateService.deleteTaskTemplate(this.model.id).subscribe(
      value => this.delete.next(value)
    )
  }
}
