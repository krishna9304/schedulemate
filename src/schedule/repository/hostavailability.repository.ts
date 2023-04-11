import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
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
}
