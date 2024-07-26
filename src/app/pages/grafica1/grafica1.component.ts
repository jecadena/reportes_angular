import { Component } from '@angular/core';



@Component({
  selector: 'app-grafica1',
  templateUrl: './grafica1.component.html',
  styles: [
  ]
})
export class Grafica1Component {

  public labels1: string[] = ['Dato', 'Dato 2', 'Dato 3'];
  public data1 = [
    [12, 35, 20],
  ];

}
