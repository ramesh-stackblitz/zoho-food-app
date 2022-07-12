import { Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
import { HotelService } from '../../services/hotel.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ISortOption } from '../../models/sort-option';
import Swal from 'sweetalert2/dist/sweetalert2.js';
// import * as jsPDF from 'jspdf';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {

  @ViewChild('htmlData') htmlData:ElementRef;

  public orderList = [];
  public userName = '';
  public orderlistConstant = [];
  public constantOrderlist = [];
  public dataNotFound: boolean = false;

  sortOptions: ISortOption[] = [
    {value: 'name', viewValue: 'Name'},
    {value: 'cuisine', viewValue: 'Cuisine'},
    {value: 'type', viewValue: 'Type'}
    
  ];

  sortOrderOptions: ISortOption[] = [
    {value: 'all', viewValue: 'All'},
    {value: 'past30Days', viewValue: 'Past 30Days'}
    
    
    
  ];

  selectedValue = this.sortOptions[0].value;

  orderSelectedValue = this.sortOrderOptions[0].value;

  constructor(private _hotelService: HotelService, private router: Router) { }

  ngOnInit() {
    this.orderList = JSON.parse(sessionStorage.getItem('orderList'));

    this._hotelService.getOrderList().subscribe(
      (data) => {
        this.constantOrderlist = data;
        if(this.orderList && this.orderList.length > 0) {
          //this.orderList.push(this.constantOrderlist);
          this.constantOrderlist.map((order) => {
            this.orderList.push(order);
          });
        } else {
          this.orderList = this.constantOrderlist;
        }
        this.orderlistConstant = this.orderList;
        if(this.orderList && this.orderList.length > 0) {
          this.dataNotFound = true;
        }
        // this.sortHotels(this.selectedValue);
        this.userName = this._hotelService.userName;

        // let currentDate = new Date();
        // console.log('Today: ' + currentDate.toUTCString());
        // let last30days = new Date(currentDate.setDate(currentDate.getDate() - 30));
        // console.log('Last 30th day: ' + last30days.toUTCString());
        
        // var startDate = this.getCurrentDate();
        // var endDate = this.getEndDate();
        
        // var getCurrentDate = () => {
        //   const t = new Date();
        //   const date = ('0' + t.getDate()).slice(-2);
        //   const month = ('0' + (t.getMonth() + 1)).slice(-2);
        //   const year = t.getFullYear();
        //   return `${date}-${month}-${year}`;
        // }
        
        if(!this.userName) {
          this.router.navigateByUrl("/hotels");
        }
      },
      (error) => {
        this.showError(error);
      }
    );
    //console.log(this.orderList);
    // this.orderlistConstant = this.orderList;
    // this.sortHotels(this.selectedValue);
    // this.userName = this._hotelService.userName;

    
  }

  showError = (error) => {
    Swal.fire({
      icon: 'error',
      title: error.status,
      text: error.message,
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
    });
  }

  searchQuery = (query) => {
    this.orderList = this.orderlistConstant.filter((hotel) =>  JSON.stringify(hotel).toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }

  sortHotels = (selectedValue) => {

    if (selectedValue === 'cuisine'){
      
      this.orderList = this.orderList.sort((a,b) => {
        // return b.cuisine - a.cuisine
        return compareName(a.cuisine, b.cuisine)
      });
    }

    else if (selectedValue === 'type'){
      this.orderList = this.orderList.sort((a,b) => {
        // return b.type - a.type
        return compareName(a.type, b.type)
      });
    }

    else if (selectedValue === 'name'){
      this.orderList = this.orderList.sort((a,b) => {
        return compareName(a.name, b.name)
      });
    }

    function compareName (a, b)  {
      a = a.toLowerCase();
      b = b.toLowerCase();
    
      return (a < b) ? -1 : (a > b) ? 1 : 0;
    }
  }

  sortOrderList = (selectedValue) => {

    if (selectedValue === 'all') {
      
      this.orderList = this.constantOrderlist;
    } else if( selectedValue === 'past30Days') {
        let today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0');
        var yyyy = today.getFullYear();
        var endDate = new Date(yyyy + '/' + mm + '/' + dd);
        const t = new Date(new Date().setDate(today.getDate() - 30));
        const date = ('0' + t.getDate()).slice(-2);
        const month = ('0' + (t.getMonth() + 1)).slice(-2);
        const year = t.getFullYear();
        var startDate = new Date(year + '/' + month + '/' + date);
        
        var tempOrderlist = [];
        var resultProductData = this.orderList.filter(a => {
          var orderDate = new Date(a.orderDate);
          var orderdd = String(orderDate.getDate()).padStart(2, '0');
          var ordermm = String(orderDate.getMonth() + 1).padStart(2, '0');
          var orderyyyy = orderDate.getFullYear();
        var orderDate1 = new Date(orderyyyy + '/' + ordermm + '/' + orderdd);
          if(startDate <= orderDate1 && orderDate1 <= endDate) {
            tempOrderlist.push(a);
          }
        });
        this.orderList = tempOrderlist;
    }

  }

  public downloadPDF():void {

    var head = [['ID', 'Name', 'Order Date', 'Order Time', 'Cuisine', 'Type', 'Price', 'Quantity']];

    const tempValue = this.orderList.map((item) => {
      return Object.values(item);
    })

   var data = tempValue;
    var doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('My Order list', 11, 8);
    doc.setFontSize(11);
    doc.setTextColor(100);


    (doc as any).autoTable({
      head: head,
      body: data,
      theme: 'plain',
      didDrawCell: data => {
        console.log(data.column.index)
      }
    });

    doc.output('dataurlnewwindow');
    doc.save('orderlist.pdf');
  }

  public downloadItem(item): void {
    var tempArray = Object.values(item);
  var columns = ['ID', 'Name', 'Order Date', 'Order Time', 'Cuisine', 'Type', 'Price', 'Quantity'];
  var doc = new jsPDF('p', 'pt');
      (doc as any).autoTable(columns, tempArray)
  doc.save('MyOrder.pdf');
  }

}

