import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'

<<<<<<< HEAD
import { ChartsModule } from 'ng2-charts';
=======
//import { ChartsModule } from 'ng2-charts';
>>>>>>> a97120ffbfe32daaf50fcca799116113ed1f84a9

import { IncrementadorComponent } from './incrementador/incrementador.component';
import { DonaComponent } from './dona/dona.component';
import { EstadisticaEmitidosComponent } from './pages/estadistica-emitidos/estadistica-emitidos.component';
import { EstadisticaUnidadComponent } from './pages/estadistica-unidad/estadistica-unidad.component';
import { EstadisticaUnidadPenalidadComponent } from './pages/estadistica-unidad-penalidad/estadistica-unidad-penalidad.component';
import { EstadisticaServiciosComponent } from './pages/estadistica-servicios/estadistica-servicios.component';
import { FacturacionComponent } from './pages/facturacion/facturacion.component';
import { RepoorteCargaComponent } from './pages/repoorte-carga/repoorte-carga.component';
import { ReporteGestionComponent } from './pages/reporte-gestion/reporte-gestion.component';



@NgModule({
  declarations: [
    IncrementadorComponent,
    DonaComponent,
    EstadisticaEmitidosComponent,
    EstadisticaUnidadComponent,
    EstadisticaUnidadPenalidadComponent,
    EstadisticaServiciosComponent,
    FacturacionComponent,
    RepoorteCargaComponent,
    ReporteGestionComponent
  ],
  exports: [
    IncrementadorComponent,
    DonaComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
<<<<<<< HEAD
    ChartsModule
=======
    //ChartsModule
>>>>>>> a97120ffbfe32daaf50fcca799116113ed1f84a9
  ]
})
export class ComponentsModule { }
