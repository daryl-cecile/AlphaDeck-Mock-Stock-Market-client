import * as express from "express";
import {System} from "./internal/config/System";

let bootstrapper = require("./internal/config/setup");

System.rootPath = __dirname;

bootstrapper.bootstrap(express); // run server setup

module.exports = bootstrapper; // for tests