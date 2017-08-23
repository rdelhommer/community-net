var test = require('ava');

// Cron
test.todo('Default cron schedule is "0 0 0 * * 0"');
test.todo('Default cron timezone is "America/Los_Angles"');
test.todo('cronJob property set after startCron invoked');

// Single invocation
test.todo('Email sender configurable');
test.todo('Email subject configurable');
test.todo('getUsers error - correct callback invoked');
test.todo('getSubNetwork error - correct callback invoked');
test.todo('sendmail error - correct callback invoked');
test.todo('all users processed');
test.todo('success callback invoked');