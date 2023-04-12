import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection, Types, MongooseError } from 'mongoose';
import { AbstractRepository } from 'src/database/abstract.repository';
import { HostAvailability } from '../schemas/hostavailability.schema';

@Injectable()
export class HostAvailabilityRepository extends AbstractRepository<HostAvailability> {
  protected readonly logger = new Logger(HostAvailabilityRepository.name);

  constructor(
    @InjectModel(HostAvailability.name)
    hostAvailabilityModel: Model<HostAvailability>,
    @InjectConnection() connection: Connection,
  ) {
    super(hostAvailabilityModel, connection);
  }

  async bulkUpdateAvailabilties(
    availabilities: HostAvailability[],
  ): Promise<void> {
    try {
      // Update the status of each availability to 'inactive'
      const bulkOps = availabilities.map((availability: HostAvailability) => {
        return {
          updateOne: {
            filter: { _id: new Types.ObjectId(availability._id) },
            update: {
              status: 'inactive',
              updated_at: new Date().toISOString(),
            },
            upsert: true,
          },
        };
      });

      const bulkWriteResult = await this.model.bulkWrite(bulkOps);
      this.logger.debug(
        `Successfully updated ${bulkWriteResult.modifiedCount} availabilty status.`,
      );
    } catch (error) {
      this.logger.error(`Error updating availabilty status: ${error.message}`);
      throw new MongooseError(error.message);
    }
  }
}
