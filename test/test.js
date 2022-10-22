const chai = require('chai');
const chai_http = require('chai-http');
const expect = require('chai').expect;
const request = require('request');
const app = 'http://localhost:3000';
chai.use(chai_http);

describe('Status codes, not logged in', function () {
    describe('Allow access', function () {
        it('Home page', (done) => {
            chai.request(app)
                .get('/')
                .send()
                .end(function (err, res) {
                    expect(res.statusCode).to.equal(200);
                    done();
                });
        });

        it('Login page', (done) => {
            chai.request(app)
                .get('/login')
                .send()
                .end(function (err, res) {
                    expect(res.statusCode).to.equal(200);
                    done();
                });
        });

        it('Browse page', (done) => {
            chai.request(app)
                .get('/browse')
                .send()
                .end(function (err, res) {
                    expect(res.statusCode).to.equal(200);
                    done();
                });
        });
    });

    describe('Deny access', function () {
        it('Add item page', function (done) {
            request(
                'http://localhost:3000/add-item',
                function (error, res, body) {
                    expect(res.body).to.contain(403);
                    done();
                }
            );
        });
        it('Cart page', function (done) {
            request('http://localhost:3000/cart', function (error, res, body) {
                expect(res.body).to.contain(403);
                done();
            });
        });
    });
});

describe('API pages', function () {
    it('Get items', (done) => {
        chai.request(app)
            .get('/api/items/1')
            .end(function (err, res) {
                expect(res.statusCode).to.equal(200);
                done();
            });
    });

    it('Get users', (done) => {
        chai.request(app)
            .get('/api/users/1')
            .end(function (err, res) {
                expect(res.statusCode).to.equal(200);
                done();
            });
    });
});

describe('API return bodies', function () {
    var items = [];
    var users = [];

    it('Should return array of items', (done) => {
        chai.request(app)
            .get('/api/items')
            .end((err, res) => {
                expect(res.statusCode).to.equal(200);
                items = res.body;
                expect(Array.isArray(items));
                expect(items.length > 0);
                done();
            });
    });

    it('Should return array of users', (done) => {
        chai.request(app)
            .get('/api/users')
            .end((err, res) => {
                expect(res.statusCode).to.equal(200);
                users = res.body;
                expect(Array.isArray(users));
                expect(users.length > 0);
                done();
            });
    });
});

describe('API workload', function () {
    it('Get 1 item', (done) => {
        chai.request(app)
            .get('/api/items/1')
            .end(function (err, res) {
                expect(res.statusCode).to.equal(200);
                done();
            });
    });

    it('Get 1 user', (done) => {
        chai.request(app)
            .get('/api/users/1')
            .end(function (err, res) {
                expect(res.statusCode).to.equal(200);
                done();
            });
    });

    it('Get all items', (done) => {
        chai.request(app)
            .get('/api/items')
            .end(function (err, res) {
                expect(res.statusCode).to.equal(200);
                done();
            });
    });

    it('Get all users', (done) => {
        chai.request(app)
            .get('/api/users')
            .end(function (err, res) {
                expect(res.statusCode).to.equal(200);
                done();
            });
    });
});

// describe('Status codes, logged in', function () {
//     it('Login user', (done) => {
//         chai.request(app)
//             .post('/local-login')
//             .set('Content-Type', 'application/json')
//             .send({
//                 username: 'test',
//                 password: 'pass123!@#',
//             })
//             .end(function (err, res) {
//                 expect(res.status).to.equal(200);
//                 done();
//             });
//     });
//     it('Add item page', function (done) {
//         request('http://localhost:3000/add-item', function (error, res, body) {
//             expect(res.body).to.contain(200);
//             done();
//         });
//     });
//     it('Cart page', function (done) {
//         request('http://localhost:3000/cart', function (error, res, body) {
//             expect(res.body).to.contain(200);
//             done();
//         });
//     });
//     it('Logs user out', (done) => {
//         chai.request(app)
//             .get('/logout')
//             .end(function (err, res) {
//                 expect(res.status).to.equal(200);
//                 done();
//             });
//     });
// });
