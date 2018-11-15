import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { HelpComponent } from './help.component'
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from "@ngx-translate/core";

describe('HelpComponent', () => {
  let component: HelpComponent
  let fixture: ComponentFixture<HelpComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HelpComponent],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: () => new TranslateFakeLoader()
          }
        })
      ]
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should be created', () => {
    expect(component).toBeTruthy()
  })
})
