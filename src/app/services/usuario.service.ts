import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Usuario } from '../pages/usuarios/usuario';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { catchError, map, filter } from 'rxjs/operators';
import Swal from 'sweetalert2';

const base_url = environment.base_url ;

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private _usuario: Usuario;
  private _token: string;
  private httpHeaders = new HttpHeaders({'Content-Type':'application/json'});

  constructor(private http: HttpClient, private router: Router) { }

  private agregarAuthorizationHeader(){
    let token = this.token;
    console.log('Token agregarAuthorizationHeader :   '+token);
    if(token != null ){
      return this.httpHeaders.append('Authorization','Bearer '+token);
    }
    return this.httpHeaders;
  }


  private isNoAutorizado(e): boolean{
    if(e.status == 401){
      this.router.navigate(['/login']);
      return true;
      }

     if (e.status == 403){
        Swal.fire('Acceso denegado','Hola no tienes acceso a este recurso!','warning'); 
        this.router.navigate(['/']);
        return true;
     }

     return false;
  }

  public get usuario(): Usuario {
    if (this._usuario != null) {
      return this._usuario;
    } else if (this._usuario == null && sessionStorage.getItem('usuario') != null) {
      this._usuario = JSON.parse(sessionStorage.getItem('usuario')) as Usuario;
      return this._usuario;
    }
    return new Usuario();
  }

public get token(): string {
  if (this._token != null) {
    return this._token;
  } else if (this._token == null && sessionStorage.getItem('token') != null) {
    this._token = sessionStorage.getItem('token');
    return this._token;
  }
  return null;
}

