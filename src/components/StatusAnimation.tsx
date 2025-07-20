
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, ChefHat, Package, XCircle } from "lucide-react";

interface StatusAnimationProps {
  status: string;
  className?: string;
}

const StatusAnimation = ({ status, className = "" }: StatusAnimationProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          label: 'Aguardando',
          color: 'bg-yellow-500',
          animation: 'animate-pulse',
          bgClass: 'bg-yellow-50'
        };
      case 'accepted':
        return {
          icon: CheckCircle,
          label: 'Aceito',
          color: 'bg-blue-500',
          animation: 'animate-bounce',
          bgClass: 'bg-blue-50'
        };
      case 'preparing':
        return {
          icon: ChefHat,
          label: 'Preparando',
          color: 'bg-orange-500',
          animation: 'animate-spin',
          bgClass: 'bg-orange-50'
        };
      case 'ready':
        return {
          icon: Package,
          label: 'Pronto',
          color: 'bg-green-500',
          animation: 'animate-bounce',
          bgClass: 'bg-green-50'
        };
      case 'cancelled':
        return {
          icon: XCircle,
          label: 'Cancelado',
          color: 'bg-red-500',
          animation: '',
          bgClass: 'bg-red-50'
        };
      default:
        return {
          icon: Clock,
          label: status,
          color: 'bg-gray-500',
          animation: '',
          bgClass: 'bg-gray-50'
        };
    }
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  return (
    <Badge className={`${config.color} text-white flex items-center gap-1 ${className}`}>
      <IconComponent className={`h-3 w-3 ${config.animation}`} />
      {config.label}
    </Badge>
  );
};

export default StatusAnimation;
