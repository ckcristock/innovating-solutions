import { Component, OnInit, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ListaTrabajoService } from './lista-trabajo.service';
import { OpenAgendaService } from '../open-agenda.service';

@Component({
  selector: 'app-agendas',
  templateUrl: './agendas.component.html',
  styleUrls: ['./agendas.component.scss']
})
export class AgendasComponent implements OnInit {
  statData: any
  showDeitalStat = new EventEmitter<any>()
  loading = false;

  pagination = {
    pageSize: 15,
    page: 1,
    collectionSize: 0,
  }
  filters: any = {
    appointmentId: '',
    subappointmentId: '',
    speciality: '',
    person: '',
    ipsId: '',
    sede: '',

  }
  searching = false;
  searchFailed = false;
  agendas = []



  public appointment = {
    value: "",
    text: "",
    brand: "",
    face_to_face: ""
  }
  public subappointment = {
    value: "",
    text: "",
    company_owner: "",
    procedure: ""
  }
  public ips = {
    value: "",
    text: ""
  }



  public sedes = []
  public specialties = []
  public persons = []

  public ipss = []


  type_appointments: any = []
  type_subappointments: any = []

  constructor(private route: Router, private _workList: ListaTrabajoService, private _openAgendaService: OpenAgendaService) {
    this.getAgendamientos(1)
    this.getTypeAppointment()

  }
  getStatics(params) {
    this._workList.getStatistics(params).subscribe(r => {
      this.statData = r.data
    })
  }

  getTypeAppointment() {
    this._openAgendaService.getTypeAppointment('').subscribe((resp: any) => {
      this.type_appointments = resp.data;
    });
  }

  getSubTypeAppointment() {
    this.filters.subappointmentId = ''
    this.filters.ipsId = '',
    this.filters.sede = '',
    this.filters.person = ''
    this.appointment = this.searchAppointment(this.type_appointments, this.filters.appointmentId);
    this._openAgendaService.getSubTypeAppointment(this.appointment.value).subscribe((resp: any) => {
      this.type_subappointments = resp.data;
      this.filters.subappointmentId = this.type_subappointments[0].value
      this.getSpecialties()
      
      if (this.appointment.face_to_face) {
        this.getIps()
      } else {

        this.getSpecialties()
      }
    });

  }


  getIps() {
    /*     this.filters.sede= '', */
    this.subappointment = this.searchItem(this.type_subappointments, this.filters.subappointmentId);
    this._openAgendaService.getIps(this.subappointment.company_owner).subscribe((resp: any) => {
      this.ipss = resp.data;
    });
  }

  getSedes() {
    this.ips = this.searchItem(this.ipss, this.filters.ipsId);
    this._openAgendaService.getSedes(this.ips.value, this.subappointment.procedure).subscribe((resp: any) => {
      this.sedes = resp.data;
    });
  }

  getSpecialties() {
    this._openAgendaService.getSpecialties(String(this.filters.sede), this.subappointment.procedure).subscribe((resp: any) => {
      this.specialties = resp.data;
    });
  }

  getProfesionals() {
    this._openAgendaService.getProfesionals(this.ips.value, String(this.filters.speciality)).subscribe((resp: any) => {
      this.persons = resp.data;
    });
  }


  searchItem(data, value) {
    return data.find((item) => item.value === value);
  }



  searchAppointment(data, value) {
    return data.find((item) => item.value === value);
  }

  getAgendamientos(page) {
    //get http
    this.loading = true;
    this.pagination.page = page;
    let params: any = Object.assign({}, this.pagination, this.filters);;
    
    this.getStatics(this.filters);
    this._workList.getAgendamientos(params).subscribe(d => {
      this.pagination.collectionSize = d.total;
      this.agendas = d.data
      this.loading = false;
      
    })

  }
  ngOnInit(): void {
  }

  searchDetailStat(stat) {

    let params: any = this.filters;
    params.status = stat.status;

    this.showDeitalStat.emit(params)
   

  }
}
