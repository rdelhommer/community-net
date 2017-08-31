var test = require('ava');
var SubNetworkEmailer = require('../index').SubNetworkEmailer;

test.beforeEach(t => {
  var cronMock = {
    CronJob: function (schedule, toInvoke, callback, runImmediately, timezone) {
      this.randomProperty = 'I am so random';

      t.context.data.results.schedule = schedule;
      t.context.data.results.timezone = timezone;
    }
  };

  var transporterMock = {
    sendMail: function (options, callback) {
      if (!t.context.data.results.sendMailTo) {
        t.context.data.results.sendMailTo = [];
      }

      if (!t.context.data.results.sendMailFrom) {
        t.context.data.results.sendMailFrom = [];
      }

      if (!t.context.data.results.sendMailSubject) {
        t.context.data.results.sendMailSubject = [];
      }

      if (!t.context.data.results.sendMailHtml) {
        t.context.data.results.sendMailHtml = [];
      }

      t.context.data.results.sendMailTo.push(options.to);
      t.context.data.results.sendMailFrom.push(options.from);
      t.context.data.results.sendMailSubject.push(options.subject);
      t.context.data.results.sendMailHtml.push(options.html);

      if (t.context.data.throws.sendMail) {
        return callback(new Error('sendMail'));
      }

      return callback();
    }
  };

  var config = {
    from: 'configurable sender',
    subject: 'configurable subject',
    transporter: transporterMock,
    onErrorCallback: function (err) {
      t.context.data.results.errFromCallback = err;
    },
    onSuccessCallback: function () {
      t.context.data.results.onSuccessInvoked = true;
    }
  };

  var dbPluginMock = {
    getUsers: function (onSuccessCallback, onErrorCallback) {
      if (t.context.data.throws.getUsers) {
        return onErrorCallback(new Error('getUsers'));
      }

      return onSuccessCallback([{
        email: 'abel@abel.com'
      }, {
        email: 'bob@bob.com'
      }, {
        email: 'carl@carl.com'
      }, {
        email: 'don@don.com'
      }]);
    },
    getSubNetworkForUser: function (user, query, onSuccessCallback, onErrorCallback) {
      if (t.context.data.throws.getSubNetworkForUser) {
        return onErrorCallback(new Error('getSubNetworkForUser'));
      }

      return onSuccessCallback([{
        name: 'Ronald McDonald',
        needs: [ 'burgers', 'fries', 'slave labor' ],
        skills: [ 'scaring children', 'causing obesity' ]
      }]);
    }
  };

  t.context.data = {
    emailer: new SubNetworkEmailer(cronMock, config, dbPluginMock),
    results: {},
    throws: {}
  };
});

// Cron
test('Default cron schedule is "0 0 0 * * 0"', t => {
  t.context.data.emailer.startCron();

  t.is(t.context.data.results.schedule, '0 0 0 * * 0');
});

test('Default cron timezone is "America/Los_Angeles"', t => {
  t.context.data.emailer.startCron();

  t.is(t.context.data.results.timezone, 'America/Los_Angeles');
});

test('cronJob property set after startCron invoked', t => {
  t.context.data.emailer.startCron();

  t.is(t.context.data.emailer.cronJob.randomProperty, 'I am so random');
});

// Single invocation
test('Email sender configurable', t => {
  t.context.data.emailer.sendSubNetEmail();

  t.is(t.context.data.results.sendMailFrom[0], 'configurable sender');
});

test('Email subject configurable', t => {
  t.context.data.emailer.sendSubNetEmail();

  t.is(t.context.data.results.sendMailSubject[0], 'configurable subject');
});

test('getUsers error - correct callback invoked', t => {
  t.context.data.throws.getUsers = true;
  t.context.data.emailer.sendSubNetEmail();

  t.is(t.context.data.results.errFromCallback.message, 'getUsers');
});

test('getSubNetworkForUser error - correct callback invoked', t => {
  t.context.data.throws.getSubNetworkForUser = true;
  t.context.data.emailer.sendSubNetEmail();

  t.is(t.context.data.results.errFromCallback.message, 'getSubNetworkForUser');
});

test('sendMail error - correct callback invoked', t => {
  t.context.data.throws.sendMail = true;
  t.context.data.emailer.sendSubNetEmail();

  t.is(t.context.data.results.errFromCallback.message, 'sendMail');
});

test('all users processed', t => {
  t.context.data.emailer.sendSubNetEmail();

  t.deepEqual(t.context.data.results.sendMailTo, ['abel@abel.com', 'bob@bob.com', 'carl@carl.com', 'don@don.com']);
});

test('success callback invoked', t => {
  t.context.data.emailer.sendSubNetEmail();

  t.true(t.context.data.results.onSuccessInvoked);
});

test('email body correctly generated', t => {
  var expectedBody =
    '<h1>Your Network</h1>' +
    '<p>The following is a list of nearby people in your network along with their needs and skills.</p>' +
    '<h2>Ronald McDonald</h2>' +
    '<h3>Skills</h3>' +
    '<ul>' +
      '<li>scaring children</li>' +
      '<li>causing obesity</li>' +
    '</ul>' +
    '<h3>Needs</h3>' +
    '<ul>' +
      '<li>burgers</li>' +
      '<li>fries</li>' +
      '<li>slave labor</li>' +
    '</ul>';

  t.context.data.emailer.sendSubNetEmail();
  t.is(t.context.data.results.sendMailHtml[0], expectedBody);
});