import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'

import { MockComponent } from '../../tests/mocks.spec'
import { MessageService } from './message.service'
import { MessageComponent } from './message.component'

describe('MessageComponent', () => {
  let component: MessageComponent
  let fixture: ComponentFixture<MessageComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageComponent, MockComponent ],
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'map', component: MockComponent }
        ])
      ],
      providers: [
        MessageService
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
