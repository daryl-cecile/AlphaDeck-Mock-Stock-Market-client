// This is here to future-proof testing

let chai = require('chai');
let chaiHttp = require('chai-http');
let bootstrapper = require('../index');
let sqlConn = require("./../internal/config/DBConnection");
let eventManager = require("./../internal/config/GlobalEvents");
let should = chai.should();
let system = require("./../internal/config/System");
let server;

bootstrapper.enableTestMode();

chai.use(chaiHttp);

describe('Server start', ()=>{

    it("Stack should load successfully", (done) => {
        eventManager.listen("STACK_READY",function(){
            done();
        },{ singleUse:true, autoTriggerIfMissed: true });
    });

    it("server should start successfully", (done) => {
        eventManager.listen("APP_READY",function(){
            done();
        },{ singleUse:true ,autoTriggerIfMissed: true });
    });

    it("DB should connect successfully", (done) => {
        eventManager.listen("DB_READY",function(){
            done();
        },{ singleUse:true, autoTriggerIfMissed: true });
    });

});

describe('Requests', () => {

    it('GET / should be successful', async () => {
        server = await bootstrapper.getServer();

        chai.request(server)
            .get('/')
            .end((err, res) => {
                res.should.have.status(200);
                res.text.length.should.not.be.eql(0);
            });
    });

    it('GET /fake should not be successful', async () => {
        server = await bootstrapper.getServer();

        chai.request(server)
            .get('/fake')
            .end((err, res) => {
                res.should.have.status(404);
            });
    });

});

describe('Server close', ()=>{

    it("server should end successfully", async () => {
        system.System.attemptSafeTerminate();
    });

});