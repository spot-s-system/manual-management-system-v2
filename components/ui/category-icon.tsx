import {
  Calculator,
  Calendar,
  ClipboardList,
  Clock,
  Download,
  Edit,
  FileText,
  Gift,
  type LucideIcon,
  Settings,
  UserCheck,
  UserMinus,
  UserPlus,
} from "lucide-react";

interface CategoryIconProps {
  iconName: string | null;
  className?: string;
}

const iconMap: Record<string, LucideIcon> = {
  UserPlus,
  Edit,
  ClipboardList,
  UserCheck,
  Gift,
  Calendar,
  UserMinus,
  Clock,
  Calculator,
  Download,
  Settings,
  FileText,
};

export function CategoryIcon({ iconName, className = "w-5 h-5" }: CategoryIconProps) {
  const IconComponent = iconName ? iconMap[iconName] : null;

  if (!IconComponent) {
    return <FileText className={className} />;
  }

  return <IconComponent className={className} />;
}
