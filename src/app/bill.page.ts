import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from './store.service';

/** Step 1 of 3: the bill (amount, shop, who was there). */
@Component({
  selector: 'app-bill', standalone: false,
  template: `<ion-content>
    <h1 class="title">New split</h1>
    <div class="bar"><span class="on"></span><span></span><span></span></div>
    <p class="step">Step 1 of 3 · The bill</p>

    <div class="amount">
      <label for="amt">Amount you paid</label>
      <div class="amt-row"><span>₹</span>
        <input id="amt" type="number" inputmode="decimal" placeholder="0" [(ngModel)]="s.amount" /></div>
      <small>Total on the bill, tax and service charge included</small>
    </div>

    <p class="lb">Shop</p>
    @if (!s.shops.length) { <p class="hint">No shops yet. Add one in the Shops tab.</p> }
    <div class="shops">
      @for (sh of s.shops; track sh.id) {
        <button type="button" class="shop" [class.sel]="s.shopId === sh.id" (click)="s.setShop(sh.id)">
          <app-mono [name]="sh.name"></app-mono><span>{{ sh.name }}</span>
          @if (s.shopId === sh.id) { <i class="ck"><ion-icon name="checkmark"></ion-icon></i> }
        </button>
      }
    </div>

    <div class="lb row"><span>Who was there</span><b>{{ s.present.length }} people</b></div>
    <div class="grid">
      @for (p of s.people; track p.id) {
        <button type="button" class="pp" [class.sel]="s.present.includes(p.id)" (click)="s.setPerson(p.id, !s.present.includes(p.id))">
          <app-avatar [name]="p.name" [photo]="p.photo" [size]="56"></app-avatar>
          <span>{{ p.name }}</span>
          @if (s.present.includes(p.id)) { <i class="ck sm"><ion-icon name="checkmark"></ion-icon></i> }
        </button>
      }
      <button type="button" class="pp" routerLink="/person-edit"><span class="new"><ion-icon name="add"></ion-icon></span><span>New</span></button>
    </div>
    <div class="next"><ion-button expand="block" shape="round" color="dark" [disabled]="!ok()" (click)="next()">
      Next: who ate what<ion-icon slot="end" name="arrow-forward"></ion-icon></ion-button></div>
  </ion-content>`,
  styles: [`
    .title{font-size:30px;font-weight:700;margin:56px 20px 8px}
    .bar{display:flex;gap:6px;margin:0 20px}.bar span{flex:1;height:4px;border-radius:2px;background:#DAD7CD}.bar .on{background:#C2410C}
    .step{margin:8px 20px 14px;font-size:12px;font-weight:600;color:#5C5F66}
    .amount{margin:0 20px;background:#fff;border:2px solid #17181B;border-radius:24px;padding:14px 20px 16px}
    .amount label,.lb{font-size:13px;font-weight:600;color:#5C5F66}.amount small{font-size:13px;color:#5C5F66}
    .amt-row{display:flex;align-items:center;gap:6px}.amt-row span{font-size:30px;font-weight:600;color:#5C5F66}
    .amt-row input{flex:1;min-width:0;border:0;outline:0;background:transparent;font-size:48px;font-weight:700;color:#17181B;padding:0}
    .lb{margin:18px 20px 8px}.row{display:flex;justify-content:space-between}.row b{color:#17181B}.hint{margin:0 20px;font-size:13px}
    .shops{display:flex;gap:10px;overflow-x:auto;padding:8px 20px}
    .shop{position:relative;flex:none;width:112px;height:104px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:0 8px;
      background:#fff;border:1px solid #E6E4DD;border-radius:20px;font-size:13px;font-weight:600;line-height:1.2;color:#17181B}
    .shop.sel{border:2px solid #17181B}
    .ck{position:absolute;top:-8px;right:-6px;width:22px;height:22px;border-radius:50%;background:#C2410C;color:#fff;display:grid;place-items:center;font-size:14px}
    .ck.sm{top:36px;right:4px;width:20px;height:20px;font-size:12px}
    .grid{display:grid;grid-template-columns:repeat(4,1fr);row-gap:12px;justify-items:center;padding:0 12px}
    .pp{position:relative;width:76px;display:flex;flex-direction:column;align-items:center;gap:6px;background:none;border:0;padding:0;font-size:13px;font-weight:600;color:#5C5F66}
    .pp app-avatar{opacity:.55}.pp.sel{color:#17181B}.pp.sel app-avatar{opacity:1;border-radius:50%;box-shadow:0 0 0 2px #F4F3EF,0 0 0 4px #17181B}
    .new{width:56px;height:56px;border-radius:50%;border:2px dashed #A9A699;display:grid;place-items:center;font-size:22px}
    .next{padding:20px 20px 24px}.next ion-button{--border-radius:28px;height:56px;font-weight:600}
  `],
})
export class BillPage {
  constructor(public s: Store, private nav: Router) {}
  ok() { return (this.s.amount || 0) > 0 && !!this.s.shopId && this.s.present.length > 0; }
  next() { this.nav.navigate(['/split-items']); }
}
