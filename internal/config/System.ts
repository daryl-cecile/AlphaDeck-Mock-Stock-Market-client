import {SystemLogEntryModel} from "../models/SystemLogEntryModel";
import {SystemLogRepository} from "../Repository/SystemLogRepository";
import {XError} from "./XError";
import {CookieStore} from "./CookieHelper";
import {dbConnector as db} from "./DBConnection";
import * as core from "express-serve-static-core";
import {RouterSet} from "./RouterSet";

const eventManager = require('./GlobalEvents');

export namespace System{

    const backlog:SystemLogEntryModel[] = [];
    let interval = null;
    let isProd:boolean = null;
    let ignoreOutput:boolean = false;

    export let rootPath:string = "";

    export let cookieStore:CookieStore;
    export let Cache = {};

    export const InstanceId = require("crypto").randomBytes(12).toString('hex');

    type SystemBuildInfo = {
        last_build:string,
        last_hash:string,
        version:string
    };

    export function isProduction(){
        // check if .env file exists; if so, we are running dev mode, otherwise prod
        if (isProd === null) isProd = (process.env?.CI == "true");
        return isProd;
    }

    export enum ERRORS{
        UNKNOWN = 0x99,
        CALLBACK_ERR = 0x05,
        SIGNAL_ERR = 0x03,
        DB_BOOT = 0x02,
        APP_BOOT= 0x01,
        NORMAL = 0x00,
        NONE = 0x00
    }

    export async function fatal(err:Error, errcode?:System.ERRORS, extraInfo?:string){
        await System.error(err, errcode, extraInfo);
        attemptSafeTerminate();
    }

    export async function error(err:Error,errcode?:System.ERRORS,extraInfo?:string){
        let e = XError.createFrom(err);
        let rSF = e.stackFrames[0];
        let message = e.message;

        if (extraInfo) message += "\n\n\t" + extraInfo;

        await System.log(e.type, `${rSF.fileName}:${rSF.lineNumber}:${rSF.columnNumber}\n\t${message}`, errcode);
    }

    export async function log(title:string, message:string, errCode?:System.ERRORS){

        if (ignoreOutput) return;

        if (!errCode) errCode = System.ERRORS.NONE;
        let err_code_normalized = System.ERRORS[errCode];

        if (System.isProduction()){
            let entry = new SystemLogEntryModel();
            entry.title = title;
            entry.message = message;
            entry.errorCode = err_code_normalized;
            entry.reference = System.InstanceId;

            if ( backlog.length > 0 || SystemLogRepository.isConnectionReady() === false ){
                pushToBacklog(entry);
            }
            else{
                await SystemLogRepository.save(entry);
            }
        }
        else{
            console.group("System Log");
            console.log("Title: " + title);
            console.log("Message: " + message);
            console.log("ErrCode: " + err_code_normalized);
            console.log("");
            console.groupEnd();
        }
    }

    export function AutoErrorHandler(err , optionalExtraInfo?:string, callback?:Function){
        if (err){
            System.error(err, ERRORS.CALLBACK_ERR ,optionalExtraInfo);
        }
        if (callback) callback(err);
    }

    export function haltOutput(){
        ignoreOutput = true;
    }

    export function releaseOutput(){
        ignoreOutput = false;
    }

    function pushToBacklog(logEntry:SystemLogEntryModel){

        backlog.push(logEntry);

        if (backlog.length !== 0 && interval === null){
            interval = setInterval(async ()=>{
                if ( SystemLogRepository.isConnectionReady() ){
                    clearInterval(interval);
                    interval = null;
                    while (backlog.length > 0){
                        let entry = backlog.shift();
                        await SystemLogRepository.save(entry);
                    }
                }
            },500).unref();
        }

    }

    function flushBacklog(){
        while (backlog.length > 0){
            let entry = backlog.shift();
            console.group("System Log Flush");
            console.log("Title: " + entry.title);
            console.log("Message: " + entry.message);
            console.log("ErrCode: " + entry.errorCode);
            console.log("");
            console.groupEnd();
        }
    }

