import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatAccordion } from '@angular/material';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of, OperatorFunction } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';
import { functionsUtils } from 'src/app/core/utils/functionsUtils';
import { QueryPatient } from '../../agendamiento/query-patient.service';
import { ValidatorsService } from '../../ajustes/informacion-base/services/reactive-validation/validators.service';
import { SwalService } from '../../ajustes/informacion-base/services/swal.service';
import { LaboratoryService } from './laboratory.service';
import { Patient } from 'src/app/core/models/patient.model';

@Component({
  selector: 'undefined-laboratory',
  templateUrl: './laboratory.component.html',
  styleUrls: ['./laboratory.component.css'],
})
export class LaboratoryComponent implements OnInit {
  @ViewChild('firstAccordion') firstAccordion: MatAccordion;
  @ViewChild('secondAccordion') secondAccordion: MatAccordion;
  matPanel = false;
  openClose() {
    if (this.matPanel == false) {
      this.firstAccordion.openAll();
      this.matPanel = true;
    } else {
      this.firstAccordion.closeAll();
      this.matPanel = false;
    }
  }
  matPanel2 = false;
  openClose2() {
    if (this.matPanel2 == false) {
      this.secondAccordion.openAll();
      this.matPanel2 = true;
    } else {
      this.secondAccordion.closeAll();
      this.matPanel2 = false;
    }
  }
  @ViewChild('fileInput') fileInput: ElementRef;
  datePipe = new DatePipe('es-CO');
  today = new Date().toTimeString().slice(0, 5);
  date: { year: number; month: number };
  formTomarExamen: FormGroup;
  formAnular: FormGroup;
  formCargar: FormGroup;
  formSearch: FormGroup;
  laboratorios: any[] = [];
  pagination: any = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
  };
  filtros: any = {
    fecha: '',
    paciente: '',
    eps: '',
    ciudad: '',
    estado: ''
  };
  loading: boolean;
  fileString: any = '';
  type: any = '';
  file: any = '';
  closeResult = '';
  motivos: any[] = [];
  public existPtientForShow: boolean = false;
  public patient;
  public getDate;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private _laboratory: LaboratoryService,
    private _swal: SwalService,
    private _validatorsService: ValidatorsService,
    private _queryPatient: QueryPatient
  ) { }
  ngOnInit() {
    this.getLaboratories();
    this.getMotivos();
  }

  validarHora(e) {
    let h1 = e.target.value.split(':');
    let h2: any = this.today.split(':');
    let date = new Date(0, 0, 0, h1[0], h1[1], 0);
    let date2 = new Date(0, 0, 0, h2[0], h2[1], 0);
    if (
      date.getTime() > date2.getTime() ||
      date.getTime() - date2.getTime() < -3600000
    ) {
      this._swal.show({
        icon: 'error',
        title: 'Error en la hora',
        showCancel: false,
        text: 'Puedes seleccionar máximo una hora antes y no puedes elegir una hora futura',
      });
      this.today = new Date().toTimeString().slice(0, 5);
      this.formTomarExamen.controls['hour'].setValue(this.today);
    }
  }

  newCall(form) {
    this._laboratory.newCall(form).subscribe((req: any) => {
      if (req.code == 200) {
        let data = req.data;
        if (req.data.isNew) {
          data = this.newPatient(data, req);
        }
        this.patient = data;
        this._queryPatient.patient.next(data);
        this.existPtientForShow = true;
        clearInterval(this.getDate);
      }
    });
  }

  newPatient(data, req) {
    data.paciente = new Patient();
    data.paciente.identifier = req.data.llamada.Identificacion_Paciente;
    data.paciente.isNew = true;
    return data;
  }

  getMotivos() {
    this._laboratory.getMotivos().subscribe((res: any) => {
      this.motivos = res.data;
    });
  }

  createFormTomarExamen(id) {
    this.today = new Date().toTimeString().slice(0, 5);
    this.formTomarExamen = this.fb.group({
      id: [id],
      hour: [this.today, this._validatorsService.required],
      status: [],
    });
  }

  createFormAnular(id) {
    this.formAnular = this.fb.group({
      id: [id],
      motivo_id: ['', this._validatorsService.required],
      observations: ['', this._validatorsService.required],
      status: [],
    });
  }

  tomar() {
    this.formTomarExamen.get('status').setValue('Tomado');
    this._laboratory
      .tomarOAnular(this.formTomarExamen.value)
      .subscribe((res: any) => {
        this.modalService.dismissAll();
        this.getLaboratories();
        this._swal.show({
          icon: 'success',
          title: 'Tomado con éxito',
          showCancel: false,
          text: '',
        });
      });
  }

  onFileChanged(event) {
    if (event.target.files[0]) {
      let file = event.target.files[0];
      const types = ['application/pdf'];
      if (!types.includes(file.type)) {
        this._swal.show({
          icon: 'error',
          title: 'Error de archivo',
          showCancel: false,
          text: 'El tipo de archivo no es válido',
        });
        this.formCargar.reset();
      } else {
        var reader = new FileReader();
        reader.readAsDataURL(event.target.files[0]);
        reader.onload = (event) => {
          this.fileString = (<FileReader>event.target).result;
          const type = { ext: this.fileString };
          this.type = type.ext.match(/[^:/]\w+(?=;|,)/)[0];
        };
        functionsUtils.fileToBase64(file).subscribe((base64) => {
          this.file = base64;
        });
      }
    }
  }
  donwloading: boolean
  getReport() {
    this.donwloading = true;
    this._laboratory.getReport()
      .subscribe((response: BlobPart) => {
        let blob = new Blob([response], { type: 'application/excel' });
        let link = document.createElement("a");
        const filename = 'reporte-dia';
        link.href = window.URL.createObjectURL(blob);
        link.download = `${filename}.xlsx`;
        link.click();
      }),
      error => { console.log('Error downloading the file'); this.loading = false },
      () => { console.info('File downloaded successfully'); this.loading = false };
  }

  cambiarEstado() {
    let date = new Date().toISOString();
    this.formAnular.get('status').setValue('Anulado');
    this._laboratory
      .tomarOAnular(this.formAnular.value)
      .subscribe((res: any) => {
        this.modalService.dismissAll();
        this.getLaboratories();
        this._swal.show({
          icon: 'success',
          title: 'Anulado con éxito',
          showCancel: false,
          text: '',
        });
      });
  }

  cupsId: any[] = [];
  loadingCforL: boolean = false;
  idCup: any
  getCupsId(id) {
    this.idCup = id
    this.loadingCforL = true;
    this._laboratory.getCupsId(id).subscribe((res: any) => {
      this.cupsId = res.data;
      this.loadingCforL = false;
    });
  }

  createFormCargar() {
    this.formCargar = this.fb.group({
      ids: ['', this._validatorsService.required],
      file: [''],
      status: ['Subido'],
      fileupload: ['', this._validatorsService.required],
    });
  }

  public openConfirm(confirm, size) {
    this.modalService
      .open(confirm, {
        ariaLabelledBy: 'modal-basic-title',
        size: size,
        scrollable: true,
      })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }
  private getDismissReason(reason: any) {
    if (this.formTomarExamen) {
      this.formTomarExamen.reset();
    }
    if (this.formAnular) {
      this.formAnular.reset();
    }
    if (this.formCargar) {
      this.formCargar.reset();
      this.file = '';
    }
    this.cupsId = [];
  }

  selectedDate(fecha) {

    this.filtros.fecha =
      this.datePipe.transform(fecha.value.begin._d, 'yyyy-MM-dd') +
      'a' +
      this.datePipe.transform(fecha.value.end._d, 'yyyy-MM-dd');
    console.log(this.filtros.fecha)
    this.getLaboratories();
  }
  mail: any = 'a@a.com';
  enviarCorreo(mail) {
    this.mail = mail;

  }

  getLaboratories(page = 1) {
    this.pagination.page = page;
    let params = {
      ...this.pagination,
      ...this.filtros,
    };
    this.loading = true;
    this._laboratory.getLaboratories(params).subscribe((res: any) => {
      this.laboratorios = res.data.data;
      this.laboratorios.map((laboratory: any[]) => {
        laboratory['files'] = 'Completo';
        laboratory['cup'].map((cup: any) => {
          if (cup['state'] == 'Pendiente') {
            laboratory['files'] = 'Incompleto';
          }
        });
        //console.log(laboratory);
      });

      this.loading = false;
      this.pagination.collectionSize = res.data.total;
    });
  }

  cargarDocumento() {
    let file = this.fileString;
    let type = this.type;
    this.formCargar.patchValue({
      file,
      type,
    });
    this.formCargar.get('ids') as FormArray;
    this._laboratory
      .cargarDocumento(this.formCargar.value)
      .subscribe((res: any) => {
        this.modalService.dismissAll();
        this.getLaboratories();
        this._swal.show({
          icon: 'success',
          title: 'Documento agregado con éxito',
          showCancel: false,
          text: '',
          timer: 1000,
        });
      });
  }

  download(id) {
    this._laboratory.download(id).subscribe((res: any) => {
      var fili = res.data + res.code;
      let pdfWindow = window.open('');
      pdfWindow.document.write(
        "<iframe width='100%' height='100%' src='data:application/pdf;base64, " +
        encodeURI(res.code) +
        "'></iframe>"
      );
    });
  }

  deleteDocument(id) {
    this._laboratory.deleteDocument(id).subscribe((res:any) => {
      this.getCupsId(this.idCup)
      this.getLaboratories()
    })
  }
}
