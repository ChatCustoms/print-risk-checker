import type { ReactNode } from 'react';

interface PrintPlanCardProps {
  icon: string;
  title: string;
  children: ReactNode;
}

export const PrintPlanCard = ({ icon, title, children }: PrintPlanCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center space-x-3 mb-4">
        <div className="text-3xl">{icon}</div>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      </div>
      <div className="text-gray-700">{children}</div>
    </div>
  );
};
