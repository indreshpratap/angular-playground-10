import { Component, Input } from '@angular/core';

@Component({
  selector: 'hello',
  template: `<h1>Hello {{name}}!</h1>`,
  styles: [`h1 { font-family: Lato; }`]
})
export class HelloComponent  {
  @Input() name: string;

  /**
   * res sync edit and delete
   * res selection and master disable
   * select all product
   * delete rule add blank
   * on save filter blank rule
   * validation
   * 
   */
}
