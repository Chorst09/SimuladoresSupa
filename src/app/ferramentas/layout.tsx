import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ferramentas | Sistema',
  description: 'Ferramentas e utilitários do sistema',
};

export default function FerramentasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {children}
    </div>
  );
}