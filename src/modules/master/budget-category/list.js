import { inject } from "aurelia-framework";
import { Service } from "./service";
import { Router } from "aurelia-router";

@inject(Router, Service)
export class List {
  // data = [];
  // info = { page: 1, keyword: '' };
  context = ["detail"];
  columns = [
    { field: "Code", title: "Kode" },
    { field: "Name", title: "Nama" },
    // { field: "AccountingCategory.Name", title: "Kategori Pembukuan" },
  ];

  /*
  loader = (info) => {
    var order = {};
    if (info.sort) order[info.sort] = info.order;

    var arg = {
      page: parseInt(info.offset / info.limit, 10) + 1,
      size: info.limit,
      keyword: info.search,
      select: ["Code", "Name"],
      order: order,
    };

    return this.service.search(arg).then((result) => {
      return {
        total: result.info.total,
        data: result.data,
      };
    });
  };
  */

  loader = (info) => {
    var order = {};
    if (info.sort) order[info.sort] = info.order;

    var arg = {
      page: parseInt(info.offset / info.limit, 10) + 1,
      size: info.limit,
      keyword: info.search,
      select: ["Code", "Name"],
      order: order,
    };

    return this.service.search(arg).then((result) => {
      var resultPromise = [];
      if (result && result.data && result.data.length > 0) {
        resultPromise = result.data.map((datum) => {
          // if (datum.AccountingCategoryId !== 0) {
          //   return this.service
          //     .getAccountingCategory(datum.AccountingCategoryId)
          //     .then((ac) => {
          //       datum.AccountingCategory = ac;
          //       return Promise.resolve(datum);
          //     });
          // } else {
          //   return Promise.resolve(datum);
          // }
          return Promise.resolve(datum);
        });
      }
      return Promise.all(resultPromise).then((newResult) => {
        return {
          total: result.info.total,
          data: newResult,
        };
      });
    });
  };

  constructor(router, service) {
    this.service = service;
    this.router = router;
    this.uomId = "";
    this.uoms = [];
  }

  contextCallback(event) {
    var arg = event.detail;
    var data = arg.data;
    switch (arg.Name) {
      case "detail":
        this.router.navigateToRoute("view", { id: data.Id });
        break;
    }
  }

  upload() {
    this.router.navigateToRoute("upload");
  }
}
