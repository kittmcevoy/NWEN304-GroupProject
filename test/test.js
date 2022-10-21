const expect = require('chai').expect;
const assert = require('assert');
const request = require('request');
const User = require('../js/User');
const { app, mongoose } = require('../js/index');

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

describe('Database', function () {
    it('Create document', (done) => {
        const newUser = new User({ username: 'mongotest' });
        newUser.save().then(() => {
            assert(!newUser.isNew);
            done();
        });
    });
});

describe('Authorisation', function () {
    it('Not logged in', (done) => {
        done();
    });
});