    function signal(code:string){
        return err => {
            if (err && err.stack) System.error(err, ERRORS.SIGNAL_ERR, "Signal received with error");
            else System.log("Signal", code, ERRORS.NONE);
            System.attemptSafeTerminate();
        }
    }

    export function attemptSafeTerminate(){
        System.log("Status","Attempting safe terminate");
        let eventManager = require("./GlobalEvents");

        if (backlog.length > 0) flushBacklog(); // flushes backlog into stdout

        eventManager.listen("UNLOADED", ()=>{
            setTimeout(process.exit,1000).unref()
        }, { singleUse: true });

        eventManager.trigger("TERMINATE"); // tell app to shutdown
    }

    export function attachTerminateListeners(server){

        // catch app level errors in case
        process.on("uncaughtException",err => {
            System.fatal(err, System.ERRORS.APP_BOOT,"uncaughtException");
        });

        // catch process shutdown requests
        process.on("SIGTERM", signal("SIGTERM"));
        process.on("SIGINT", signal("SIGINT"));

        eventManager.listen("QUIT", ()=>{
            console.warn("Quitting...");
            // give app 5s to respond to shutdown request. If it takes longer, it will be killed with code of 1
            setTimeout(process.exit,5000, 1).unref()
        }, { singleUse: true });

        // listen for terminate events and gracefully release resources
        eventManager.listen("TERMINATE", async ()=>{

            let allLogs = await SystemLogRepository.getAll();
            allLogs.forEach(element => {
                if(Date.now() >= element.expiry.getTime()){
                    SystemLogRepository.delete(element);
                }
            });

            db.end().then(()=>{
                server.close(()=>{
                    if (db.isReleased) eventManager.trigger("UNLOADED");
                    else eventManager.trigger("QUIT");
                });
            });
        },{ singleUse: true });

    }

    export function loader(app:core.Express){
        let loaders = {
            registerBaseControllers : (...routers:RouterSet[])=>{
                let hostRouter = require('express').Router();
                routers.forEach(r => {
                    hostRouter = r.getRouter(hostRouter);
                    app.use("/", hostRouter);
                });
                return loaders;
            },
            registerEndpointControllers: (...routers:RouterSet[])=>{
                let hostRouter = require('express').Router();
                routers.forEach(r => {
                    hostRouter = r.getRouter(hostRouter);
                    app.use("/api", hostRouter);
                });
                return loaders;
            }
        };

        return loaders;
    }

    export function getBuildInfo():SystemBuildInfo{
        if (System.Cache['buildInfo']){
            return System.Cache['buildInfo'];
        }

        let path = require("path");
        let fs = require("fs");

        let c = fs.readFileSync( path.join(System.rootPath,"public/build_info.json") , "utf-8" );
        let r = JSON.parse(c);

        System.Cache['buildInfo'] = r;

        return r;
    }

    export namespace Middlewares{

        export function LogRequest(){
            return function(req,res,next){
                System.log("Request", req.url, System.ERRORS.NORMAL);
                next();
            }
        }

        export function CookieHandler(){
            return function(req, res, next){
                cookieStore = new CookieStore(req, res);
                next();
            }
        }

        export function CSRFHandler(){
            const CSRFCookieName = "_csrf";
            return function (req, res, next){
                if ( req.url.startsWith("/api/") ){
                    let cookieCSRF = cookieStore.get(CSRFCookieName);

                    if (cookieCSRF === undefined){
                        res.status(403);
                        res.send('CSRF token invalid');
                    }
                    else{
                        let providedCSRFToken = req.header('CSRF-Token') ?? req.header('X-CSRF-TOKEN') ?? req.query['CSRF_Token'] ?? req.body['CSRF_Token'];
                        if (providedCSRFToken === undefined || providedCSRFToken !== cookieCSRF){
                            res.status(403);
                            res.send('CSRF token mismatch');
                        }
                        else{
                            next();
                        }
                    }

                }
                else{
                    let csrfToken = require("crypto").randomBytes(32).toString('hex');
                    cookieStore.set(CSRFCookieName, csrfToken, {overwrite: true});
                    req.csrfToken = function(){ return csrfToken };
                    next();
                }
            }
        }

    }

}

module.exports.default = System;