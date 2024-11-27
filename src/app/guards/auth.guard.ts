import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {
  constructor(private usuarioService: UsuarioService,
              private router :Router){ 
  } 

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot){

      console.log('can activate');
      console.log('validacion ' + this.usuarioService.isAuthenticated());
      if (!this.usuarioService.isAuthenticated()) {
        this.router.navigateByUrl('/login')
        return false
     } else {
        return true
     }     
         ;
  }
 
}