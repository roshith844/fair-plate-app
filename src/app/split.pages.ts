import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Share as NativeShare } from '@capacitor/share';
import { Item, Store } from './store.service';

// ---------------- Step 1: the bill ----------------
@Component({
  selector: 'app-bill', standalone: false,
  template: `<ion-header><ion-toolbar><ion-title>New split</ion-title></ion-toolbar></ion-header>
  <ion-content class="ion-padding">
    <ion-item><ion-input label="Amount you paid (₹)" labelPlacement="stacked" type="number" inputmode="decimal"
      placeholder="Total on the bill, tax included" [(ngModel)]="s.amount"></ion-input></ion-item>

    <ion-list-header>Shop</ion-list-header>
    @if (!s.shops.length) { <p>Add a shop first in the Shops tab.</p> }
    <ion-radio-group [value]="s.shopId" (ionChange)="s.setShop($event.detail.value)">
      @for (sh of s.shops; track sh.id) { <ion-item><ion-radio [value]="sh.id">{{ sh.name }}</ion-radio></ion-item> }
    </ion-radio-group>

    <ion-list-header>Who was there ({{ s.present.length }})</ion-list-header>
    @for (p of s.people; track p.id) {
      <ion-item><app-avatar slot="start" [name]="p.name" [photo]="p.photo" [size]="36"></app-avatar>
        <ion-checkbox [checked]="s.present.includes(p.id)" (ionChange)="s.setPerson(p.id, $event.detail.checked)">{{ p.name }}</ion-checkbox></ion-item>
    }
    <ion-button expand="block" class="ion-margin-top" [disabled]="!ok()" (click)="next()">Next: who ate what</ion-button>
  </ion-content>`,
})
export class BillPage {
  constructor(public s: Store, private nav: Router) {}
  ok() { return (this.s.amount || 0) > 0 && !!this.s.shopId && this.s.present.length > 0; }
  next() { this.nav.navigate(['/split-items']); }
}

// ---------------- Step 2: who ate what ----------------
@Component({
  selector: 'app-split-items', standalone: false,
  template: `<ion-header><ion-toolbar><ion-buttons slot="start"><ion-back-button defaultHref="/tabs/split"></ion-back-button></ion-buttons>
    <ion-title>Who ate what</ion-title></ion-toolbar>
    <ion-toolbar><ion-segment scrollable [value]="cur" (ionChange)="cur = $any($event.detail.value)">
      @for (id of s.present; track id) {
        <ion-segment-button [value]="id"><ion-label>{{ s.person(id)?.name }}<br />₹{{ s.subtotal(id) | number:'1.0-0' }}</ion-label></ion-segment-button>
      }</ion-segment></ion-toolbar></ion-header>

  <ion-content>
    <ion-list>@for (i of items(); track i.id) {
      <ion-item>
        <app-avatar slot="start" [name]="i.name" [photo]="i.photo" [size]="40"></app-avatar>
        <ion-label>{{ i.name }}<p>₹{{ i.price }}@if (s.sharedIds(i.id).length) { · shared by {{ s.sharedIds(i.id).length }} }</p></ion-label>
        <ion-button slot="end" fill="clear" size="small" aria-label="Share this dish" (click)="openShare(i)"><ion-icon slot="icon-only" name="people-outline"></ion-icon></ion-button>
        <ion-button slot="end" fill="outline" size="small" aria-label="Remove one" [disabled]="!s.getQty(cur, i.id)" (click)="s.addQty(cur, i.id, -1)"><ion-icon slot="icon-only" name="remove"></ion-icon></ion-button>
        <strong slot="end" style="min-width:18px;text-align:center">{{ s.getQty(cur, i.id) }}</strong>
        <ion-button slot="end" size="small" aria-label="Add one" (click)="s.addQty(cur, i.id, 1)"><ion-icon slot="icon-only" name="add"></ion-icon></ion-button>
      </ion-item>
    }</ion-list>
    @if (!items().length) { <p class="ion-padding">This shop has no items. Add some in the Shops tab.</p> }
  </ion-content>

  <ion-footer><ion-toolbar>
    <ion-title size="small">Items ₹{{ s.itemsTotal() | number:'1.0-2' }} · Bill ₹{{ s.amount }}</ion-title>
    <ion-buttons slot="end"><ion-button fill="solid" color="dark" [disabled]="!s.itemsTotal()" (click)="done()">Split it</ion-button></ion-buttons>
  </ion-toolbar></ion-footer>

  <ion-modal [isOpen]="!!sharing" (didDismiss)="sharing = null" [initialBreakpoint]="0.6" [breakpoints]="[0, 0.6, 0.9]">
    <ng-template>
      <ion-header><ion-toolbar><ion-title>Share {{ sharing?.name }} (₹{{ sharing?.price }})</ion-title>
        <ion-buttons slot="end"><ion-button (click)="applyShare()">Done</ion-button></ion-buttons></ion-toolbar></ion-header>
      <ion-content class="ion-padding">
        <p>Split equally between the people who shared it.</p>
        @for (id of s.present; track id) {
          <ion-item><app-avatar slot="start" [name]="s.person(id)?.name || ''" [photo]="s.person(id)?.photo" [size]="36"></app-avatar>
            <ion-checkbox [checked]="picked.includes(id)" (ionChange)="toggle(id, $event.detail.checked)">{{ s.person(id)?.name }}</ion-checkbox>
            <ion-note slot="end">{{ picked.includes(id) ? '₹' + ((sharing?.price || 0) / picked.length | number:'1.0-2') : '–' }}</ion-note></ion-item>
        }
      </ion-content>
    </ng-template>
  </ion-modal>`,
})
export class SplitItemsPage {
  cur = this.s.present[0] || '';
  sharing: Item | null = null;
  picked: string[] = [];
  constructor(public s: Store, private nav: Router) {}
  items() { return this.s.shopItems(this.s.shopId); }
  openShare(i: Item) { this.picked = [...this.s.sharedIds(i.id)]; this.sharing = i; }
  toggle(id: string, on: boolean) { this.picked = on ? [...new Set([...this.picked, id])] : this.picked.filter(p => p !== id); }
  applyShare() { if (this.sharing) this.s.setShared(this.sharing.id, this.picked); this.sharing = null; }
  done() { this.nav.navigate(['/split-result']); }
}

