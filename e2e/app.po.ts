import { ElementFinder } from 'protractor/built/element';
import { browser, by, element } from 'protractor'

export class LoginPage {
  navigateTo(): any {
    return browser.get('/')
  }

  getLoginLink(): ElementFinder {
    return element.all(by.css('app-root a')).first()
  }
}

export class MainPage {
  getItemTitleText(): any {
    return element.all(by.css('app-root .list__item-title')).first().getText()
  }
}
