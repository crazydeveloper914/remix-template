import { ActionFunctionArgs } from '@remix-run/node';

import { getBillingEventHandlerService } from '@kit/billing-gateway';
import { getLogger } from '@kit/shared/logger';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import billingConfig from '~/config/billing.config';

/**
 * @description Handle the webhooks from Stripe related to checkouts
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const provider = billingConfig.provider;
  const logger = await getLogger();

  const ctx = {
    name: 'billing.webhook',
    provider,
  };

  logger.info(ctx, `Received billing webhook. Processing...`);

  const supabaseClientProvider = () => getSupabaseServerAdminClient();

  const service = await getBillingEventHandlerService(
    supabaseClientProvider,
    provider,
    billingConfig,
  );

  try {
    await service.handleWebhookEvent(request);

    logger.info(ctx, `Successfully processed billing webhook`);

    return new Response('OK', { status: 200 });
  } catch (error) {
    logger.error(ctx, `Failed to process billing webhook`, error);

    return new Response('Failed to process billing webhook', {
      status: 500,
    });
  }
};