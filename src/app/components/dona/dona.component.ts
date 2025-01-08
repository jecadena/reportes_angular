import { Component, Input } from '@angular/core';
import { ChartConfiguration, ChartOptions, ChartDataset, ChartType } from 'chart.js';

@Component({
  selector: 'app-dona',
  templateUrl: './dona.component.html',
  styles: [
  ]
})
export class DonaComponent {

  @Input() title: string = 'Sin titulo';

  @Input('labels') doughnutChartLabels: string[] = ['Label1', 'Label2', 'Label3'];
  @Input('data') doughnutChartData: number[][] = [
    [350, 450, 100],
  ];

  public colors: { backgroundColor: string[] }[] = [
    { backgroundColor: ['#6857E6', '#009FEE', '#F02059'] }
  ];

  // Opciones de configuración para el gráfico
  public chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return context.raw + ' units'; // Modificar si es necesario
          }
        }
      }
    }
  };

  public chartType: ChartType = 'doughnut';

}
