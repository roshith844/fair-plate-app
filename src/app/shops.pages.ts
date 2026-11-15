import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from './store.service';

const PILL = `.pill{height:44px;padding:0 18px 0 14px;border-radius:22px;background:#17181B;color:#fff;font-size:14px;font-weight:600;display:flex;align-items:center;gap:6px;border:0;flex:none}
  .pill ion-icon{font-size:20px}h1{margin:0;font-size:30px;font-weight:700}.mut{color:#5C5F66}`;

@Component({
  selector: 'app-shops', standalone: false,
  template: `<ion-content>
    <div class="top"><h1>Shops</h1><button class="pill" routerLink="/shop-edit"><ion-icon name="add"></ion-icon>Add shop</button></div>
    <p class="count mut">{{ s.shops.length }} shops</p>
    @if (!s.shops.length) { <p class="empty mut">No shops yet. Add your first shop, then its menu.</p> }
    <div class="list">
      @for (sh of s.shops; track sh.id) {
        <a class="row" [routerLink]="['/shop', sh.id]">
          <app-mono [name]="sh.name" [size]="52"></app-mono>
          <div class="tx"><b>{{ sh.name }}</b><small>{{ s.shopItems(sh.id).length }} items</small></div>
          <ion-icon name="chevron-forward" class="mut"></ion-icon>
        </a>
      }
    </div>
  </ion-content>`,
  styles: [PILL + `
    .top{display:flex;align-items:center;justify-content:space-between;padding:52px 20px 0}
    .count{margin:12px 24px 8px;font-size:13px;font-weight:500}.empty{margin:0 24px}
    .list{margin:0 20px;background:#fff;border:1px solid #E6E4DD;border-radius:20px;overflow:hidden}
    .row{display:flex;align-items:center;gap:14px;padding:12px 16px;min-height:76px;color:#17181B;text-decoration:none}.row+.row{border-top:1px solid #EFEDE6}
    .tx{flex:1;min-width:0}.tx b{display:block;font-size:17px}.tx small{display:block;margin-top:2px;font-size:13px;color:#5C5F66}
  `],
})
export class ShopsPage { constructor(public s: Store) {} }

@Component({
  selector: 'app-shop-menu', standalone: false,
  template: `<ion-content>
    <div class="nav">
      <button class="ib" aria-label="Back to shops" routerLink="/tabs/shops"><ion-icon name="chevron-back"></ion-icon></button>
      <button class="ib" aria-label="Rename shop" [routerLink]="['/shop-edit', id]"><ion-icon name="pencil-outline"></ion-icon></button>
    </div>
    <div class="head">
      <div><h1>{{ s.shop(id)?.name }}</h1><small class="mut">{{ s.shopItems(id).length }} items</small></div>
      <button class="pill" [routerLink]="['/item-edit', id]"><ion-icon name="add"></ion-icon>Add item</button>
    </div>
    @if (!s.shopItems(id).length) { <p class="empty mut">No items yet. Add what this shop sells, with its price.</p> }
    <div class="grid">
      @for (i of s.shopItems(id); track i.id) {
        <a class="it" [routerLink]="['/item-edit', id, i.id]">
          @if (i.photo) { <img [src]="i.photo" alt="" class="ph" /> } @else { <div class="ph"><app-mono [name]="i.name" [size]="64"></app-mono></div> }
          <span class="nm">{{ i.name }}</span>
          <span class="pr">₹{{ i.price }}<ion-icon name="pencil-outline" class="mut"></ion-icon></span>
        </a>
      }
    </div>
  </ion-content>`,
  styles: [PILL + `
    .nav{display:flex;justify-content:space-between;padding:52px 20px 0}
    .ib{width:44px;height:44px;border-radius:50%;background:#fff;border:1px solid #E6E4DD;font-size:20px;display:grid;place-items:center}
    .head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:16px 20px}h1{font-size:26px}.head small{font-size:13px}
    .empty{margin:0 24px}
    .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:0 20px 20px}
    .it{display:flex;flex-direction:column;gap:8px;padding:8px 8px 12px;background:#fff;border:1px solid #E6E4DD;border-radius:20px;color:#17181B;text-decoration:none}
    .ph{width:100%;height:104px;border-radius:14px;object-fit:cover;background:#F4F3EF;display:grid;place-items:center}
    .nm{padding:0 4px;font-size:15px;font-weight:600;line-height:1.25}
    .pr{display:flex;align-items:center;justify-content:space-between;padding:0 4px;font-size:16px;font-weight:600}.pr ion-icon{font-size:18px}
  `],
})
export class ShopMenuPage {
  id = this.r.snapshot.paramMap.get('id')!;
  constructor(public s: Store, private r: ActivatedRoute) {}
}
