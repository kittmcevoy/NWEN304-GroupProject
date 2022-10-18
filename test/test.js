const expect = require('chai').expect;
const request = require('request');

describe('Status codes', function () {
    it('Main page status', function (done) {
        request('http://localhost:3000', function (error, response, body) {
            expect(response.statusCode).to.equal(200);
            done();
        });
    });

    it('Login page status', function (done) {
        request(
            'http://localhost:3000/login',
            function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                done();
            }
        );
    });
});

describe('Authorisation', function () {});
