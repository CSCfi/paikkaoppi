import { browser, by, element } from 'protractor'

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
    browser.driver.sleep(500)

    loginPage.getLoginLink().click()
    browser.driver.sleep(500)

    console.log(element(by.css('app-root')).getText())

    expect(mainPage.getItemTitleText()).toEqual('Lataa tehtävä')

    browser.driver.sleep(500)
  })
})
