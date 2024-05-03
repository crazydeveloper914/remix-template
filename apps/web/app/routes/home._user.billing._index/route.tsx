import { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { Form, json, useLoaderData } from '@remix-run/react';

import {
  BillingPortalCard,
  CurrentLifetimeOrderCard,
  CurrentSubscriptionCard,
} from '@kit/billing-gateway/components';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { If } from '@kit/ui/if';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import billingConfig from '~/config/billing.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { requireUserLoader } from '~/lib/require-user-loader';
import { HomeLayoutPageHeader } from '~/routes/home._user/_components/home-page-header';

import { PersonalAccountCheckoutForm } from './_components/personal-account-checkout-form';
import { loadPersonalAccountBillingPageData } from './_lib/load-personal-account-billing.server';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: data?.title,
    },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const client = getSupabaseServerClient(request);
  const user = await requireUserLoader(client);
  const { t } = await createI18nServerInstance(request);

  const [data, customerId] = await loadPersonalAccountBillingPageData({
    userId: user.id,
    client,
  });

  return json({
    title: t('account:billingTab'),
    data,
    customerId,
  });
};

export default function PersonalAccountBillingPage() {
  const { data, customerId } = useLoaderData<typeof loader>();

  return (
    <>
      <HomeLayoutPageHeader
        title={<Trans i18nKey={'common:billingTabLabel'} />}
        description={<Trans i18nKey={'common:billingTabDescription'} />}
      />

      <PageBody>
        <div className={'flex flex-col space-y-4'}>
          <If condition={!data}>
            <PersonalAccountCheckoutForm customerId={customerId} />

            <If condition={customerId}>
              <CustomerBillingPortalForm />
            </If>
          </If>

          <If condition={data}>
            {(data) => (
              <div
                className={'mx-auto flex w-full max-w-2xl flex-col space-y-6'}
              >
                {'active' in data ? (
                  <CurrentSubscriptionCard
                    subscription={data}
                    config={billingConfig}
                  />
                ) : (
                  <CurrentLifetimeOrderCard
                    order={data}
                    config={billingConfig}
                  />
                )}

                <If condition={!data}>
                  <PersonalAccountCheckoutForm customerId={customerId} />
                </If>

                <If condition={customerId}>
                  <CustomerBillingPortalForm />
                </If>
              </div>
            )}
          </If>
        </div>
      </PageBody>
    </>
  );
}

function CustomerBillingPortalForm() {
  return (
    <Form action={'/api/billing/customer-portal'}>
      <input type="hidden" name={'intent'} value={'personal-account-billing-portal'} />

      <BillingPortalCard />
    </Form>
  );
}