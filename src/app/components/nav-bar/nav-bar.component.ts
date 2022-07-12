import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { HotelService } from '../../services/hotel.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {

  @Input() public userName;

  constructor(private router: Router, private _hotelService: HotelService) { }

  goToHome = () => {
    this.router.navigateByUrl("/hotels");
  }
  ngOnInit(): void {
  }
  logout = () => {
    this._hotelService.userName = null;
    this.router.navigateByUrl("/hotels");
    sessionStorage. clear();
  }

}
