// const { scheduleJob, rescheduleJob, cancelJob, scheduledJobs } = require('node-schedule');
//
// module.exports.scheduleJob = (name, time, callback) => {
//   return scheduleJob(name, time, callback);
// };
//
// module.exports.rescheduleJob = (name, newTime) => {
//   const job = scheduledJobs[name];
//   if (job) {
//     rescheduleJob(name, newTime);
//   }
// };
//
// module.exports.cancelJob = (name) => {
//   const job = scheduledJobs[name];
//   if (job) {
//     cancelJob(name);
//   }
// };
//
// module.exports.isJobScheduled = (name) => {
//   return !!scheduledJobs[name];
// };
