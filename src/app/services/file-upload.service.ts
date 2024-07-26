import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';
import { UsuarioService } from './usuario.service';

const base_url  = environment.base_url ;

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  constructor(private usuarioService : UsuarioService) { }

/*  async actualizarFoto(
    archivo : File,
    tipo : 'usuarios',
    id: string
  ) {
       
    try {
      const url = `${base_url}/updoad/${tipo}/${id}`
      const formData  =  new FormData;
      formData.append('imagen',archivo);

      const resp = await fetch(url, {
        method : 'PUT',
        headers : {
          'x-token' : localStorage.getItem('token') || ''
        },
        body : formData 
      });
      console.log(resp)

  
    } catch (error) {
      console.log(error) ;
      return false ;
    }

  }
*/

/*subirFoto(archivo: File, tipo :String  , co_id:String): Observable<`${tipo}`> { 
  let formData       = new FormData();
  let accessToken ;

  accessToken = sessionStorage.getItem('token')
  let payload = this.authService.obtenerDatosToken(accessToken);
  let co_cia         = payload.co_cia ;
  let co_tip_maestro = payload.co_tip_maestro ;
  let co_maestro     = payload.co_maestro ;
  
  formData.append("archivo", archivo) ;
  formData.append("co_cia", co_cia) ;
  formData.append("co_tip_maestro", co_tip_maestro) ;
  formData.append("co_maestro", co_maestro) ;
  formData.append("co_aprobador", co_aprobador) ;

  return this.http.post(`${this.urlEndPoint}/upload`,formData).pipe(
  map( (response: any) => response.aprobador as Aprobador ),
  catchError(e => {
          console.error(e.error.mensaje);
          return throwError(e);
      })

*/

}
