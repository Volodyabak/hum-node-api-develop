import { JoinThroughParams } from '../../../Tools/dto/util-classes';

export interface ArtistCategoryJoinParams extends JoinThroughParams {
  excludeCategory?: boolean;
}
