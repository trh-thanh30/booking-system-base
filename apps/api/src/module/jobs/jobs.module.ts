import { Module } from '@nestjs/common';
import { ExampleService } from '@/module/jobs/example.service';

@Module({
  providers: [ExampleService],
})
export class JobsModule {}
