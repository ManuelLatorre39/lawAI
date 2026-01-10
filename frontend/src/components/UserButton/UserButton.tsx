import { IconChevronRight, IconLogout } from '@tabler/icons-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ChevronRight, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from '@/contexts/AuthContext';

export function UserButton() {
  const { user, logout } = useAuth()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 py-2"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-8.png" />
            <AvatarFallback>
              {user?.username?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-1 flex-col items-start text-left">
            <span className="text-sm font-medium leading-none">
              {user?.username ?? "User"}
            </span>
            <span className="text-xs text-muted-foreground">
              {user?.email ?? "@mail.com"}
            </span>
          </div>

          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}