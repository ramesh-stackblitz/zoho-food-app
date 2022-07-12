import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { HotelService } from '../../services/hotel.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { MatSidenav } from '@angular/material/sidenav';
import { SideNavService } from '../../services/side-nav.service';
import { ISortOption } from '../../models/sort-option';

@Component({
  selector: 'app-hotel',
  templateUrl: './hotel.component.html',
  styleUrls: ['./hotel.component.scss']
})
export class HotelComponent implements OnInit, AfterViewInit {

  @ViewChild('sidenav', {static: true}) public sidenav: MatSidenav;

  public hotels = [];
  public hotel;
  public cartItems = [];
  public totalAmount = 0;
  public isFetched: boolean = false;
  public toggleMode = "over";
  public userName = '';
  public isSideNavShowing: boolean = false;
  public currentItemId;
  public currentItem;
  public hotelsConstant = [];
  public hotelDetails = [];

  sortOptions: ISortOption[] = [
    {value: 'name', viewValue: 'Name'},
    {value: 'type', viewValue: 'type'},
    {value: 'cuisine', viewValue: 'Cuisine'}
  ];

  selectedValue = this.sortOptions[0].value; // default sorting


  constructor(private _hotelService: HotelService, private route: ActivatedRoute, 
    private router: Router, private _sidenavService: SideNavService) { 
      this.currentItemId = parseInt(this.route.snapshot.paramMap.get('id'));
    }

