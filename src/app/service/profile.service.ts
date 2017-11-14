import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs/Observable'
import { environment } from '../../environments/environment'
import { User } from './model'

@Injectable()
export class ProfileService {
  profileId: number

  constructor(
    private http: HttpClient) {
  }

  getProfile(user: User | null): number {
    return this.profileId ? this.profileId : (user != null ? user.profile : 1)
  }

  setProfile(profileId: number): void {
    this.profileId = profileId
  }

  updateProfile(): Observable<User> {
    const profile = {
      id: this.profileId
    }
    
    return this.http.put<User>(`${environment.apiUri}/user/profile`, profile)
  }
}
