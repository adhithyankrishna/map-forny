import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MapComponent } from './map/map.component';
import { authgurd } from './services/auth.guard';
import { AlbumComponent } from './album/album.component';
import { AddreviewComponent } from './addreview/addreview.component';
import { ProfileComponent } from './profile/profile.component';
import { SignupComponent } from './signup/signup.component';
import { AddshapeComponent } from './addshape/addshape.component';
import { AdminComponent } from './admin/admin.component';
import { AdmingridComponent } from './admingrid/admingrid.component';
import { AdminGuard } from './services/admin.guard';

export const routes: Routes = [
    
    {path:'signup', component:SignupComponent },
    { path: 'login', component: LoginComponent },
    { path: 'map', component: MapComponent, canActivate: [authgurd] },
    { path: 'album', component: AlbumComponent },
    { path: 'addreview', component: AddreviewComponent },
    {path:'profile',component:ProfileComponent},
    { path: 'addshape', component: AddshapeComponent ,canActivate:[AdminGuard]},
    {path:'admin',component:AdminComponent ,canActivate:[AdminGuard]},
    {path:'adming',component:AdmingridComponent,canActivate:[AdminGuard]},
    { path: '**', redirectTo: '/map', pathMatch: 'full' },
    
  ];