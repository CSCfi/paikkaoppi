import { browser } from 'protractor'

import { LoginPage, MainPage } from './app.po'

describe('Paikkaoppi App', () => {
  let loginPage: LoginPage
  let mainPage: MainPage

  beforeEach(() => {
    loginPage = new LoginPage()
    mainPage = new MainPage()
  })

  it('should display login button', () => {
    loginPage.navigateTo()
    expect(loginPage.getLoginLink().getText()).toContain('kaisa')
  })

  it('should allow login and redirect to main page', () => {
    loginPage.navigateTo()
    loginPage.getLoginLink().click()
    expect(mainPage.getItemTitleText()).toEqual('Lataa tehtävä')
  })
})
