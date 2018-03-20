import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { PurchaseOrder, TellerConfig, Wallet } from '../app.datatypes';
import { WalletService } from './wallet.service';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { Http } from '@angular/http';
import 'rxjs/add/operator/timeout';

@Injectable()
export class PurchaseService {

  private configSubject: Subject<TellerConfig> = new BehaviorSubject<TellerConfig>(null);
  private purchaseOrders: Subject<any[]> = new BehaviorSubject<any[]>([]);
  private purchaseUrl = environment.tellerUrl;

  constructor(
    private http: Http,
    private walletService: WalletService,
  ) {
    this.getConfig();
  }

  all() {
    return this.purchaseOrders.asObservable();
  }

  config(): Observable<TellerConfig> {
    return this.configSubject.asObservable();
  }

  getConfig() {
    return this.get('config')
      .map((response: any) => ({
        enabled: response.enabled,
        mdl_btc_exchange_rate: parseFloat(response.mdl_btc_exchange_rate),
        mdl_eth_exchange_rate: parseFloat(response.mdl_eth_exchange_rate),
        mdl_sky_exchange_rate: parseFloat(response.mdl_sky_exchange_rate),
        mdl_waves_exchange_rate: parseFloat(response.mdl_waves_exchange_rate),
        max_bound_addrs: parseFloat(response.max_bound_addrs),
        supported: response.supported,
        available: parseFloat(response.available),
      }))
      .subscribe(response => this.configSubject.next(response));
  }

  refreshConfig() {
    return this.get('config')
      .map((response: any) => ({
        enabled: response.enabled,
        mdl_btc_exchange_rate: parseFloat(response.mdl_btc_exchange_rate),
        mdl_eth_exchange_rate: parseFloat(response.mdl_eth_exchange_rate),
        mdl_sky_exchange_rate: parseFloat(response.mdl_sky_exchange_rate),
        mdl_waves_exchange_rate: parseFloat(response.mdl_waves_exchange_rate),
        max_bound_addrs: parseFloat(response.max_bound_addrs),
        supported: response.supported,
        available: parseFloat(response.available),
      }));
  }

  generate(wallet: Wallet, coin_type: string): Observable<PurchaseOrder> {
    return this.walletService.addAddress(wallet).flatMap(address => {
      return this.post('bind', { mdladdr: address.address, coin_type: coin_type })
        .map(response => ({
          coin_type: response.coin_type,
          deposit_address: response.deposit_address,
          filename: wallet.filename,
          recipient_address: address.address,
          status: 'waiting_deposit',
        }))
    })
  }

  scan(address: string) {
    return this.get('status?mdladdr=' + address)
      .map((response: any) => {
        if (!response.statuses || response.statuses.length > 1) {
          throw new Error('too many purchase orders found');
        }
        return response.statuses[0];
      });
  }


  private get(url) {
    return this.http.get(this.purchaseUrl + url).timeout(15000)
      .map((res: any) => res.json())
  }

  private post(url, parameters = {}) {
    return this.http.post(this.purchaseUrl + url, parameters).timeout(15000)
      .map((res: any) => res.json())
  }

}
