import { useState } from 'react';
import { IconCalendarStats, IconChevronRight } from '@tabler/icons-react';
import { Link, useLocation } from 'react-router-dom';

import { ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface LinksGroupProps {
  icon: React.FC<any>
  label: string
  initiallyOpened?: boolean
  link?: string
  links?: { label: string; link: string }[]
}

export function LinksGroup({
  icon: Icon,
  label,
  initiallyOpened = false,
  link,
  links,
}: LinksGroupProps) {
  const location = useLocation()
  const hasLinks = Array.isArray(links) && links.length > 0
  const [opened, setOpened] = useState(initiallyOpened)

  // ─────────────────────────────────────────────
  // Case 1: Simple link (no children)
  // ─────────────────────────────────────────────
  if (link && !hasLinks) {
    const isActive = location.pathname === link

    return (
      <Link to={link}>
        <Button
          variant="ghost"
          className={`w-full justify-start gap-3 ${
            isActive ? "bg-primary/10 text-primary" : ""
          }`}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-sm">{label}</span>
        </Button>
      </Link>
    )
  }

  // ─────────────────────────────────────────────
  // Case 2: Collapsible group
  // ─────────────────────────────────────────────
  return (
    <Collapsible open={opened} onOpenChange={setOpened}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between px-3"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
              <Icon className="h-4 w-4" />
            </div>
            <span className="text-sm">{label}</span>
          </div>

          <ChevronRight
            className={`h-4 w-4 transition-transform ${
              opened ? "rotate-90" : ""
            }`}
          />
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="pl-10 pr-2 pb-1 space-y-1">
        {links?.map((item) => {
          const isActive = location.pathname === item.link

          return (
            <Link
              key={item.label}
              to={item.link}
              className={`block rounded-md px-3 py-2 text-xs transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </CollapsibleContent>
    </Collapsible>
  )
}

const mockdata = {
  label: 'Releases',
  icon: IconCalendarStats,
  links: [
    { label: 'Upcoming releases', link: '/' },
    { label: 'Previous releases', link: '/' },
    { label: 'Releases schedule', link: '/' },
  ],
};