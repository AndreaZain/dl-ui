import { inject } from 'aurelia-framework';
import { Service } from "./service";
import { Router } from 'aurelia-router';
import moment from 'moment';

@inject(Router, Service)
export class List {
  context = ["Rincian"]

  columns = [
    { field: "PRNo", title: "Nomor PR" },
    {
      field: "Date", title: "Tanggal Validasi", formatter: function (value, data, index) {
        return value ? moment(value).format("DD MMM YYYY") : "-";
      }
    },
    { field: "RONo", title: "Nomor RO" },
    { field: "BuyerCode", title: "Kode Buyer" },
    { field: "BuyerName", title: "Nama Buyer" },
    { field: "Article", title: "Artikel" },
    {
      field: "ShipmentDate", title: "Tanggal Shipment", formatter: function (value, data, index) {
        return moment(value).format("DD MMM YYYY");
      }
    },
    { field: "Status", title: "Status Validasi" }
  ];

  rowFormatter(data, index) {
    if (data.Status === "SUDAH")
      return { classes: "success" }
    else
      return { classes: "danger" }
  }

  loader = (info) => {
    var order = {};
    if (info.sort)
      order[info.sort] = info.order;
    var arg = {
      page: parseInt(info.offset / info.limit, 10) + 1,
      size: info.limit,
      keyword: info.search,
      // select: ["PRNo", "RONo", "ShipmentDate", "Buyer.Name", "Unit.Name", "IsPosted"],
      order: order
    }

    return this.service.search(arg)
      .then(result => {
        for (const data of result.data) {
          data.BuyerCode = data.Buyer.Code;
          data.BuyerName = data.Buyer.Name;
          if (data.PRType == "MASTER" || data.PRType == "SAMPLE") {
            data.Status = (data.IsValidatedMD1 && data.IsValidatedMD2 && data.IsValidatedPurchasing) ? "SUDAH" : "BELUM";
            if (data.Status === "SUDAH") {
              data.Date = data.ValidatedMD2Date;
            } else {
              data.Date = null;
            }
          } else {
            data.Status = "SUDAH";
          }
        }
        return {
          total: result.info.total,
          data: result.data
        }
      });
  }

  constructor(router, service) {
    this.service = service;
    this.router = router;
  }

  contextClickCallback(event) {
    var arg = event.detail;
    var data = arg.data;
    switch (arg.name) {
      case "Rincian":
        this.router.navigateToRoute('view', { id: data.Id });
        break;
    }
  }

}
