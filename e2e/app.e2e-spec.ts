import { browser, by, element } from 'protractor'

import { LoginPage } from './app.po'

describe('Paikkaoppi App', () => {
  let loginPage: LoginPage

  beforeEach(() => {
    loginPage = new LoginPage()
  })

  it('should display login button', () => {
    loginPage.navigateTo()
    expect(loginPage.getLoginLink().getText()).toContain('kaisa')
  })
})
