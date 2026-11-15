import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Item, Store } from './store.service';

/** Step 2 of 3: tap a person, then add what they ate. Shared dishes open a sheet. */
@Component({
  selector: 'app-split-items', standalone: false,
  template: `<ion-content>
    <div class="top"><button class="back" aria-label="Back" (click)="back()"><ion-icon name="chevron-back"></ion-icon></button><h1>Who ate what</h1><span class="sp"></span></div>
    <div class="bar"><span class="on"></span><span class="on"></span><span></span></div>
    <p class="step">Step 2 of 3 · {{ s.shop(s.shopId)?.name }}</p>

    <div class="tabs">
      @for (id of s.present; track id) {
        <button type="button" class="pt" [class.sel]="cur === id" (click)="cur = id">
          <app-avatar [name]="s.person(id)?.name || ''" [photo]="s.person(id)?.photo" [size]="44"></app-avatar>
          <b>{{ s.person(id)?.name }}</b><small>₹{{ s.subtotal(id) | number:'1.0-0' }}</small>
        </button>
      }
    </div>

    <div class="plate"><h2>{{ s.person(cur)?.name }}’s plate</h2>
      <span>{{ count() }} items · <b>₹{{ s.subtotal(cur) | number:'1.0-0' }}</b></span></div>

    <div class="list">
      @for (i of items(); track i.id) {
        <div class="it" [class.on]="s.getQty(cur, i.id) || shares(i, cur)">
          @if (i.photo) { <img [src]="i.photo" alt="" class="ph" /> } @else { <app-mono [name]="i.name"></app-mono> }
          <div class="tx"><b>{{ i.name }}</b><small>₹{{ i.price }}@if (s.sharedIds(i.id).length) { · shared by {{ s.sharedIds(i.id).length }} }</small></div>
          <button class="ic" [attr.aria-label]="'Split ' + i.name + ' with others'" (click)="openShare(i)"><ion-icon name="people-outline"></ion-icon></button>
          @if (s.getQty(cur, i.id)) {
            <div class="st"><button aria-label="Remove one" (click)="s.addQty(cur, i.id, -1)"><ion-icon name="remove"></ion-icon></button>
              <b>{{ s.getQty(cur, i.id) }}</b><button aria-label="Add one" (click)="s.addQty(cur, i.id, 1)"><ion-icon name="add"></ion-icon></button></div>
          } @else {
            <button class="ad" [attr.aria-label]="'Add ' + i.name" (click)="s.addQty(cur, i.id, 1)"><ion-icon name="add"></ion-icon></button>
          }
        </div>
      }
      @if (!items().length) { <p class="empty">This shop has no items. Add some in the Shops tab.</p> }
    </div>
  </ion-content>

  <ion-footer class="foot"><div>
    <small>Items so far</small><strong>₹{{ s.itemsTotal() | number:'1.0-0' }}</strong><small>Bill ₹{{ s.amount }} · ₹{{ s.extras() | number:'1.0-0' }} extras</small></div>
    <button class="go" [disabled]="!s.itemsTotal()" (click)="done()">Split it<ion-icon name="arrow-forward"></ion-icon></button>
  </ion-footer>

  <ion-modal [isOpen]="!!sharing" (didDismiss)="sharing = null" [initialBreakpoint]="0.62" [breakpoints]="[0, 0.62]" class="sheet">
    <ng-template><div class="sh">
      <div class="shh">@if (sharing?.photo) { <img [src]="sharing?.photo" alt="" class="ph big" /> } @else { <app-mono [name]="sharing?.name || ''" [size]="52"></app-mono> }
        <div><h2>{{ sharing?.name }}</h2><span>₹{{ sharing?.price }}</span></div></div>
      <p class="lb">Shared between<b>{{ picked.length }} people</b></p>
      <div class="grid">@for (id of s.present; track id) {
        <button type="button" class="pp" [class.sel]="picked.includes(id)" (click)="toggle(id)">
          <app-avatar [name]="s.person(id)?.name || ''" [photo]="s.person(id)?.photo" [size]="52"></app-avatar>
          <span>{{ s.person(id)?.name }}</span>
          <small>{{ picked.includes(id) ? '₹' + ((sharing?.price || 0) / picked.length | number:'1.0-2') : '–' }}</small>
          @if (picked.includes(id)) { <i class="ck"><ion-icon name="checkmark"></ion-icon></i> }
        </button>}</div>
      @if (picked.length) { <div class="eq">₹{{ sharing?.price }} ÷ {{ picked.length }} people = <b>₹{{ (sharing?.price || 0) / picked.length | number:'1.0-2' }} each</b></div> }
      <button class="go dark" (click)="applyShare()">Add to split</button>
    </div></ng-template>
  </ion-modal>`,
  styles: [`
    .top{display:flex;align-items:center;justify-content:space-between;padding:52px 20px 0}.top h1{margin:0;font-size:18px;font-weight:600}.sp{width:44px}
    .back{width:44px;height:44px;border-radius:50%;background:#fff;border:1px solid #E6E4DD;font-size:20px;display:grid;place-items:center}
    .bar{display:flex;gap:6px;margin:14px 20px 0}.bar span{flex:1;height:4px;border-radius:2px;background:#DAD7CD}.bar .on{background:#C2410C}
    .step{margin:8px 20px 10px;font-size:12px;font-weight:600;color:#5C5F66}
    .tabs{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(76px,1fr);gap:4px;margin:0 20px;overflow-x:auto}
    .pt{display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 0;border-radius:18px;background:transparent;border:2px solid transparent;color:#17181B}
    .pt.sel{background:#fff;border-color:#17181B}.pt b{font-size:13px;margin-top:4px}.pt small{font-size:12px;font-weight:600;color:#5C5F66}.pt.sel small{color:#C2410C}
    .plate{display:flex;align-items:baseline;justify-content:space-between;margin:16px 24px 8px}.plate h2{margin:0;font-size:18px}.plate span{font-size:13px;color:#5C5F66}.plate b{color:#17181B;font-size:16px}
    .list{margin:0 20px 16px;background:#fff;border:1px solid #E6E4DD;border-radius:20px;overflow:hidden}
    .it{display:flex;align-items:center;gap:10px;padding:10px 12px;min-height:68px}.it+.it{border-top:1px solid #EFEDE6}.it.on{background:#FFF6EE}
    .ph{width:44px;height:44px;border-radius:12px;object-fit:cover}.ph.big{width:52px;height:52px}
    .tx{flex:1;min-width:0}.tx b{display:block;font-size:15px;line-height:1.2}.tx small{display:block;font-size:13px;color:#5C5F66;margin-top:2px}
    .ic{width:40px;height:44px;background:none;border:0;color:#5C5F66;font-size:22px}
    .st{display:flex;align-items:center;height:44px;border-radius:22px;background:#C2410C;color:#fff}.st button{width:36px;height:44px;background:none;border:0;color:#fff;font-size:18px}.st b{width:18px;text-align:center}
    .ad{width:44px;height:44px;border-radius:50%;border:1.5px solid #17181B;background:#fff;font-size:20px;display:grid;place-items:center}
    .empty{padding:16px}
    .foot{display:flex;align-items:center;justify-content:space-between;padding:14px 20px 24px;background:#fff;border-top:1px solid #E6E4DD}
    .foot small{display:block;font-size:12px;color:#5C5F66}.foot strong{display:block;font-size:24px}
    .go{height:52px;padding:0 20px 0 24px;border-radius:26px;background:#17181B;color:#fff;font-size:15px;font-weight:600;display:flex;align-items:center;gap:8px;border:0}.go:disabled{opacity:.4}
    .sh{padding:12px 20px 28px;display:flex;flex-direction:column;gap:14px}.shh{display:flex;align-items:center;gap:12px}.shh h2{margin:0;font-size:20px}.shh span{color:#5C5F66}
    .lb{display:flex;justify-content:space-between;margin:0;font-size:13px;font-weight:600;color:#5C5F66}.lb b{color:#17181B}
    .grid{display:grid;grid-template-columns:repeat(4,1fr);justify-items:center;row-gap:12px}
    .pp{position:relative;width:76px;display:flex;flex-direction:column;align-items:center;gap:4px;background:none;border:0;padding:0;font-size:13px;font-weight:600;color:#5C5F66}
    .pp small{font-weight:700;font-size:14px;color:#5C5F66}.pp app-avatar{opacity:.55}.pp.sel,.pp.sel small{color:#17181B}.pp.sel app-avatar{opacity:1;border-radius:50%;box-shadow:0 0 0 2px #fff,0 0 0 4px #17181B}
    .ck{position:absolute;top:34px;right:6px;width:20px;height:20px;border-radius:50%;background:#C2410C;color:#fff;display:grid;place-items:center;font-size:12px}
    .eq{background:#F4F3EF;border-radius:14px;padding:12px 16px;text-align:center;font-size:14px}
    .go.dark{justify-content:center;height:56px;border-radius:28px;padding:0}
  `],
})
export class SplitItemsPage {
  cur = this.s.present[0] || '';
  sharing: Item | null = null;
  picked: string[] = [];
  constructor(public s: Store, private nav: Router) {}
  items() { return this.s.shopItems(this.s.shopId); }
  shares(i: Item, pid: string) { return this.s.sharedIds(i.id).includes(pid); }
  count() {
    return Object.values(this.s.qty[this.cur] || {}).reduce((a, n) => a + n, 0) + this.s.shared.filter(x => x.personIds.includes(this.cur)).length;
  }
  openShare(i: Item) { this.picked = [...this.s.sharedIds(i.id)]; this.sharing = i; }
  toggle(id: string) { this.picked = this.picked.includes(id) ? this.picked.filter(p => p !== id) : [...this.picked, id]; }
  applyShare() { if (this.sharing) this.s.setShared(this.sharing.id, this.picked); this.sharing = null; }
  back() { this.nav.navigate(['/tabs/split']); }
  done() { this.nav.navigate(['/split-result']); }
}
