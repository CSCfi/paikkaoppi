import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { OskariRpcComponent } from './oskari-rpc.component'

describe('OskariRpcComponent', () => {
  let component: OskariRpcComponent
  let fixture: ComponentFixture<OskariRpcComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OskariRpcComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(OskariRpcComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should be created', () => {
    expect(component).toBeTruthy()
  })
})
