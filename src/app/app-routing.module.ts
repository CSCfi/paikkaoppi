import { TaskTemplateComponent } from './task-template/task-template.component';
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { HomeComponent } from './home/home.component'
import { DashboardComponent } from './dashboard/dashboard.component'
import { LibraryComponent } from './library/library.component'
import { MapComponent } from './map/map.component'
import { AuthGuard } from './service/auth.guard'

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'dashboard/:id', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'map/:id', component: MapComponent, canActivate: [AuthGuard] },
  { path: 'library', component: LibraryComponent, canActivate: [AuthGuard] },
  { path: 'library/:id', component: LibraryComponent, canActivate: [AuthGuard] },
  { path: 'task-template', component: TaskTemplateComponent, canActivate: [AuthGuard] },
  { path: 'task-template/:id', component: TaskTemplateComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: false })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
