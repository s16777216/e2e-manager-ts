import { Separator } from 'src/components/ui/separator'

import PersonalInfo from 'src/components/shadcn-studio/blocks/account-settings-01/content/personal-info'
import EmailPass from 'src/components/shadcn-studio/blocks/account-settings-01/content/email-password'
import ConnectAccount from 'src/components/shadcn-studio/blocks/account-settings-01/content/connect-account'
import SocialUrl from 'src/components/shadcn-studio/blocks/account-settings-01/content/social-url'
import DangerZone from 'src/components/shadcn-studio/blocks/account-settings-01/content/danger-zone'

const UserGeneral = () => {
  return (
    <section className='py-3'>
      <div className='mx-auto max-w-7xl'>
        <PersonalInfo />
        <Separator className='my-10' />
        <EmailPass />
        <Separator className='my-10' />
        <ConnectAccount />
        <Separator className='my-10' />
        <SocialUrl />
        <Separator className='my-10' />
        <DangerZone />
      </div>
    </section>
  )
}

export default UserGeneral
