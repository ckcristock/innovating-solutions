import { Component, OnInit, ViewChild } from '@angular/core';
import { Response } from 'src/app/core/response.model';
import { EpssService } from '../../services/epss.service';
// import { forkJoin, Observable, of, OperatorFunction } from 'rxjs';
// import { catchError, debounceTime, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators';
import { DataDinamicService } from 'src/app/data-dinamic.service';
import { NgForm, ValidatorFn, FormControl, FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { OpenAgendaService } from 'src/app/pages/agendamiento/open-agenda.service';

import { Observable, of, OperatorFunction, Subscription } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { WarningMessage, showConfirmCancelWhitoutMessage, errorMessage, successMessage } from 'src/app/core/utils/confirmMessage';
import { ActivatedRoute, Router } from '@angular/router';
import { SwalService } from '../../services/swal.service';
import { TiposervicioService } from '../../services/tiposervicio/tiposervicio.service';



@Component({
  selector: 'app-crear-contratos',
  templateUrl: './crear-contratos.component.html',
  styleUrls: ['./crear-contratos.component.scss']
})
export class CrearContratosComponent implements OnInit {
  @ViewChild('confirmacionSwal') confirmacionSwal: any;
  dataForm: FormGroup;
  numberRegEx = /^(0|\-?[1-9][0-9]*)$/;
  regexp = /^\d+\.\d{0,2}$/;

  public start_date: any;
  public end_date: any;
  public administrators: Array<object> = [];
  public departments: Array<object> = [];
  public priceList: Array<object> = [];
  public paymentMethods: Array<object> = [];
  public benefitsPlan: Array<object> = [];
  public locations: Array<object> = [];
  public regimes: Array<object> = [];
  public companys: Array<object> = [];
  public specialities: Array<object> = [];
  public typeService: Array<object> = [];
  public municipalities: Array<object> = [];
  public technicalNotes: Array<object> = [];
  public years: Array<any> = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];
  public year: number = 2019;
  public Policies: Array<object> = [{}];
  public id: any = null;

  public centrosDeCosto: Array<object> = [];
  public routes: Array<object> = [
    { value: 1, text: 'prueba' }
  ];

  public model: any;
  private subscription = new Subscription();
  public searchingProcedure: boolean;
  public searchFailedProcedure: boolean;
  public namecupmodel: any;

  constructor(
    private fb: FormBuilder,
    private frmbuilder: FormBuilder,
    private _epsService: EpssService,
    private _dataDinamicService: DataDinamicService,
    private _openAgendaService: OpenAgendaService,
    private router: Router,
    private route: ActivatedRoute,
    private _swal: SwalService,
    private _typeService: TiposervicioService,
  ) { }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.getAllData();
    this.createForm();
    this.locations.unshift({ text: 'Seleccione', value: '' })
    this.dataForm.get('company_id').valueChanges.subscribe(change => {
      this.getLocations(change);
    });
    this.dataForm.get('department_id').valueChanges.subscribe(change => {
      this.getMunicipalities(change);
    });
    if (this.id) {
      this.getData();
    }
  }

  getData() {
    this._epsService.getInfoEpsContract(this.id).subscribe((data: Response) => {
      this.Policies = data.data.policies;
      this.dataForm.patchValue(
        {
          id: this.id,
          name: data.data.name,
          code: data.data.code,
          number: data.data.number,
          //Revisar
          payment_method_id: data.data.payment_method_id,
          /************************ */
          administrator_id: data.data.administrator_id,
          price: data.data.price,
          start_date: data.data.start_date,
          end_date: data.data.end_date,
          department_id: this.transformData(data.data.departments),
          municipality_id: this.transformData2(data.data.municipalities),
          regimen_id: this.transformData2(data.data.regimentypes),
          location_id: this.transformData2(data.data.locations),
          type_service_id: this.transformData2(data.data.type_service),
          company_id: data.data.company_id,
          poliza: this.fillPolicies(data.data.policies),
          technicalNote: this.fillTechnicalNotes(data.data.technic_notes)
          //company_id: this.transformData(data.data.companies),
        }
      );
      data.data.type_service.forEach(element => {
        this.centrosDeCosto.push({value: element.id, text: element.name})
      });
    })
  }

  transformData = (array: Array<object>): any => array.map(({ ...obj }) => obj['department_id'])
  transformData2 = (array: Array<object>): any => array.map(({ ...obj }) => obj['id'])

  getAllData = async () => {
    await this.getDepartments();
    this.getAdministrators()
    this.getPriceList()
    this.getPaymentMethod()
    this.getBenefitsPlan()
    this.getRegimes()
    this.getTypeServices();
    await this.getCompanies()
  }

  getTypeServices() {
    this._typeService.getTypes({ is_service: 'Y' }).subscribe((res: Response) => {
      this.typeService = res.data
    })
  }

  getAdministrators = () => {
    this._epsService.getAllEps().subscribe((resp: Response) => {
      this.administrators = resp.data
    })
  }

  getDepartments = async () => {
    await this._dataDinamicService.getDepartments().toPromise().then((req: any) => {
      this.departments = req.data
      this.departments.unshift({ text: 'Todos', value: 'todos' })
    })
  }

  getMunicipalities = async (change) => {
    this.dataForm.get('municipality_id').reset()
    let parm = { department_id: [change] }
    await this._dataDinamicService.getCities(parm).toPromise().then((req: any) => {
      this.municipalities = req.data
      this.municipalities.push({ text: 'Todos', value: 'todos' })
    })
  }

  getPriceList = () => {
    this._dataDinamicService.getPriceList().subscribe((req: any) => {
      this.priceList = req.data
      this.priceList.unshift({ text: 'Anexo', value: '1' })
      this.priceList.unshift({ text: 'Seleccione', value: '' })
    })
  }

  getPaymentMethod = () => {
    this._dataDinamicService.getPaymentMethod().subscribe((req: any) => {
      this.paymentMethods = req.data
      this.paymentMethods.unshift({ text: 'Consignación', value: '1' })
      this.paymentMethods.unshift({ text: 'Seleccione', value: '' })
    })
  }

  getBenefitsPlan() {
    this._dataDinamicService.getBenefitsPlan().subscribe((req: any) => {
      this.benefitsPlan = req.data
      this.benefitsPlan.unshift({ text: 'Anexo planes', value: '1' })
      this.benefitsPlan.unshift({ text: 'Seleccione', value: '' })
    })
  }

  getRegimes() {
    this._dataDinamicService.getRegimens().subscribe((req: any) => {
      this.regimes = req.data
    })
  }
  getCompanies = async () => {
    await this._dataDinamicService.getCompanies().toPromise().then((req: any) => {
      this.companys = req.data
      this.companys.unshift({ text: 'Seleccione', value: '' })
    })
  }

  getLocations = (change) => {
    this._dataDinamicService.getLocations(change).subscribe((req: any) => {
      this.locations = req.data
      this.locations.unshift({ text: 'Seleccione', value: '' })
    })
  }

  private dateRangeValidator: ValidatorFn = (): {
    [key: string]: any;
  } | null => {
    let invalid = false;
    const from = this.dataForm && this.dataForm.get("start_date").value;
    const to = this.dataForm && this.dataForm.get("end_date").value;
    if (from && to) {
      invalid = new Date(from).valueOf() > new Date(to).valueOf();
    }
    return invalid ? { invalidRange: { from, to } } : null;
  };



  deleteTaxi(i) {
    this.technicalNoteList.removeAt(this.technicalNoteList.length - 1);
  }

  deletePoliza(i) {
    this.polizaList.removeAt(this.polizaList.length - 1);
  }
  subItemsToDelete: Array<number> = [];

  deleteCups(item: FormGroup, i: number) {
    console.log(item)
    let cups = item.get('cups') as FormArray
    cups.removeAt(i)
  }

  /*********************************************************************************************************************/

  fillPolicies = (policies) => {
    policies.forEach(element => {
      this.newPolizaUpdate(element)
    })
  }

  newPoliza() {
    let list = this.polizaList;
    list.push(this.getPoliza());
  }

  newPolizaUpdate(data) {
    let list = this.polizaList;
    list.push(this.getPolizaUpdate(data));
  }

  getPolizaUpdate(data): FormGroup {
    let group = this.createPolizaGroupUpdate(this.fb, data);
    return group;
  }

  createPolizaGroupUpdate(fb: FormBuilder, data) {
    let group = fb.group(
      {
        codigopoliza: [data.code, Validators.required],
        iniciopoliza: [data.start, Validators.required],
        finpoliza: [data.end, Validators.required],
        nombrepoliza: [data.name, Validators.required],
        coberturapoliza: [data.coverage, Validators.required]
      });
    return group;
  }

  /********************************************************************************************************************* */
  newtechnicalNote() {
    let list = this.technicalNoteList;
    list.push(this.getTechnicalNoteControl());
  }

  fillTechnicalNotes = (technic_notes) => {
    technic_notes.forEach((element, i) => {
      this.newtechnicalNoteUpdate(element, i)
    })
  }

  newtechnicalNoteUpdate(data, i) {
    let list = this.technicalNoteList;
    let node = this.getTechnicalNoteControlUpdate(data)
    list.push(node);
    this.fillCups(node, data, i)
  }

  getTechnicalNoteControlUpdate(data): FormGroup {
    let group = this.createGroupUpdate(this.fb, data);
    return group;
  }

  createGroupUpdate(fb: FormBuilder, data) {
    let bool = (data.is_active) ? true : false
    let group = fb.group(
      {
        techn_note_date_init: [data.start, Validators.required],
        techn_note_date_end: [data.end, Validators.required],
        techn_note_year_cups: [Number(data.anio), Validators.required],
        is_default: [bool],
        cups: this.frmbuilder.array([], Validators.required)

      }
    );
    return group;
  }
  /********************************************************************************************************************* */

  newCups(item: FormGroup) {
    let cups = item.get('cups') as FormArray
    cups.push(this.getCupsControl());
  }

  fillCups = (node, data, i) => {
    data.services.forEach(element => {
      let cups = node.get('cups') as FormArray
      cups.push(this.getCupsControlUpdate(element));
    });
  }

  getCupsControlUpdate(data): FormGroup {
    let group = this.createCupsGroupUpdate(this.fb, data);
    return group;
  }


  createCupsGroupUpdate(fb: FormBuilder, data) {
    let group = fb.group(
      {
        namec: data.cup,
        valor: [data.value, Validators.required],
        speciality_id: data.speciality_id,
        specialityList: [data.cup.specialities],
        centro_costo_id: [data.centro_costo_id, Validators.required],
        route_id: [data.route],
        frequency: [Number(data.frequency), Validators.required]
      }
    );
    if(group.controls.centro_costo_id.value != 5){
      group.controls.route_id.disable()
    }
    group.controls.centro_costo_id.valueChanges.subscribe(r => {
      if (r == 5){
        group.controls.route_id.enable()
      } else {
        group.controls.route_id.disable()
      }
    })
    group.get('namec').valueChanges.subscribe((term) => {
      this.year = group.parent.parent.get('techn_note_year_cups').value
      if (term.value) {
        this.getSpecialities(term.value, group);
      }
    })

    return group;
  }

  /********************************************************************************************************************* */


  getPoliza(): FormGroup {
    let group = this.createPolizaGroup(this.fb);
    return group;
  }

  getTechnicalNoteControl(): FormGroup {
    let group = this.createGroup(this.fb);
    return group;
  }

  getCupsControl(): FormGroup {
    let group = this.createCupsGroup(this.fb);
    return group;
  }

  get technicalNoteList() {
    return this.dataForm.get('technicalNote') as FormArray;
  }

  get polizaList() {
    return this.dataForm.get('poliza') as FormArray;
  }

  get cupsList() {
    return this.dataForm.get('technicalNote') as FormArray;
  }

  GuardarContrato(dataForm: NgForm) {
    let count = 0;
    const controlparent = <FormArray>this.dataForm.get('technicalNote');
    for (let index = 0; index < controlparent.length; index++) {
      let firt = <FormGroup>controlparent.controls[index]
      if (firt.get('is_default').value) count++
    }

    if (count == 0 || count >= 2) {
      this._swal.show({
        icon: 'error',
        title: 'Operación denegada',
        showCancel: false,
        text: 'Debes seleccionar una nota técnica.',
      })
      return false
    }
    this._swal.show({
      icon: 'question',
      title: '¿Estás seguro(a)?',
      showCancel: true,
      text: ''
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.subscription.add(
          this._epsService.createNewEpsContact(this.dataForm.value)
            .subscribe((res: Response) => {
              if (res.code === 200) {
                this._swal.show({
                  icon: 'success',
                  title: res.data,
                  showCancel: false,
                  text: '',
                  timer: 1000
                })
                this.router.navigateByUrl('/ajustes/informacion-base/contracts');
              }
              else {
                errorMessage(res.err)
              }
            })
        )
      }
    })
  }

  search: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.searchingProcedure = true),
      switchMap(term => term.length < 3 ? [] :
        this._openAgendaService.searchProcedureByYear(term, this.year).pipe(
          tap(() => this.searchFailedProcedure = false),
          catchError(() => {
            this.searchFailedProcedure = true;
            return of([]);
          }))
      ),
      tap(() => {
        return this.searchingProcedure = false
      })
    )

  InputProcedure = (x: { text: string }) => x.text;


  getSpecialities(a, group: FormGroup) {
    this._dataDinamicService.getSpecialtiesByProcedure(a).subscribe((req: any) => {
      this.specialities = req
      group.patchValue({
        specialityList: req
      })
    })

  }


  createForm() {

    this.dataForm = this.frmbuilder.group({
      id: [null],
      name: ['', Validators.required],
      code: ['', Validators.required],
      number: ['', [Validators.required]],
      //payment_modality: [[], /* [Validators.required] */],
      administrator_id: [, [Validators.required]],
      regimen_id: ['', [Validators.required]],
      price: ['', [Validators.required]],
      start_date: ['', [Validators.required, this.dateRangeValidator]],
      end_date: ['', [Validators.required, this.dateRangeValidator]],
      department_id: ['', [Validators.required]],
      municipality_id: ['', [Validators.required]],
      company_id: ['', [Validators.required]],
      location_id: [[], [Validators.required]],
      type_service_id: [[], [Validators.required]],
      poliza: this.frmbuilder.array([], Validators.required),
      technicalNote: this.frmbuilder.array([], /* Validators.required */),
      // contract_type: ['', Validators.required],
      payment_method_id: ['', [Validators.required]],
      // benefits_plan_id: ['', [Validators.required]],
      // variation: ['', [Validators.required, Validators.pattern(this.regexp)]],
      // price_list_id: ['', [Validators.required]],
    });

    this.dataForm.controls.type_service_id.valueChanges.subscribe(r => {
      this.centrosDeCosto = []
      r.forEach(id => {
        this.typeService.forEach((element: any) => {
          if (id == element.value) {
            this.centrosDeCosto.push(element)
          }
        });
      });
    })
  }

  createCupsGroup(fb: FormBuilder) {
    let group = fb.group(
      {
        namec: ['', Validators.required],
        // codec: ['', Validators.required],x
        valor: ['', Validators.required],
        // speciality: ['', Validators.required],
        speciality_id: [],
        specialityList: [[]],
        // performance: ['', Validators.required],
        // capacity: ['', Validators.required],
        centro_costo_id: ['', Validators.required],
        route_id: [{value:'', disabled: true}],
        // resource: ['', Validators.required],
        frequency: ['', Validators.required]
      }
    );
    group.controls.centro_costo_id.valueChanges.subscribe(r => {
      if (r == 5){
        group.controls.route_id.enable()
      } else {
        group.controls.route_id.disable()
      }
    })
    group.get('namec').valueChanges.subscribe((term) => {
      this.year = group.parent.parent.get('techn_note_year_cups').value
      if (term.value) {
        this.getSpecialities(term.value, group);
      }
    })

    return group;
  }



  createPolizaGroup(fb: FormBuilder) {
    let group = fb.group(
      {
        codigopoliza: ['', Validators.required],
        iniciopoliza: ['', Validators.required],
        finpoliza: ['', Validators.required],
        nombrepoliza: ['', Validators.required],
        coberturapoliza: ['', Validators.required]
      });
    return group;
  }

  createGroup(fb: FormBuilder) {
    let group = fb.group(
      {
        techn_note_date_init: ['', Validators.required],
        techn_note_date_end: ['', Validators.required],
        techn_note_year_cups: [2022, Validators.required],
        is_default: [false],
        cups: this.frmbuilder.array([], Validators.required)
      }
    );
    return group;
  }

}







