import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

export interface Shop { id: string; name: string; }
export interface Item { id: string; shopId: string; name: string; price: number; photo?: string; }
export interface Person { id: string; name: string; photo?: string; }
export interface Shared { itemId: string; personIds: string[]; }
export interface Share { person: Person; items: number; extras: number; total: number; lines: string[]; }

const KEY = 'fair-plate-data';
export const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36);

/** All app data lives on the device (Capacitor Preferences: native storage on phones, localStorage in the browser). */
@Injectable({ providedIn: 'root' })
export class Store {
  shops: Shop[] = [];
  items: Item[] = [];
  people: Person[] = [];

  // Draft of the split being created (not persisted)
  amount: number | null = null;
  shopId = '';
  present: string[] = [];
  qty: Record<string, Record<string, number>> = {};
  shared: Shared[] = [];

  async load() {
    const { value } = await Preferences.get({ key: KEY });
    if (value) {
      const d = JSON.parse(value);
      this.shops = d.shops || [];
      this.items = d.items || [];
      this.people = d.people || [];
    }
    if (!this.people.length) {
      this.people = [{ id: uid(), name: 'You' }];
      await this.save();
    }
  }

  private save() {
    return Preferences.set({
      key: KEY,
      value: JSON.stringify({ shops: this.shops, items: this.items, people: this.people }),
    });
  }

  // ---------- shops / items / people ----------
  private upsert<T extends { id: string }>(list: T[], x: T) {
    const i = list.findIndex(y => y.id === x.id);
    i >= 0 ? (list[i] = x) : list.push(x);
    return this.save();
  }
  saveShop(s: Shop) { return this.upsert(this.shops, s); }
  saveItem(i: Item) { return this.upsert(this.items, i); }
  savePerson(p: Person) { return this.upsert(this.people, p); }
  deleteShop(id: string) {
    this.shops = this.shops.filter(s => s.id !== id);
    this.items = this.items.filter(i => i.shopId !== id);
    return this.save();
  }
  deleteItem(id: string) { this.items = this.items.filter(i => i.id !== id); return this.save(); }
  deletePerson(id: string) { this.people = this.people.filter(p => p.id !== id); return this.save(); }
  shop(id: string) { return this.shops.find(s => s.id === id); }
  shopItems(shopId: string) { return this.items.filter(i => i.shopId === shopId); }
  item(id: string) { return this.items.find(i => i.id === id); }
  person(id: string) { return this.people.find(p => p.id === id); }

  // ---------- split draft ----------
  resetDraft() { this.amount = null; this.shopId = ''; this.present = []; this.qty = {}; this.shared = []; }
  setShop(id: string) {
    if (id !== this.shopId) { this.qty = {}; this.shared = []; }
    this.shopId = id;
  }
  setPerson(id: string, on: boolean) {
    const has = this.present.includes(id);
    if (on && !has) this.present.push(id);
    if (!on && has) {
      this.present = this.present.filter(p => p !== id);
      delete this.qty[id];
      this.shared.forEach(s => (s.personIds = s.personIds.filter(p => p !== id)));
      this.shared = this.shared.filter(s => s.personIds.length);
    }
  }
  getQty(pid: string, iid: string) { return this.qty[pid]?.[iid] || 0; }
  addQty(pid: string, iid: string, d: number) {
    const q = Math.max(0, this.getQty(pid, iid) + d);
    (this.qty[pid] ??= {})[iid] = q;
    if (!q) delete this.qty[pid][iid];
  }
  sharedIds(iid: string) { return this.shared.find(s => s.itemId === iid)?.personIds || []; }
  setShared(iid: string, ids: string[]) {
    this.shared = this.shared.filter(s => s.itemId !== iid);
    if (ids.length) this.shared.push({ itemId: iid, personIds: ids });
  }

  /** Items value for one person (own items + their part of shared dishes). */
  subtotal(pid: string) {
    let t = 0;
    for (const [iid, n] of Object.entries(this.qty[pid] || {})) t += n * (this.item(iid)?.price || 0);
    for (const s of this.shared) if (s.personIds.includes(pid)) t += (this.item(s.itemId)?.price || 0) / s.personIds.length;
    return t;
  }
  itemsTotal() { return this.present.reduce((a, p) => a + this.subtotal(p), 0); }
  extras() { return (this.amount || 0) - this.itemsTotal(); }

  /** Extras (tax, service, discount) are shared in proportion to what each person ate; rounded to whole units so the shares add up to the bill. */
  calc(): Share[] {
    const T = this.itemsTotal(), extras = this.extras(), bill = this.amount || 0;
    const shares = this.present.map(pid => {
      const sub = this.subtotal(pid);
      const ex = T ? (extras * sub) / T : 0;
      const lines: string[] = [];
      for (const [iid, n] of Object.entries(this.qty[pid] || {})) lines.push(this.item(iid)!.name + (n > 1 ? ' ×' + n : ''));
      for (const s of this.shared) if (s.personIds.includes(pid)) lines.push(`${this.item(s.itemId)!.name} (1/${s.personIds.length})`);
      return { person: this.person(pid)!, items: sub, extras: ex, total: Math.round(sub + ex), lines };
    });
    if (T && shares.length) {
      const diff = Math.round(bill) - shares.reduce((a, s) => a + s.total, 0);
      shares.reduce((m, s) => (s.items > m.items ? s : m)).total += diff;
    }
    return shares;
  }
}
