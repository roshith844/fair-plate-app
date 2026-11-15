import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store, uid } from './store.service';


// ---------------- Shops ----------------
@Component({
  selector: 'app-shops', standalone: false,
  template: `<ion-header><ion-toolbar><ion-title>Shops</ion-title>
    <ion-buttons slot="end"><ion-button routerLink="/shop-edit"><ion-icon slot="start" name="add"></ion-icon>Add shop</ion-button></ion-buttons></ion-toolbar></ion-header>
  <ion-content>
    @if (!s.shops.length) { <p class="ion-padding">No shops yet. Add your first shop, then its menu.</p> }
    <ion-list>@for (sh of s.shops; track sh.id) {
      <ion-item [routerLink]="['/shop', sh.id]" detail><ion-label>{{ sh.name }}<p>{{ s.shopItems(sh.id).length }} items</p></ion-label></ion-item>
    }</ion-list></ion-content>`,
})
export class ShopsPage { constructor(public s: Store) {} }

@Component({
  selector: 'app-shop-edit', standalone: false,
  template: `<ion-header><ion-toolbar><ion-buttons slot="start"><ion-back-button defaultHref="/tabs/shops"></ion-back-button></ion-buttons><ion-title>{{ id ? 'Edit shop' : 'New shop' }}</ion-title></ion-toolbar></ion-header>
  <ion-content class="ion-padding">
    <ion-item><ion-input label="Shop name" labelPlacement="stacked" [(ngModel)]="name"></ion-input></ion-item>
    <ion-button expand="block" class="ion-margin-top" [disabled]="!name.trim()" (click)="save()">Save shop</ion-button>
    @if (id) { <ion-button expand="block" fill="clear" color="danger" (click)="del()">Delete shop and its items</ion-button> }
  </ion-content>`,
})
export class ShopEditPage {
  id = this.r.snapshot.paramMap.get('id') || '';
  name = this.s.shop(this.id)?.name || '';
  constructor(private s: Store, private r: ActivatedRoute, private nav: Router) {}
  async save() {
    const id = this.id || uid();
    await this.s.saveShop({ id, name: this.name.trim() });
    this.nav.navigate(this.id ? ['/shop', id] : ['/shop', id], { replaceUrl: true });
  }
  async del() { await this.s.deleteShop(this.id); this.nav.navigate(['/tabs/shops'], { replaceUrl: true }); }
}

@Component({
  selector: 'app-shop-menu', standalone: false,
  template: `<ion-header><ion-toolbar><ion-buttons slot="start"><ion-back-button defaultHref="/tabs/shops"></ion-back-button></ion-buttons><ion-title>{{ s.shop(id)?.name }}</ion-title>
    <ion-buttons slot="end"><ion-button [routerLink]="['/shop-edit', id]">Rename</ion-button></ion-buttons></ion-toolbar></ion-header>
  <ion-content>
    <ion-button expand="block" class="ion-margin" [routerLink]="['/item-edit', id]"><ion-icon slot="start" name="add"></ion-icon>Add item</ion-button>
    <ion-list>@for (i of s.shopItems(id); track i.id) {
      <ion-item [routerLink]="['/item-edit', id, i.id]" detail>
        <app-avatar slot="start" [name]="i.name" [photo]="i.photo"></app-avatar>
        <ion-label>{{ i.name }}</ion-label><ion-note slot="end">₹{{ i.price }}</ion-note></ion-item>
    }</ion-list>
    @if (!s.shopItems(id).length) { <p class="ion-padding">No items yet.</p> }
  </ion-content>`,
})
export class ShopMenuPage {
  id = this.r.snapshot.paramMap.get('id')!;
  constructor(public s: Store, private r: ActivatedRoute) {}
}

