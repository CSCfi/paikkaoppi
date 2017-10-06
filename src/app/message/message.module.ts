import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { MessageComponent } from './message.component';
import { MessageService } from './message.service';

@NgModule({
  imports: [
    CommonModule, RouterModule, FormsModule
  ],
  declarations: [MessageComponent],
  providers: [MessageService],
  exports: [MessageComponent]
})
export class MessageModule { }
