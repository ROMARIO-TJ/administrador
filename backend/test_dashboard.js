import { DashboardService } from './src/modules/dashboard/dashboard.service.js';

async function test() {
  try {
    const stats = await DashboardService.getStats();
    console.log(stats);
  } catch (err) {
    console.error(err);
  }
}

test().finally(() => process.exit(0));
