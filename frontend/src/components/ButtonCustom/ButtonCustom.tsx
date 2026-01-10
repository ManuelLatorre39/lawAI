import {
  IconCalendar,
  IconChevronDown,
  IconPackage,
  IconSquareCheck,
  IconUsers,
} from '@tabler/icons-react';
import { Button, Menu, Text, useMantineTheme } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

export function ButtonCustom({ label, onClick }: { label: string, onClick: any}) {
  const theme = useMantineTheme();
  const navigate = useNavigate()
  return (
    <Menu
      transitionProps={{ transition: 'pop-top-right' }}
      position="top-end"
      width={220}
      withinPortal
      radius="md"
    >
      <Menu.Target>
        <Button radius="md" onClick={onClick} >
          {label}
        </Button>
      </Menu.Target>
    </Menu>
  );
}