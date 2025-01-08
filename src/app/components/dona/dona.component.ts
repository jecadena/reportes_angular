import { Component, Input } from '@angular/core';
<<<<<<< HEAD
import { MultiDataSet, Label, Color } from 'ng2-charts';
=======
//import { MultiDataSet, Label, Color } from 'ng2-charts';
>>>>>>> a97120ffbfe32daaf50fcca799116113ed1f84a9

@Component({
  selector: 'app-dona',
  templateUrl: './dona.component.html',
  styles: [
  ]
})
export class DonaComponent{
  
  @Input() title: string = 'Sin titulo';

<<<<<<< HEAD
  @Input('labels') doughnutChartLabels: Label[] = ['Label1', 'Label2', 'Label2'];
  @Input('data') doughnutChartData: MultiDataSet = [
    [350, 450, 100],
  ];

  public colors: Color[] = [
    { backgroundColor: [ '#6857E6','#009FEE','#F02059' ] }
  ];
=======
  // @Input('labels') doughnutChartLabels: Label[] = ['Label1', 'Label2', 'Label2'];
  // @Input('data') doughnutChartData: MultiDataSet = [
  //   [350, 450, 100],
  // ];

  // public colors: Color[] = [
  //   { backgroundColor: [ '#6857E6','#009FEE','#F02059' ] }
  // ];
>>>>>>> a97120ffbfe32daaf50fcca799116113ed1f84a9

}