login(usuario: Usuario): Observable<any> {
  const urlEndpoint = 'https://actoursapps.com.pe:8080/erequest/oauth/token';
  const credenciales = btoa('angularapp' + ':' + '12345');
  const httpHeaders = new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': 'Basic ' + credenciales
  });

  let params = new URLSearchParams();
  params.set('grant_type', 'password');
  params.set('username', usuario.de_email);
  params.set('password', usuario.de_password);
  console.log(params.toString());

  return this.http.post<any>(urlEndpoint, params.toString(), { headers: httpHeaders }).pipe(
    catchError(error => {
      if (error.status === 0) {
        Swal.fire({
          icon: 'error',
          title: 'Error de Conexión',
          text: 'No se pudo conectar con el servidor. Por favor, intente más tarde.',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error al intentar iniciar sesión. Por favor, intente nuevamente.',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      }
      return throwError(() => error);
    })
  );
}

  guardarUsuario(accessToken: string): void {
    let payload = this.obtenerDatosToken(accessToken);
    this._usuario = new Usuario();
    this._usuario.co_cia = payload.co_cia;
    this._usuario.co_tip_maestro = payload.co_tip_maestro;
    this._usuario.co_maestro = payload.co_maestro;
    this._usuario.co_solicitante = payload.co_solicitante;
    this._usuario.de_nom_solicitante = payload.de_nombre;
    this._usuario.de_pat_solicitante = payload.de_apellido;
    this._usuario.de_email = payload.user_name;
    this._usuario.roles = payload.authorities;
    if (payload.de_img == '' || payload.de_img == undefined) {
      this._usuario.de_img = 'no-img.jpg' ;
    }else {
      this._usuario.de_img = payload.de_img;
    }
    //console.log(this.usuario);
    sessionStorage.setItem('usuario', JSON.stringify(this.usuario));
  }

  guardarToken(accessToken: string): void {
    this._token = accessToken;
    sessionStorage.setItem('token', accessToken);
  }

  obtenerDatosToken(accessToken: string): any {
    if (accessToken != null) {
      try {
        const payload = JSON.parse(atob(accessToken.split(".")[1]));
        return payload;
      } catch (error) {
        console.error('Invalid access token:', error);
        return null;
      }
    }
    return null;
  }
  
 isAuthenticated(): boolean {
    let payload = this.obtenerDatosToken(this.token);
    if (payload != null && payload.user_name && payload.user_name.length > 0) {
      return true;
    }
    return false;
  }

 hasRole(role: string): boolean {
    if (this.usuario.roles.includes(role)) {
      return true;
    }
    return false;
  }

  logout(): void {
    this._token = null;
    this._usuario = null;
    sessionStorage.clear();
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
  }

  getUsuario(co_usuario) : Observable<Usuario>{
    let accessToken ;
    accessToken = sessionStorage.getItem('token')
    let payload = this.obtenerDatosToken(accessToken);
    let co_cia         = payload.co_cia ;
    let co_tip_maestro = payload.co_tip_maestro ;
    let co_maestro     = payload.co_maestro ;
    return this.http.get<Usuario>(`${base_url}/usuarios/${co_cia}/${co_tip_maestro}/${co_maestro}/${co_usuario}`,{headers: this.agregarAuthorizationHeader()}) ;
  }

  setUsuario(usuario: Usuario): void {
    this.usuario.co_cia = usuario.co_cia;
    this.usuario.co_tip_maestro = usuario.co_tip_maestro;
    this.usuario.co_maestro = usuario.co_maestro;
    this.usuario.co_solicitante = usuario.co_solicitante;
    this.usuario.de_nom_solicitante = usuario.de_nom_solicitante;
    this.usuario.de_pat_solicitante = usuario.de_pat_solicitante;
    this.usuario.de_email = usuario.de_email;
    this.usuario.roles = usuario.roles;
    if (this.usuario.de_img == '' || this.usuario.de_img == undefined) {
      this.usuario.de_img = 'no-img.jpg' ;    //./assets/images/users/
    }else {
      this.usuario.de_img = usuario.de_img;
    }
    sessionStorage.setItem('usuario', JSON.stringify(this.usuario));
  }

  update(usuario: Usuario): Observable<Usuario>{
    let accessToken ;
    accessToken = sessionStorage.getItem('token')
    let payload = this.obtenerDatosToken(accessToken);
    let co_cia         = payload.co_cia ;
    let co_tip_maestro = payload.co_tip_maestro ;
    let co_maestro     = payload.co_maestro ;
    console.log("Service");
    console.log(`${base_url}/usuarios/${co_cia}/${co_tip_maestro}/${co_maestro}/${usuario.co_solicitante}`);
    console.log(usuario);
    return this.http.put<Usuario>(`${base_url}/usuarios/${co_cia}/${co_tip_maestro}/${co_maestro}/${usuario.co_solicitante}`,usuario,{headers: this.agregarAuthorizationHeader()}).pipe(
    //return this.http.put<any>(`${this.urlEndPoint}/${cliente.id}`, cliente, { headers: this.agregarAuthorizationHeader() }).pipe(
      catchError(e => {
        console.error(e.error.mensaje);
        Swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  subirFoto(archivo: File ): Observable<Usuario> {
    let formData       = new FormData();
    let accessToken ;
    accessToken = sessionStorage.getItem('token')
    let payload = this.obtenerDatosToken(accessToken);
    let co_cia         = payload.co_cia ;
    let co_tip_maestro = payload.co_tip_maestro ;
    let co_maestro     = payload.co_maestro ;
    let co_usuario     = payload.co_solicitante ;
    console.log(co_cia + co_tip_maestro + co_maestro + co_usuario)
    formData.append("archivo", archivo);
    formData.append("co_cia", co_cia) ;
    formData.append("co_tip_maestro", co_tip_maestro) ;
    formData.append("co_maestro", co_maestro) ;
    formData.append("co_usuario", co_usuario) ;
    console.log("Usuario Service subir foto");
    console.log(formData.get("archivo"));
    console.log(formData.get("co_usuario"));
    console.log(formData);
    console.log(`${base_url}/usuarios/upload`);
    return this.http.post(`${base_url}/usuarios/upload/`, formData ).pipe(
    map( (response: any) => response.usuario as Usuario ),
    catchError(e => {
            console.error(e.error.mensaje);
            return throwError(e);
        })
    );
  }
}