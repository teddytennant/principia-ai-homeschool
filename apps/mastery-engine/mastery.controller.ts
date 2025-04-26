import { Controller, Post, Body } from '@nestjs/common';
import { MasteryService } from './mastery.service';

@Controller('mastery')
export class MasteryController {
  constructor(private readonly masteryService: MasteryService) {}

  @Post('evaluate')
  async evaluate(@Body() body: any) {
    return this.masteryService.evaluate(body);
  }
}
