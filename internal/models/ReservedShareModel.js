"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const IModel_1 = require("./IModel");
const StockModel_1 = require("./StockModel");
const UserModel_1 = require("./UserModel");
let ReservedShareModel = class ReservedShareModel extends IModel_1.BaseModel {
    setExpiry() {
        this.expiry = new Date(Date.now() + 2 * 60000);
    }
    get IsValid() {
        return (Date.now() < this.expiry.getTime() + (2 * 60 * 1000));
    }
};
__decorate([
    typeorm_1.Column("integer"),
    __metadata("design:type", Number)
], ReservedShareModel.prototype, "quantity", void 0);
__decorate([
    typeorm_1.ManyToOne(type => UserModel_1.UserModel),
    typeorm_1.JoinColumn(),
    __metadata("design:type", UserModel_1.UserModel)
], ReservedShareModel.prototype, "owner", void 0);
__decorate([
    typeorm_1.ManyToOne(type => StockModel_1.StockModel),
    typeorm_1.JoinTable(),
    __metadata("design:type", StockModel_1.StockModel)
], ReservedShareModel.prototype, "stockInfo", void 0);
__decorate([
    typeorm_1.Column("datetime"),
    __metadata("design:type", Date)
], ReservedShareModel.prototype, "expiry", void 0);
__decorate([
    typeorm_1.BeforeInsert(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReservedShareModel.prototype, "setExpiry", null);
ReservedShareModel = __decorate([
    typeorm_1.Entity("reserved_shares")
], ReservedShareModel);
exports.ReservedShareModel = ReservedShareModel;
//# sourceMappingURL=ReservedShareModel.js.map