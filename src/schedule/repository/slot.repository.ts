import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection, Types, MongooseError } from 'mongoose';
import { AbstractRepository } from 'src/database/abstract.repository';
import { Slot } from '../schemas/slot.schema';

@Injectable()
export class SlotRepository extends AbstractRepository<Slot> {
  protected readonly logger = new Logger(SlotRepository.name);

  constructor(
    @InjectModel(Slot.name)
    slotModel: Model<Slot>,
    @InjectConnection() connection: Connection,
  ) {
    super(slotModel, connection);
  }

  // bulk insert
  async bulkInsert(slots: Slot[]): Promise<Slot[]> {
    try {
      const result = await this.model.insertMany(slots);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteOne(slot_id: string) {
    try {
      await this.model.deleteOne({ slot_id });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async bulkUpdateSlots(slots: Slot[]): Promise<void> {
    try {
      // Update the status of each slot to 'unavailable'
      const bulkOps = slots.map((slot: Slot) => {
        return {
          updateOne: {
            filter: { _id: new Types.ObjectId(slot._id) },
            update: {
              status: 'unavailable',
              updated_at: new Date().toISOString(),
            },
            upsert: true,
          },
        };
      });

      const bulkWriteResult = await this.model.bulkWrite(bulkOps);
      this.logger.debug(
        `Successfully updated ${bulkWriteResult.modifiedCount} slot status.`,
      );
    } catch (error) {
      this.logger.error(`Error updating slot status: ${error.message}`);
      throw new MongooseError(error.message);
    }
  }
}
