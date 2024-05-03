import { BillingConfig } from '@kit/billing';
import { Database } from '@kit/supabase/database';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { BillingEventHandlerService } from './billing-event-handler.service';
import { BillingEventHandlerFactoryService } from './billing-gateway-factory.service';

/**
 * @description This function retrieves the billing provider from the database and returns a
 * new instance of the `BillingGatewayService` class. This class is used to interact with the server actions
 * defined in the host application.
 */
export async function getBillingEventHandlerService(
  clientProvider: () => ReturnType<typeof getSupabaseServerClient>,
  provider: Database['public']['Enums']['billing_provider'],
  config: BillingConfig,
) {
  const strategy = await BillingEventHandlerFactoryService.GetProviderStrategy(
    provider,
    config,
  );

  return new BillingEventHandlerService(clientProvider, strategy);
}