@Component({
  selector: 'app-item-edit', standalone: false,
  template: `<ion-header><ion-toolbar><ion-buttons slot="start"><ion-back-button defaultHref="/tabs/shops"></ion-back-button></ion-buttons><ion-title>{{ id ? 'Edit item' : 'New item' }}</ion-title></ion-toolbar></ion-header>
  <ion-content class="ion-padding">
    <app-photo-picker [name]="name" [photo]="photo" (photoChange)="photo = $event"></app-photo-picker>
    <ion-item><ion-input label="Item name" labelPlacement="stacked" [(ngModel)]="name"></ion-input></ion-item>
    <ion-item><ion-input label="Price (₹, one serving)" labelPlacement="stacked" type="number" inputmode="decimal" [(ngModel)]="price"></ion-input></ion-item>
    <ion-button expand="block" class="ion-margin-top" [disabled]="!ok()" (click)="save(false)">Save item</ion-button>
    @if (!id) { <ion-button expand="block" fill="outline" [disabled]="!ok()" (click)="save(true)">Save and add another</ion-button> }
    @if (id) { <ion-button expand="block" fill="clear" color="danger" (click)="del()">Delete item</ion-button> }
  </ion-content>`,
})
export class ItemEditPage {
  shopId = this.r.snapshot.paramMap.get('shopId')!;
  id = this.r.snapshot.paramMap.get('id') || '';
  name = this.s.item(this.id)?.name || '';
  price: number | null = this.s.item(this.id)?.price ?? null;
  photo = this.s.item(this.id)?.photo;
  constructor(private s: Store, private r: ActivatedRoute, private nav: Router) {}
  ok() { return !!this.name.trim() && this.price !== null && +this.price >= 0; }
  async save(another: boolean) {
    await this.s.saveItem({ id: this.id || uid(), shopId: this.shopId, name: this.name.trim(), price: +this.price!, photo: this.photo });
    if (another) { this.name = ''; this.price = null; this.photo = undefined; }
    else this.nav.navigate(['/shop', this.shopId], { replaceUrl: true });
  }
  async del() { await this.s.deleteItem(this.id); this.nav.navigate(['/shop', this.shopId], { replaceUrl: true }); }
}

// ---------------- People ----------------
@Component({
  selector: 'app-people', standalone: false,
  template: `<ion-header><ion-toolbar><ion-title>People</ion-title>
    <ion-buttons slot="end"><ion-button routerLink="/person-edit"><ion-icon slot="start" name="add"></ion-icon>Add person</ion-button></ion-buttons></ion-toolbar></ion-header>
  <ion-content><ion-list>@for (p of s.people; track p.id) {
    <ion-item [routerLink]="['/person-edit', p.id]" detail><app-avatar slot="start" [name]="p.name" [photo]="p.photo"></app-avatar><ion-label>{{ p.name }}</ion-label></ion-item>
  }</ion-list></ion-content>`,
})
export class PeoplePage { constructor(public s: Store) {} }

@Component({
  selector: 'app-person-edit', standalone: false,
  template: `<ion-header><ion-toolbar><ion-buttons slot="start"><ion-back-button defaultHref="/tabs/people"></ion-back-button></ion-buttons><ion-title>{{ id ? 'Edit person' : 'New person' }}</ion-title></ion-toolbar></ion-header>
  <ion-content class="ion-padding">
    <app-photo-picker [name]="name" [photo]="photo" (photoChange)="photo = $event"></app-photo-picker>
    <ion-item><ion-input label="Name" labelPlacement="stacked" [(ngModel)]="name"></ion-input></ion-item>
    <ion-button expand="block" class="ion-margin-top" [disabled]="!name.trim()" (click)="save()">Save person</ion-button>
    @if (id) { <ion-button expand="block" fill="clear" color="danger" (click)="del()">Delete person</ion-button> }
  </ion-content>`,
})
export class PersonEditPage {
  id = this.r.snapshot.paramMap.get('id') || '';
  name = this.s.person(this.id)?.name || '';
  photo = this.s.person(this.id)?.photo;
  constructor(private s: Store, private r: ActivatedRoute, private nav: Router) {}
  async save() { await this.s.savePerson({ id: this.id || uid(), name: this.name.trim(), photo: this.photo }); this.nav.navigate(['/tabs/people'], { replaceUrl: true }); }
  async del() { await this.s.deletePerson(this.id); this.nav.navigate(['/tabs/people'], { replaceUrl: true }); }
}

export const CATALOG = [ShopsPage, ShopEditPage, ShopMenuPage, ItemEditPage, PeoplePage, PersonEditPage];
