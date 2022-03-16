import { NgModule } from '@angular/core';

import { MyDateRangePickerModule } from 'mydaterangepicker';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ComponentsModule } from '../../components/components.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

import {
  NgbModalModule,
  NgbPaginationModule,
  NgbTypeaheadModule,
  NgbDropdownModule,
} from '@ng-bootstrap/ng-bootstrap';
import { InventarioRoutingModule } from './inventario-routing.module';
import { InventarioComponent } from './inventario/inventario.component';
import { HttpClientModule } from '@angular/common/http';
import { InventarioFisicoComponent } from './inventario-fisico/inventario-fisico.component';
import {
  ModalAlert,
  ModalformComponent,
} from './inventario-fisico/modalform/modalform.component';
import { ModaldataInitComponent } from './inventario-fisico/modaldata-init/modaldata-init.component';
import { ActaRecepcionComponent } from './acta-recepcion/acta-recepcion.component';
import { CrearActaRecepcionComponent } from './acta-recepcion/crear-acta-recepcion/crear-acta-recepcion.component';
import { ActaRecepionAprobadosComponent } from './acta-recepion-aprobados/acta-recepion-aprobados.component';
import { AcomodarActaComponent } from './acta-recepion-aprobados/acomodar-acta/acomodar-acta.component';
import { PipesModule } from '../../core/pipes/pipes.module';
import { VerActaRecepcionComponent } from './acta-recepcion/ver-acta-recepcion/ver-acta-recepcion.component';
import { InventarioVencerComponent } from './inventario-vencer/inventario-vencer.component';
import { AlistamientoComponent } from './alistamiento/alistamiento.component';
import { AlistamientoCrearComponent } from './alistamiento/alistamiento-crear/alistamiento-crear.component';
import { ArchwizardModule } from 'angular-archwizard';
import { InventarioEstibasComponent } from './inventario-fisico/inventario-estibas/inventario-estibas.component';
import { AjustarDocumentosComponent } from './inventario-fisico/ajustar-documentos/ajustar-documentos.component';
import { InventarioEstibaComponent } from './inventario-fisico/inventario-estiba/inventario-estiba.component';
import { ReconteoEstibaComponent } from './inventario-fisico/reconteo-estiba/reconteo-estiba.component';
import { ListadoproductosyainventariadosestibaComponent } from './inventario-fisico/listadoproductosyainventariadosestiba/listadoproductosyainventariadosestiba.component';
import { VerInventarioComponent } from './inventario-fisico/ver-inventario/ver-inventario.component';

@NgModule({
  declarations: [
    ModalAlert,
    ModalformComponent,
    ModaldataInitComponent,
    InventarioComponent,
    InventarioFisicoComponent,
    ActaRecepcionComponent,
    CrearActaRecepcionComponent,
    ActaRecepionAprobadosComponent,
    AcomodarActaComponent,
    VerActaRecepcionComponent,
    InventarioVencerComponent,
    AlistamientoComponent,
    AlistamientoCrearComponent,
    InventarioEstibasComponent,
    InventarioEstibaComponent,
    AjustarDocumentosComponent,
    ReconteoEstibaComponent,
    ListadoproductosyainventariadosestibaComponent,
    VerInventarioComponent

  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    InventarioRoutingModule,
    ComponentsModule,
    MyDateRangePickerModule,
    NgbTypeaheadModule,
    SweetAlert2Module.forRoot(),
    NgbPaginationModule,
    NgbModalModule,
    NgbDropdownModule,
    PipesModule,
    ArchwizardModule,
    SweetAlert2Module.forRoot(),

  ],
  providers:[]
})
export class InventarioModule {}
