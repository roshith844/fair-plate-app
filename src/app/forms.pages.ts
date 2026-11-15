import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { resizePhoto } from './shared';
import { Store, uid } from './store.service';

const CSS = `.top{display:flex;align-items:center;justify-content:space-between;padding:52px 20px 0}
  .top h1{margin:0;font-size:18px;font-weight:600;line-height:1.2;text-align:center}.top small{font-size:12px;color:#5C5F66}.sp{width:44px}
  .ib{width:44px;height:44px;border-radius:50%;background:#fff;border:1px solid #E6E4DD;font-size:20px;display:grid;place-items:center}
  main{display:flex;flex-direction:column;gap:20px;padding:24px 20px}
  label{font-size:13px;font-weight:600;color:#5C5F66}.hint{font-size:13px;color:#5C5F66;line-height:1.45}.f{display:flex;flex-direction:column;gap:8px}
  .in{height:52px;padding:0 16px;border:1px solid #D9D6CC;border-radius:14px;background:#fff;font-size:16px;color:#17181B;outline:0;width:100%}
  .in:focus{border:2px solid #17181B;padding:0 15px}
  .foot{display:flex;flex-direction:column;gap:10px;padding:12px 20px 28px;background:#F4F3EF}
  .dark,.out{display:flex;align-items:center;justify-content:center;font-weight:600;border-radius:28px}
  .dark{height:56px;border:0;background:#17181B;color:#fff;font-size:16px}.dark:disabled{opacity:.4}
  .out{height:52px;border:1.5px solid #17181B;background:transparent;color:#17181B;font-size:15px}.out:disabled{opacity:.4}
  .del{background:none;border:0;color:#B91C1C;font-size:14px;font-weight:600;padding:8px}`;

// ---------------- Add / edit shop ----------------
@Component({
  selector: 'app-shop-edit', standalone: false,
  template: `<ion-content>
    <div class="top"><button class="ib" aria-label="Cancel" (click)="close()"><ion-icon name="close"></ion-icon></button>
      <h1>{{ id ? 'Edit shop' : 'New shop' }}</h1><span class="sp"></span></div>
    <main><div class="f"><label for="n">Shop name</label>
      <input id="n" class="in big" type="text" placeholder="e.g. Malabar Kitchen" [(ngModel)]="name" />
      @if (!id) { <span class="hint">You can add its menu next.</span> }</div>
      @if (id) { <button class="del" (click)="del()">Delete shop and its items</button> }</main>
  </ion-content>
  <ion-footer><div class="foot"><button class="dark" [disabled]="!name.trim()" (click)="save()">Save shop</button></div></ion-footer>`,
  styles: [CSS + `.big{height:68px;padding:0 20px;border-radius:20px;font-size:24px;font-weight:600}.big:focus{padding:0 19px}`],
})
export class ShopEditPage {
  id = this.r.snapshot.paramMap.get('id') || '';
  name = this.s.shop(this.id)?.name || '';
  constructor(private s: Store, private r: ActivatedRoute, private nav: Router) {}
  close() { this.nav.navigate([this.id ? '/shop/' + this.id : '/tabs/shops']); }
  async save() {
    const id = this.id || uid();
    await this.s.saveShop({ id, name: this.name.trim() });
    this.nav.navigate(['/shop', id], { replaceUrl: true });
  }
  async del() { await this.s.deleteShop(this.id); this.nav.navigate(['/tabs/shops'], { replaceUrl: true }); }
}

// ---------------- Add / edit item ----------------
@Component({
  selector: 'app-item-edit', standalone: false,
  template: `<ion-content>
    <div class="top"><button class="ib" aria-label="Cancel" (click)="close()"><ion-icon name="close"></ion-icon></button>
      <div><h1>{{ id ? 'Edit item' : 'New item' }}</h1><small>{{ s.shop(shopId)?.name }}</small></div><span class="sp"></span></div>
    <main>
      <div class="photo">
        @if (photo) { <img [src]="photo" alt="" /> } @else { <div class="none"><ion-icon name="restaurant-outline"></ion-icon></div> }
        <button class="cam" aria-label="Change photo" (click)="f.click()"><ion-icon name="camera-outline"></ion-icon></button>
        <input #f type="file" accept="image/*" hidden (change)="pick($event)" />
      </div>
      <div class="f"><label for="n">Item name</label><input id="n" class="in" type="text" [(ngModel)]="name" /></div>
      <div class="f"><label for="p">Price</label>
        <div class="price"><span>₹</span><input id="p" type="number" inputmode="decimal" placeholder="0" [(ngModel)]="price" /></div>
        <span class="hint">Price of one serving. You pick how many each person had when you split a meal.</span></div>
      @if (id) { <button class="del" (click)="del()">Delete item</button> }
    </main>
  </ion-content>
  <ion-footer><div class="foot">
    @if (!id) { <button class="out" [disabled]="!ok()" (click)="save(true)">Save and add another</button> }
    <button class="dark" [disabled]="!ok()" (click)="save(false)">Save item</button></div></ion-footer>`,
  styles: [CSS + `
    .photo{position:relative;width:160px;height:160px;margin:0 auto}
    .photo img,.none{width:160px;height:160px;border-radius:32px;object-fit:cover;background:#E7E4DA;display:grid;place-items:center;font-size:48px;color:#8A877B}
    .cam{position:absolute;right:-8px;bottom:-8px;width:48px;height:48px;border-radius:50%;border:3px solid #F4F3EF;background:#17181B;color:#fff;font-size:20px;display:grid;place-items:center}
    .price{display:flex;align-items:center;gap:8px;height:72px;padding:0 18px;border:2px solid #17181B;border-radius:18px;background:#fff}
    .price span{font-size:28px;font-weight:600;color:#5C5F66}.price input{flex:1;min-width:0;border:0;outline:0;background:transparent;font-size:32px;font-weight:600;color:#17181B}
  `],
})
export class ItemEditPage {
  shopId = this.r.snapshot.paramMap.get('shopId')!;
  id = this.r.snapshot.paramMap.get('id') || '';
  name = this.s.item(this.id)?.name || '';
  price: number | null = this.s.item(this.id)?.price ?? null;
  photo = this.s.item(this.id)?.photo;
  constructor(public s: Store, private r: ActivatedRoute, private nav: Router) {}
  ok() { return !!this.name.trim() && this.price !== null && +this.price >= 0; }
  close() { this.nav.navigate(['/shop', this.shopId]); }
  async pick(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.photo = await resizePhoto(file);
  }
  async save(another: boolean) {
    await this.s.saveItem({ id: this.id || uid(), shopId: this.shopId, name: this.name.trim(), price: +this.price!, photo: this.photo });
    if (another) { this.name = ''; this.price = null; this.photo = undefined; }
    else this.nav.navigate(['/shop', this.shopId], { replaceUrl: true });
  }
  async del() { await this.s.deleteItem(this.id); this.nav.navigate(['/shop', this.shopId], { replaceUrl: true }); }
}
