import {
  IconAdjustments,
  IconCalendarStats,
  IconFileAnalytics,
  IconGauge,
  IconLock,
  IconNotes,
  IconPresentationAnalytics,
} from '@tabler/icons-react';
import { ScrollArea } from "@/components/ui/scroll-area"
import { LegalAILogo } from './Logo';
import { LinksGroup } from '../NavbarLinksGroup/NavbarLinksGroup';
import { UserButton } from '../UserButton/UserButton';
import { useAuth } from '@/contexts/AuthContext';

const mockdata = [
  { label: 'Dashboard', icon: IconGauge },
  {
    label: 'Market news',
    icon: IconNotes,
    initiallyOpened: true,
    links: [
      { label: 'Overview', link: '/' },
      { label: 'Forecasts', link: '/' },
      { label: 'Outlook', link: '/' },
      { label: 'Real time', link: '/' },
    ],
  },
  {
    label: 'Releases',
    icon: IconCalendarStats,
    links: [
      { label: 'Upcoming releases', link: '/' },
      { label: 'Previous releases', link: '/' },
      { label: 'Releases schedule', link: '/' },
    ],
  },
  { label: 'Analytics', icon: IconPresentationAnalytics },
  { label: 'Contracts', icon: IconFileAnalytics },
  { label: 'Settings', icon: IconAdjustments },
  {
    label: 'Security',
    icon: IconLock,
    links: [
      { label: 'Enable 2FA', link: '/' },
      { label: 'Change password', link: '/' },
      { label: 'Recovery codes', link: '/' },
    ],
  },
];

type NavbarNestedProps = {
  data: any[]
}

export function NavbarNested({ data }: NavbarNestedProps) {
  return (
    <nav className="flex h-full w-64 flex-col border-r bg-muted/40">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <LegalAILogo
          name="Lexa"
          className="h-8 text-foreground"
        />
        <span className="font-mono text-xs font-semibold text-muted-foreground">
          v1.0.0
        </span>
      </div>

      {/* Links */}
      <ScrollArea className="flex-1 px-2 py-4">
        <div className="space-y-1">
          {data.map((item) => (
            <LinksGroup key={item.label} {...item} />
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-3">
        <UserButton />
      </div>
    </nav>
  )
}