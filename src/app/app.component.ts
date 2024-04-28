import {ChangeDetectionStrategy, Component} from '@angular/core';
import {AuthService} from "./Services/auth.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  title = 'DanguiUi';

  constructor(public authService:AuthService) {
  }

}