  scrollTop = () => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }

  currentDate = () => {
    let today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    var currentDate = mm + '-' + dd + '-' + yyyy;
    return currentDate;
  }

  currentTime = () => {
    let today = new Date();
    var curHour = today.getHours() > 12 ? today.getHours() - 12 : (today.getHours() < 10 ? "0" + today.getHours() : today.getHours());
	  var curMinute = today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes();
    var curMeridiem = today.getHours() > 12 ? "PM" : "AM";
    var currentTime = curHour + ":" + curMinute + curMeridiem;
    return currentTime;
  }

  addToMyCart = (menu) => {
    const newItem = {
      "id": menu.id,
      "name": menu.name,
      "orderDate": this.currentDate(),
      "orderTime": this.currentTime(),
      "cuisine": menu.cuisine,
      "type": menu.type,
      "price": menu.price,
      "quantity": 1,
      
    }

    if(this.isItemAlreadyExist(newItem)) {
      this.itemAlreadyExistModal(newItem);
    }
    else {
      this.addItemToMyCart(newItem);
      this.itemAddedModal(newItem);
      this.calculateAmount();
    }
  }

  addItemToMyCart = (newItem) => {
    this._hotelService.setCartItem(newItem);
    this.cartItems = this._hotelService.cartItems;
  }

  isItemAlreadyExist = (newItem) => {
    return this._hotelService.cartItems.find((cartItem) => cartItem.id == newItem.id);
  }

  itemAddedModal = (newItem) => {
    Swal.fire({
      icon: 'success',
      title: `${newItem.name} added to your basket!`,
      text: "Click on 'View My Basket' button below to view your basket",
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonColor: '#228d4c',
      confirmButtonText: 'View My Basket',
      cancelButtonText: 'Close',
      cancelButtonColor: '#e23c3c'
    }).then((result) => {
      if (result.isConfirmed) {
        this.toggleSideNav();
      }
    });
  }

  toggleSideNav = () => {
    this.scrollTop();
    this._sidenavService.toggle();
  }

  itemAlreadyExistModal = (newItem) => {
    Swal.fire({
      icon: 'warning',
      title: `${newItem.name} is already exist in your basket!`,
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonColor: '#228d4c',
      confirmButtonText: 'View My Basket',
      cancelButtonText: 'Close',
      cancelButtonColor: '#e23c3c'
    }).then((result) => {
      if (result.isConfirmed) {
        this.toggleSideNav();
      }
    });
  }

  removeItem = (cartItem) => {
    this._hotelService.removeCartItem(cartItem);
    this.cartItems = this._hotelService.cartItems;
    this.calculateAmount();
  }

  addQuantity = (cartItem) => {
    this.cartItems.forEach((item,index)=>{
      if(item.id == cartItem.id)
        this.cartItems[index].quantity = Number(this.cartItems[index].quantity)  + 1; 
   });
   this.calculateAmount();
  }

  removeQuantity = (cartItem) => {
    this.cartItems.forEach((item,index)=>{
      if(item.id == cartItem.id) {
        if (this.cartItems[index].quantity > 0)
          this.cartItems[index].quantity -= 1;
      }
   });
   this.calculateAmount();
  }

  calculateAmount = () => {
    this.totalAmount = 0; 
    this.cartItems.map((item) => {
      this.totalAmount = this.totalAmount + (item.quantity*item.price)
    });
  }

  addOrderItem = () => {
    console.log(this.cartItems);
    Swal.fire({
      title: 'Are you sure?',
      text: "It's just a order confirmation message!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#228d4c',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Place Your Order!'
    }).then((result) => {
      if (result.isConfirmed) {
        let tempSessionValue: any = [];
        tempSessionValue = JSON.parse(sessionStorage.getItem('orderList'));
        if(tempSessionValue && tempSessionValue.length > 0) {
          this.cartItems.map((item) => {
            tempSessionValue.push(item);
          })
        } else {
          tempSessionValue = this.cartItems
        }
        sessionStorage.setItem('orderList', JSON.stringify(tempSessionValue));
        Swal.fire({
          icon: 'success',
          title: 'Your order successfully!',
          text: "",
          showConfirmButton: true,
          confirmButtonColor: '#228d4c'
        });
        this.router.navigateByUrl("/orderlist");
      }
    })
  }

  ngAfterViewInit(): void {
    this._sidenavService.setSidenav(this.sidenav);
  }

  sortHotels = (selectedValue) => {

    if (selectedValue === 'cuisine'){
      
      this.hotel = this.hotel.sort((a,b) => {
        return compareName(a.cuisine, b.cuisine)
      });
    }

    else if (selectedValue === 'type'){
      this.hotel = this.hotel.sort((a,b) => {
        return compareName(a.type, b.type)
      });
    }

    else if (selectedValue === 'name'){
      this.hotel = this.hotel.sort((a,b) => {
        return compareName(a.name, b.name)
      });
    }

    function compareName (a, b)  {
      a = a.toLowerCase();
      b = b.toLowerCase();
    
      return (a < b) ? -1 : (a > b) ? 1 : 0;
    }
  }


  ngOnInit(): void {
    this.scrollTop();
    this._hotelService.getHotelsList().subscribe((data) => {
      this.hotels = data;
      let tempItems = this.hotels.filter( (item) => item.id == this.currentItemId);
      this.hotelDetails = tempItems;
      if(tempItems && tempItems.length > 0) {
        this.hotel = tempItems[0].menu;
      }

      var today = new Date();
      var time = (today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()).slice(0, 2);

      var tempValue = this.hotel.map((item, index) => {
      item.availability.map((aval) => {
        if(aval === "BREAKFAST" && (6 <= parseInt(time) && 12 >= parseInt(time)) || aval === "LUNCH" && (12 <= parseInt(time) && 16 >= parseInt(time)) || aval === "DINNER" && 17 <= parseInt(time)) {
          this.hotel[index].availabilityFlag = true;
        } else {
          this.hotel[index].availabilityFlag = false;
        }
      })
      });

      this.hotelsConstant = this.hotel;
    });

    this.userName = this._hotelService.userName;
    this.cartItems = this._hotelService.cartItems;
    this.calculateAmount();

    if(!this.userName) {
      this.router.navigateByUrl("/hotels");
    }
  }

  searchQuery = (query) => {
    this.hotel = this.hotelsConstant.filter((hotel) =>  JSON.stringify(hotel).toLowerCase().indexOf(query.toLowerCase()) !== -1);
   console.log(this.hotel);
  }
}
