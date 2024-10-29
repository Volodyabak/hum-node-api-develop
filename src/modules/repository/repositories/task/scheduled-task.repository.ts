import { Injectable } from '@nestjs/common';
import { PartialModelObject } from 'objection';
import { ScheduledTaskModel } from '../../../../../database/Models/TaskScheduler/ScheduledTaskModel';

@Injectable()
export class ScheduledTaskRepository {
  createOrUpdateScheduledTask(data: PartialModelObject<ScheduledTaskModel>) {
    return ScheduledTaskModel.query().insertAndFetch(data).onConflict().merge(['timestamp']);
  }

  deleteScheduledTaskById(id: number) {
    return ScheduledTaskModel.query().deleteById(id);
  }

  findScheduledTasks(data: PartialModelObject<ScheduledTaskModel>) {
    return ScheduledTaskModel.query().where(data);
  }
}
