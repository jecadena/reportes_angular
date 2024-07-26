import { Component, OnInit } from '@angular/core';
import {UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../usuarios/usuario';
import Swal from 'sweetalert2';
import { FileUploadService } from '../../services/file-upload.service';
import swal from 'sweetalert2';
import { environment } from '../../../environments/environment';

const base_url = environment.base_url ;

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  public perfilForm : UntypedFormGroup ;
  public usuario: Usuario ;
  private fotoSeleccionada : File;
  public http_url_img :string ;
  public img_temp : any = null ;

  constructor(private usuarioService : UsuarioService,
              private activateRoute : ActivatedRoute,
              private router : Router,
              private fb: UntypedFormBuilder ,
              private fileUploadService : FileUploadService) {
  }

  ngOnInit(): void {

    this.usuario = new Usuario ;

    this.http_url_img = `${base_url}/usuarios/uploads/img/` ;
    this.cargaPerfil();
    this.perfilForm = this.fb.group({

        de_nom_solicitante :[(this.usuario.de_nom_solicitante),Validators.required],
        de_pat_solicitante :[(this.usuario.de_pat_solicitante),Validators.required],
        de_email           :[(this.usuario.de_email),[Validators.required, Validators.email]],

    });


  }

  cargaPerfil(){
    this.usuario = this.usuarioService.usuario ;

     /*   this.activatedRoute.params.subscribe(params => {
        let co_usuario : String ;
        co_usuario = this.usuarioService._usuario.co_solicitante ;
        console.log(co_usuario);
        if (co_usuario){
           this.usuarioService.getUsuario(co_usuario).subscribe( (usuario) => this.usuario = usuario) ;
        }})
        console.log(this.usuarioService._usuario.de_email);
*/
        /*this.perfilForm.setValue({de_nom_solicitante: this.usuario.de_nom_solicitante,
          de_pat_solicitante: this.usuario.de_pat_solicitante,
          de_email : this.usuario.de_email});
        */
        //console.log(this.perfilForm.get("de_nom_solicitante").value);
       // this.editqueForm.setValue({user: this.question.user, questioning: this.question.questioning})
  }

  actualizarPerfil() : void{
    let co_usuario : String ;

    co_usuario = this.usuarioService.usuario.co_solicitante ;
    console.log(co_usuario);

    this.usuario.de_nom_solicitante = this.perfilForm.get("de_nom_solicitante").value;
    this.usuario.de_pat_solicitante = this.perfilForm.get("de_pat_solicitante").value;
    this.usuario.de_email           = this.perfilForm.get("de_email").value;

    console.log("Actualiza Perfil");
    console.log(this.usuario);


    this.usuarioService.update(this.usuario).subscribe( usuario => {
      //this.subirFoto()
      this.router.navigate(['/'])
      Swal.fire('Usuario Actualizado',`Usuario ${this.usuario.de_nom_solicitante} ${this.usuario.de_pat_solicitante} actualizado con exito!`,'success')

    });
  }

  cambiarImagen(event){
        this.fotoSeleccionada = event.target.files[0] ;
        console.log(this.fotoSeleccionada);

        /*if(this.imagenSubir.type.indexOf("image") < 0){
           swal.fire ('Error al seleccionar imagen','Archivo debe ser de tipo Imagen','error');
           this.imagenSubir = null;
        }*/
        if( !this.fotoSeleccionada ) {
           return this.fotoSeleccionada = null ;
        }
        const reader = new FileReader();

        reader.readAsDataURL(this.fotoSeleccionada);
        reader.onloadend = () => {
          this.img_temp = reader.result ;
        }


  }
  subirFoto(){
      //console.log(this.usuario.co_solicitante);
      //console.log(this.img_temp);
      this.usuarioService.subirFoto(this.fotoSeleccionada)
      .subscribe(usuario =>{ this.usuario = usuario ;
      swal.fire('La foto se ha subido correctamente !',`Foto : ${this.usuario.de_img}`,'success');
    });
  }


}
