import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { Aprobador } from '../pages/mantenimientos/aprobadores/aprobador';
import { environment } from '../../environments/environment.prod';
import { UsuarioService } from './usuario.service';
import swal from 'sweetalert2';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})

export class AprobadorService {
  private aprobador: Aprobador;
  private token: string;
  private httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });



  constructor(private http: HttpClient,
    private router: Router,
    private usuarioService: UsuarioService) { }

  private agregarAuthorizationHeader() {
    let token = this.usuarioService.token;
    //console.log('Token agregarAuthorizationHeader :   '+token);
    if (token != null) {
      return this.httpHeaders.append('Authorization', 'Bearer ' + token);
    }
    return this.httpHeaders;
  }

  private isNoAutorizado(e): boolean {
    if (e.status == 401) {
      this.router.navigate(['/login']);
      return true;
    }

    if (e.status == 403) {
      swal.fire('Acceso denegado', 'Hola no tienes acceso a este recurso!', 'warning');  //${this.authService.usuario.username}
      this.router.navigate(['/aprobadores']);
      return true;
    }
    return true;
  }

  //desde: number = 0
  cargarAprobadores(): Observable<any> {
    let accessToken;
    accessToken = sessionStorage.getItem('token')
    let payload = this.usuarioService.obtenerDatosToken(accessToken);
    let co_cia = payload.co_cia;
    let co_tip_maestro = payload.co_tip_maestro;
    let co_maestro = payload.co_maestro;

    //   console.log(`${base_url}/aprobadores/lista/${co_cia}/${co_tip_maestro}/${co_maestro}/${desde}`);
    //return this.http.get(`${base_url}/aprobadores/lista/${co_cia}/${co_tip_maestro}/${co_maestro}/${desde}`, { headers: this.agregarAuthorizationHeader() }).pipe(
    return this.http.get(`${base_url}/aprobadores/${co_cia}/${co_tip_maestro}/${co_maestro}`, { headers: this.agregarAuthorizationHeader() }).pipe(
      catchError(e => {
        this.isNoAutorizado(e);
        return throwError(e)
      }),
      map(response => {
        let aprobadores = response as Aprobador[];
        console.log(response);
        return aprobadores
      })
    );
  }


  getAprobador(co_aprobador): Observable<Aprobador> {
    let accessToken;
    accessToken = sessionStorage.getItem('token')
    let payload = this.usuarioService.obtenerDatosToken(accessToken);
    let co_cia = payload.co_cia;
    let co_tip_maestro = payload.co_tip_maestro;
    let co_maestro = payload.co_maestro;

    return this.http.get<Aprobador>(`${base_url}/aprobadores/${co_cia}/${co_tip_maestro}/${co_maestro}/${co_aprobador}`, { headers: this.agregarAuthorizationHeader() }).pipe(
      catchError(e => {
        if (this.isNoAutorizado(e)) {
          return throwError(e);
        }
        this.router.navigate(['/aprobadores']);
        console.error(e.error.mensaje);
        swal.fire('Error al editar', e.error.mensaje, 'error');
        return throwError(e);
      })
    );

  }


  //  addEditAprobador(postData: any, selectedPdt: any): Observable<any>{
  //   if (!selectedPdt) {
  //     let accessToken ;
  //     accessToken = sessionStorage.getItem('token')
  //     let payload = this.usuarioService.obtenerDatosToken(accessToken);
  //     let co_cia         = payload.co_cia ;
  //     let co_tip_maestro = payload.co_tip_maestro ;
  //     let co_maestro     = payload.co_maestro ;
  //     //return this.http.post('https://fakestoreapi.com/products', postData);
  //     return this.http.post(`${base_url}/aprobadores/${co_cia}/${co_tip_maestro}/${co_maestro}/${selectedPdt.co_aprobador}`,postData,{headers: this.agregarAuthorizationHeader()}).pipe(
  //       map((response:any) => response.aprobador as Aprobador),
  //       catchError(e => {
  //         if(this.isNoAutorizado(e)){
  //           return throwError(e);
  //         }
  //         if(e.status==400){
  //           return throwError(e);
  //         }
  //          swal.fire('Error al crear el aprobador',e.error.mensaje,'error');

  //         return throwError(e);
  //       })
  //     );
  //   } else {
  //     let accessToken ;
  //     accessToken = sessionStorage.getItem('token')
  //     let payload = this.usuarioService.obtenerDatosToken(accessToken);
  //     let co_cia         = payload.co_cia ;
  //     let co_tip_maestro = payload.co_tip_maestro ;
  //     let co_maestro     = payload.co_maestro ;
  //     return this.http.put(`${base_url}/aprobadores/${co_cia}/${co_tip_maestro}/${co_maestro}/${selectedPdt.co_aprobador}`,postData,{headers: this.agregarAuthorizationHeader()}).pipe(
  //       catchError(e => {
  //         if(this.isNoAutorizado(e)){
  //           return throwError(e);
  //         }

  //         if(e.status==400){
  //           return throwError(e);
  //         }
  //         //console.error(e.error.mensaje);
  //         swal.fire('Error al editar el aprobador',e.error.mensaje,'error');
  //         return throwError(e);
  //       })
  //     );
  //   }

  // }
  create(aprobador: Aprobador): Observable<any> {
    let accessToken;
    accessToken = sessionStorage.getItem('token')
    let payload = this.usuarioService.obtenerDatosToken(accessToken);
    let co_cia = payload.co_cia;
    let co_tip_maestro = payload.co_tip_maestro;
    let co_maestro = payload.co_maestro;

    return this.http.post(`${base_url}/aprobadores/${co_cia}/${co_tip_maestro}/${co_maestro}`, aprobador, { headers: this.agregarAuthorizationHeader() }).pipe(
      catchError(e => {
        if (this.isNoAutorizado(e)) {
          return throwError(e);
        }
        if (e.status == 400) {
          return throwError(e);
        }
        swal.fire('Error al crear el aprobador', e.error.mensaje, 'error');

        return throwError(e);
      })
    );
  }

  update(aprobador: Aprobador): Observable<any> {
    let accessToken;
    accessToken = sessionStorage.getItem('token')
    let payload = this.usuarioService.obtenerDatosToken(accessToken);
    let co_cia = '01';
    let co_tip_maestro = payload.co_tip_maestro;
    let co_maestro = payload.co_maestro;

    return this.http.put(`${base_url}/aprobadores/${co_cia}/${co_tip_maestro}/${co_maestro}/${aprobador.co_aprobador}`, aprobador, { headers: this.agregarAuthorizationHeader() }).pipe(
      catchError(e => {
        if (this.isNoAutorizado(e)) {
          return throwError(e);
        }

        if (e.status == 400) {
          return throwError(e);
        }
        //console.error(e.error.mensaje);
        swal.fire('Error al editar el aprobador', e.error.mensaje, 'error');
        return throwError(e);
      })
    );

  }


  save(aprobador: Aprobador): Observable<any> {
    let accessToken;
    accessToken = sessionStorage.getItem('token')
    let payload = this.usuarioService.obtenerDatosToken(accessToken);
    let co_cia = payload.co_cia;
    let co_tip_maestro = payload.co_tip_maestro;
    let co_maestro = payload.co_maestro;

    return this.http.post(`${base_url}/${co_cia}/${co_tip_maestro}/${co_maestro}`, aprobador, { headers: this.agregarAuthorizationHeader() }).pipe(
      map(response => {
        let aprobadores = response as Aprobador[];
        console.log(response);
        return aprobadores
      })
    );
  }


  deleteAprobador(co_aprobador: string): Observable<any> {
    let accessToken;
    accessToken = sessionStorage.getItem('token')
    let payload = this.usuarioService.obtenerDatosToken(accessToken);
    let co_cia = payload.co_cia;
    let co_tip_maestro = payload.co_tip_maestro;
    let co_maestro = payload.co_maestro;


    return this.http.delete(`${base_url}/aprobadores/${co_cia}/${co_tip_maestro}/${co_maestro}/${co_aprobador}`, { headers: this.agregarAuthorizationHeader() }).pipe(
      catchError(e => {
        if (this.isNoAutorizado(e)) {
          return throwError(e);
        }
        console.error(e.error.mensaje);
        swal.fire('Error al eliminar el aprobador', e.error.mensaje, 'error');
        return throwError(e);
      })
    );
  }

}

