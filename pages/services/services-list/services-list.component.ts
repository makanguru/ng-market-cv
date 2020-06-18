import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ShopModel } from '../../../core/models/store/service/service.model';

@Component({
  selector: 'app-services-list',
  templateUrl: './services-list.component.html',
  styleUrls: ['./services-list.component.scss']
})
export class ServicesListComponent implements OnInit {
  constructor(private route: ActivatedRoute) { }

  options: {name: string}[];
  filter: {name: string};
  
  @Input()
  shops: ShopModel[];

  @Output()
  filterChange = new EventEmitter<{name: string}>();

  alphabet_en = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split('').map(name => ({name}));
  alphabet_ru = 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('').map(name => ({name}));

  ngOnInit() {
    this.options = [
      {name: 'Все'}, {name: '0-9'}, ...this.alphabet_en
    ];
    const name = this.route.snapshot.queryParams['startsWith'];
    if (name) {
      this.filter = {name};
    }
  }

  setFilter(option: {name: string}) {
    this.filter = option;
    this.filterChange.emit(option);
  }

  isActive(option: {name: string}) {
    if (!this.filter) {
      return false;
    }
    return option.name === this.filter.name;
  }

  addToFavourite(shop: ShopModel) {
    shop.is_favorite = true;
  }

  removeFromFavourite(shop: ShopModel) {
    shop.is_favorite = false;
  }

}
