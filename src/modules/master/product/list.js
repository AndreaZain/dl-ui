import { inject } from 'aurelia-framework';
import { Service } from "./service";
import { Router } from 'aurelia-router';

@inject(Router, Service)
export class List {
    // data = [];
    // info = { page: 1, keyword: '' };
    context = ["detail"];
    columns = [
    { field: "Code", title: "Kode Barang" },
    { field: "Name", title: "Nama Barang" },
    { field: "Uom.Unit", title: "Satuan Default" },
    { field: "Currency.Code", title: "Mata Uang" },
    { field: "Price", title: "Harga Barang" },
    { field: "Tags", title: "Tags" },
  ];

  loader = (info) => {
    var order = {};
    if (info.sort)
      order[info.sort] = info.order;

    var arg = {
      page: parseInt(info.offset / info.limit, 10) + 1,
      size: info.limit,
      keyword: info.search,
      order: order
    }

    return this.service.search(arg)
      .then(result => {
        return {
          total: result.info.total,
          data: result.data
        }
      });
  }

    constructor(router, service) {
        this.service = service;
        this.router = router;
        this.accessoriesId = "";
        this.accessories = [];
    }

    contextCallback(event) {
    var arg = event.detail;
    var data = arg.data;
    switch (arg.name) {
      case "detail":
        this.router.navigateToRoute('view', { id: data.Id });
        break;
    }
  }
}
