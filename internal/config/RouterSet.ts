import {Router} from "express";

export class RouterSet {

    constructor(private handler:(route:Router)=>Router) { }

    public getRouter(baseRouter:Router=require('express').Router()):Router{
        return this.handler(baseRouter);
    }

}