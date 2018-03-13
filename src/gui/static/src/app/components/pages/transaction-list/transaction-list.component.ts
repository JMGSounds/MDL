import { Component, OnDestroy, OnInit } from '@angular/core';
import { WalletService } from '../../../services/wallet.service';
import { Subscription } from 'rxjs/Subscription';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { TransactionDetailComponent } from './transaction-detail/transaction-detail.component';
import { Transaction } from '../../../app.datatypes';

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss']
})
export class TransactionListComponent implements OnInit, OnDestroy {
  transactions: any[];

  private priceSubscription: Subscription;

  constructor(
    private dialog: MatDialog,
    private walletService: WalletService,
  ) { }

  ngOnInit() {
    this.walletService.transactions().subscribe(transactions => this.transactions = transactions);
  }

  ngOnDestroy() {
    this.priceSubscription.unsubscribe();
  }

  showTransaction(transaction: Transaction) {
    const config = new MatDialogConfig();
    config.width = '566px';
    config.data = transaction;
    this.dialog.open(TransactionDetailComponent, config).afterClosed().subscribe();
  }
}
