import { Model } from 'objection';
import { ScheduledTaskType } from '../../../src/modules/tasks/interfaces/scheduled-task.interface';
import { Environment } from '../../../src/constants';

export class ScheduledTaskModel extends Model {
  id: number;
  stage: Environment;
  type: ScheduledTaskType;
  name: string;
  data: string;
  timestamp: Date;

  static get tableName() {
    return 'labl.scheduled_task';
  }

  static get idColumn() {
    return 'id';
  }
}
