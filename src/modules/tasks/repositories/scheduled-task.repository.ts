// import { Injectable } from '@nestjs/common';
// import { ScheduledTaskModel } from '../../../../database/Models/TaskScheduler/ScheduledTaskModel';
// import { PartialModelObject } from 'objection';
// import { ScheduledTaskType } from '../interfaces/scheduled-task.interface';
// import { Environment } from '../../../constants';
//
// @Injectable()
// export class ScheduledTaskRepository {
//   createScheduledTaskIfNotExistsQB(data: PartialModelObject<ScheduledTaskModel>) {
//     return ScheduledTaskModel.query().insertAndFetch(data).onConflict().merge(['timestamp']);
//   }
//
//   deleteScheduledTaskQB(id: number) {
//     return ScheduledTaskModel.query().deleteById(id);
//   }
//
//   getScheduledTasksByTypeQB(type: ScheduledTaskType) {
//     return ScheduledTaskModel.query().where({ type });
//   }
//
//   getScheduledTasksByStage(stage: Environment) {
//     return ScheduledTaskModel.query().where({ stage });
//   }
// }
