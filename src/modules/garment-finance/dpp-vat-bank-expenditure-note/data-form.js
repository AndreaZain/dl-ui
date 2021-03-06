import { inject, bindable, computedFrom } from 'aurelia-framework';
import { Service } from './service';
import { PurchasingService } from './purchasing-service';
import moment from 'moment';

const BankLoader = require('../shared/bank-account-loader');
const SupplierLoader = require('../shared/garment-supplier-loader');
const CurrencyLoader = require('../shared/garment-currency-loader');

@inject(Service, PurchasingService)
export class DataForm {
    @bindable title;
    @bindable readOnly;

    formOptions = {
        cancelText: "Kembali",
        saveText: "Simpan",
        deleteText: "Hapus",
        editText: "Ubah",
    };

    controlOptions = {
        label: {
            length: 4,
        },
        control: {
            length: 4,
        },
    };

    constructor(service, purchasingService) {
        this.service = service;
        this.purchasingService = purchasingService;
    }

    bind(context) {
        this.context = context;
        this.data = this.context.data;
        this.error = this.context.error;

        console.log(this);

        this.isNotEditable = this.context.isNotEditable;

        this.cancelCallback = this.context.cancelCallback;

        this.saveCallback = this.context.saveCallback;

        if (!this.data.IsPosted) {
            this.deleteCallback = this.context.deleteCallback;
            this.editCallback = this.context.editCallback;
        }

        if (!this.readOnly) {
            this.collection = {
                columns: ['__check', 'No NI', 'Tanggal NI', 'Tanggal Jatuh Tempo', 'Supplier', 'PPN', 'PPh', 'Total Harga ((DPP + PPN) - PPh)', 'Mata Uang', 'Total Outstanding', '']
            };
        } else {
            this.collection = {
                columns: ['No NI', 'Tanggal NI', 'Tanggal Jatuh Tempo', 'Supplier', 'PPN', 'PPh', 'Total Harga ((DPP + PPN) - PPh)', 'Mata Uang', 'Total Outstanding', '']
            };
        }

        this.bankAccount = this.data.Bank || null;
        this.currency = this.data.Currency || null;
        this.supplier = this.data.Supplier || null;
    }

    onCheckAll(event) {
        for (var item of this.data.Items) {
            item.Select = event.detail.target.checked;
            for (var itemInvoice of item.InternalNote.Items) {
                itemInvoice.SelectInvoice = event.detail.target.checked;
            }
        }
    }

    get bankLoader() {
        return BankLoader;
    }

    get currencyLoader() {
        return CurrencyLoader;
    }

    get supplierLoader() {
        return SupplierLoader;
    }

    bankView = (bank) => {
        return bank.BankName + " " + bank.Currency.Code + " - " + bank.AccountNumber
    }

    @bindable bankAccount;
    bankAccountChanged(newValue, oldValue) {
        this.data.Bank = newValue;
    }

    @bindable currency;
    async currencyChanged(newValue, oldValue) {
        this.data.Currency = newValue;

        if (newValue) {
            if (this.supplier && !this.readOnly) {
                let newItems = await this.purchasingService.dppVATBankExpenditureNotes({ supplierId: newValue.Id, currencyId: this.currency.Id })
                    .then((items) => {
                        return items.map((item) => {
                            item.Id = 0;
                            item.InternalNote.Items = item.InternalNote.Items.map((internalNoteItem) => {
                                internalNoteItem.Id = 0;
                                return internalNoteItem;
                            })

                            return item;
                        })
                    });

                if (newItems) {
                    this.data.Items = this.data.Items.map((item) => {
                        var newItem = newItems.find((element => element.InternalNote.Id == item.InternalNote.Id));

                        if (newItem) {
                            item.InternalNote.Items = item.InternalNote.Items.concat(newItem.InternalNote.Items)
                        }

                        return item;
                    })

                    let items = newItems.filter((element) => {
                        let exist = this.data.Items.find((item) => item.InternalNote.Id == element.InternalNote.Id);

                        return !exist
                    });
                    this.data.Items = this.data.Items.concat(items);
                }
            }
        } else {
            this.data.Items = [];
        }
    }

    @bindable supplier;
    async supplierChanged(newValue, oldValue) {
        this.data.Supplier = newValue;

        if (newValue) {
            if (this.currency && !this.readOnly) {
                let newItems = await this.purchasingService.dppVATBankExpenditureNotes({ supplierId: newValue.Id, currencyId: this.currency.Id })
                    .then((items) => {
                        return items.map((item) => {
                            item.Id = 0;
                            item.InternalNote.Items = item.InternalNote.Items.map((internalNoteItem) => {
                                internalNoteItem.Id = 0;
                                return internalNoteItem;
                            })

                            return item;
                        })
                    });

                if (newItems) {
                    this.data.Items = this.data.Items.map((item) => {
                        var newItem = newItems.find((element => element.InternalNote.Id == item.InternalNote.Id));

                        if (newItem) {
                            item.InternalNote.Items = item.InternalNote.Items.concat(newItem.InternalNote.Items)
                        }

                        return item;
                    })

                    let items = newItems.filter((element) => {
                        let exist = this.data.Items.find((item) => item.InternalNote.Id == element.InternalNote.Id);

                        return !exist
                    });
                    this.data.Items = this.data.Items.concat(items);
                }

            }
        } else {
            this.data.Items = [];
        }
    }
}
