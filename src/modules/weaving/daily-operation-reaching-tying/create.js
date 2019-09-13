import {
  inject,
  bindable,
  BindingEngine,
  Lazy
} from "aurelia-framework";
import {
  Router
} from "aurelia-router";
import {
  Service
} from "./service";
import moment from 'moment';
var UnitLoader = require("../../../loader/unit-loader");
var MachineLoader = require("../../../loader/weaving-machine-loader");
// var ConstructionLoader = require("../../../loader/weaving-constructions-loader");
var OrderLoader = require("../../../loader/weaving-order-loader");
var OperatorLoader = require("../../../loader/weaving-operator-loader");
var BeamLoader = require("../../../loader/weaving-beam-loader");
@inject(Service, Router, BindingEngine)
export class Create {
  @bindable readOnly;
  @bindable MachineDocument;
  @bindable WeavingDocument;
  // @bindable ConstructionDocument;
  @bindable OrderDocument;
  @bindable OperatorDocument;
  @bindable EntryTime;
  @bindable BeamsWarping;

  beamColumns = [{
    value: "BeamNumber",
    header: "Nomor Beam Warping"
  }, {
    value: "YarnStrands",
    header: "Helai Benang Beam Warping"
  }];

  constructor(service, router, bindingEngine) {
    this.router = router;
    this.service = service;
    this.bindingEngine = bindingEngine;
    this.data = {};
    this.error = {};
  }

  formOptions = {
    cancelText: 'Kembali',
    saveText: 'Simpan',
  };

  get machines() {
    return MachineLoader;
  }

  get units() {
    return UnitLoader;
  }

  // get constructions() {
  //   return ConstructionLoader;
  // }

  get orders() {
    return OrderLoader;
  }

  get beams() {
    return BeamLoader;
  }

  get operators() {
    return OperatorLoader;
  }

  OrderDocumentChanged(newValue) {
    if (newValue) {
      let constructionId = newValue.ConstructionId;
      let weavingUnitId = newValue.WeavingUnit;
      this.service.getConstructionNumberById(constructionId)
        .then(resultConstructionNumber => {
          this.error.ConstructionNumber = "";
          this.ConstructionNumber = resultConstructionNumber;
          return this.service.getUnitById(weavingUnitId);
        })
        .then(resultWeavingUnit => {
          this.error.WeavingUnitDocument = "";
          this.WeavingUnitDocument = resultWeavingUnit.Name;
        })
        .catch(e => {
          this.ConstructionNumber = "";
          this.WeavingUnitDocument = "";

          this.error.ConstructionNumber = " Nomor Konstruksi Tidak Ditemukan ";
          this.error.WeavingUnitDocument = " Unit Weaving Tidak Ditemukan ";
        });
    }
  }

  OperatorDocumentChanged(newValue) {
    this.SizingGroup = newValue.Group;
  }

  EntryTimeChanged(newValue) {
    this.service.getShiftByTime(newValue)
      .then(result => {
        this.error.Shift = "";
        this.Shift = {};
        this.Shift = result;
        this.data.ShiftDocumentId = this.Shift.Id;
      })
      .catch(e => {
        this.Shift = {};
        this.data.ShiftDocumentId = this.Shift.Id;
        this.error.Shift = " Shift tidak ditemukan ";
      });
  }

  saveCallback(event) {
    this.data.MachineDocumentId = this.MachineDocument.Id;
    this.data.WeavingUnitId = this.WeavingUnitDocument.Id;
    // this.data.ConstructionDocumentId = this.ConstructionDocument.Id;
    this.data.OrderDocumentId = this.OrderDocument.Id;
    this.data.SizingBeamId = this.SizingBeamDocument.Id
    // this.data.PISPieces = this.PISPieces;
    this.data.OperatorDocumentId = this.OperatorDocument.Id;

    var EntryDateContainer = this.EntryDate;
    this.data.EntryDate = moment(EntryDateContainer).utcOffset("+07:00").format();
    this.data.EntryTime = this.EntryTime;
    this.data.ShiftDocumentId = this.Shift.Id;
    
    this.service
      .create(this.data)
      .then(result => {
        this.router.navigateToRoute('list');
      })
      .catch(e => {
        this.error = e;
      });
  }

  cancelCallback(event) {
    this.router.navigateToRoute('list');
  }
}
