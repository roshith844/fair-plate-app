import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsComponent } from './shared';
import { BillPage, SplitItemsPage, SplitResultPage } from './split.pages';
import { ItemEditPage, PeoplePage, PersonEditPage, ShopEditPage, ShopMenuPage, ShopsPage } from './catalog.pages';

const routes: Routes = [
  {
    path: 'tabs', component: TabsComponent,
    children: [
      { path: 'split', component: BillPage },
      { path: 'shops', component: ShopsPage },
      { path: 'people', component: PeoplePage },
      { path: '', redirectTo: 'split', pathMatch: 'full' },
    ],
  },
  { path: 'split-items', component: SplitItemsPage },
  { path: 'split-result', component: SplitResultPage },
  { path: 'shop/:id', component: ShopMenuPage },
  { path: 'shop-edit', component: ShopEditPage },
  { path: 'shop-edit/:id', component: ShopEditPage },
  { path: 'item-edit/:shopId', component: ItemEditPage },
  { path: 'item-edit/:shopId/:id', component: ItemEditPage },
  { path: 'person-edit', component: PersonEditPage },
  { path: 'person-edit/:id', component: PersonEditPage },
  { path: '', redirectTo: 'tabs', pathMatch: 'full' },
];

@NgModule({ imports: [RouterModule.forRoot(routes)], exports: [RouterModule] })
export class AppRoutingModule {}