// ---------------- Step 3: who pays what ----------------
@Component({
  selector: 'app-split-result', standalone: false,
  template: `<ion-header><ion-toolbar><ion-buttons slot="start"><ion-back-button defaultHref="/split-items"></ion-back-button></ion-buttons>
    <ion-title>Who pays what</ion-title></ion-toolbar></ion-header>
  <ion-content class="ion-padding">
    <h2>{{ s.shop(s.shopId)?.name }} · ₹{{ s.amount }}</h2>
    <p>Items ₹{{ s.itemsTotal() | number:'1.0-2' }} · Tax and extras {{ s.extras() >= 0 ? '+' : '−' }} ₹{{ abs(s.extras()) | number:'1.0-2' }}
      (split in proportion to items)</p>
    <ion-list>@for (x of shares; track x.person.id) {
      <ion-item><app-avatar slot="start" [name]="x.person.name" [photo]="x.person.photo"></app-avatar>
        <ion-label>{{ x.person.name }}<p>{{ x.lines.join(', ') || 'Nothing selected' }}</p></ion-label>
        <ion-label slot="end" class="ion-text-end"><strong>₹{{ x.total }}</strong><p>₹{{ x.items | number:'1.0-2' }} + ₹{{ x.extras | number:'1.0-2' }}</p></ion-label></ion-item>
    }</ion-list>
    <ion-button expand="block" class="ion-margin-top" (click)="share()"><ion-icon slot="start" name="share-social-outline"></ion-icon>Share summary</ion-button>
    <ion-button expand="block" fill="outline" (click)="again()">Start a new split</ion-button>
  </ion-content>`,
})
export class SplitResultPage {
  shares = this.s.calc();
  constructor(public s: Store, private nav: Router) {}
  abs = Math.abs;
  text() {
    return `${this.s.shop(this.s.shopId)?.name} · ₹${this.s.amount}\n` + this.shares.map(x => `${x.person.name}: ₹${x.total}`).join('\n');
  }
  async share() {
    try { await NativeShare.share({ title: 'Split', text: this.text() }); }
    catch { await navigator.clipboard?.writeText(this.text()); }
  }
  again() { this.s.resetDraft(); this.nav.navigate(['/tabs/split'], { replaceUrl: true }); }
}

export const SPLIT = [BillPage, SplitItemsPage, SplitResultPage];
